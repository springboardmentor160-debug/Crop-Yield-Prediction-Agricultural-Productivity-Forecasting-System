from __future__ import annotations

import json
import math
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.agriculture import (
    HistoricalCropYield,
)
from app.models.crop_recommendation import (
    CropRecommendation,
)
from app.models.user import User
from app.schemas.crop_recommendation import (
    CropRecommendationRequest,
)
from app.services.prediction_service import (
    PREDICTION_UNIT,
    PRODUCTION_UNIT,
    build_model_dataframe,
    ensure_finite_number,
    get_active_accessible_farm,
    resolve_soil_reference,
    resolve_weather_reference,
    run_yield_inference,
)
from app.services.prediction_validation import (
    resolve_supported_season,
    resolve_supported_state,
)
from ml.model_loader import get_yield_model

MAX_CANDIDATE_CROPS = 30
MAX_ALTERNATIVES = 4


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def normalize_score_values(
    values: list[float],
) -> list[float]:
    """
    Convert a collection of values into scores from
    0 to 100 using min-max normalization.
    """

    if not values:
        return []

    finite_values = [
        float(value)
        for value in values
        if math.isfinite(float(value))
    ]

    if not finite_values:
        return [0.0 for _ in values]

    minimum = min(finite_values)
    maximum = max(finite_values)

    if math.isclose(
        minimum,
        maximum,
        rel_tol=1e-9,
        abs_tol=1e-9,
    ):
        return [100.0 for _ in values]

    return [
        (
            (float(value) - minimum)
            / (maximum - minimum)
        )
        * 100.0
        for value in values
    ]


def get_candidate_crop_statistics(
    db: Session,
    state_name: str,
    season_name: str,
) -> list[dict[str, Any]]:
    """
    Find crops historically recorded for the selected
    state and season.

    Historical averages are used for rainfall,
    fertilizer and pesticide inputs when testing each
    crop with the yield model.
    """

    rows = (
        db.query(
            HistoricalCropYield.crop.label("crop"),
            func.avg(
                HistoricalCropYield.yield_value
            ).label("average_yield"),
            func.avg(
                HistoricalCropYield.annual_rainfall
            ).label("average_annual_rainfall"),
            func.avg(
                HistoricalCropYield.fertilizer
            ).label("average_fertilizer"),
            func.avg(
                HistoricalCropYield.pesticide
            ).label("average_pesticide"),
            func.count(
                HistoricalCropYield.id
            ).label("record_count"),
        )
        .filter(
            func.lower(HistoricalCropYield.state)
            == state_name.lower(),
            func.lower(HistoricalCropYield.season)
            == season_name.lower(),
            HistoricalCropYield.crop.isnot(None),
            HistoricalCropYield.yield_value.isnot(
                None
            ),
        )
        .group_by(HistoricalCropYield.crop)
        .order_by(
            func.count(
                HistoricalCropYield.id
            ).desc()
        )
        .limit(MAX_CANDIDATE_CROPS)
        .all()
    )

    candidates: list[dict[str, Any]] = []

    for row in rows:
        required_values = (
            row.average_yield,
            row.average_annual_rainfall,
            row.average_fertilizer,
            row.average_pesticide,
        )

        if any(
            value is None
            for value in required_values
        ):
            continue

        candidate = {
            "crop": normalize_text(row.crop),
            "historical_average_yield": (
                ensure_finite_number(
                    row.average_yield,
                    "Historical average yield",
                )
            ),
            "annual_rainfall": (
                ensure_finite_number(
                    row.average_annual_rainfall,
                    "Historical annual rainfall",
                )
            ),
            "fertilizer": ensure_finite_number(
                row.average_fertilizer,
                "Historical fertilizer",
            ),
            "pesticide": ensure_finite_number(
                row.average_pesticide,
                "Historical pesticide",
            ),
            "historical_record_count": int(
                row.record_count or 0
            ),
        }

        if (
            candidate["historical_average_yield"]
            < 0
            or candidate["annual_rainfall"] < 0
            or candidate["fertilizer"] < 0
            or candidate["pesticide"] < 0
        ):
            continue

        candidates.append(candidate)

    if not candidates:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "No suitable historical crop records "
                f"were found for {state_name} during "
                f"the {season_name} season."
            ),
        )

    return candidates


def resolve_recommendation_environment(
    db: Session,
    request: CropRecommendationRequest,
    current_user: User,
) -> dict[str, Any]:
    farm = get_active_accessible_farm(
        db=db,
        farm_id=request.farm_id,
        current_user=current_user,
    )

    state_name = resolve_supported_state(
        farm.state
    )

    season_name = resolve_supported_season(
        request.season
    )

    soil = resolve_soil_reference(
        db=db,
        state_name=state_name,
    )

    weather = resolve_weather_reference(
        db=db,
        state_name=state_name,
        crop_year=request.crop_year,
    )

    if weather is None:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Weather reference information is not "
                f"available for the state '{state_name}'."
            ),
        )

    values = {
        "farm": farm,
        "farm_id": farm.id,
        "farm_name": farm.farm_name,
        "state": state_name,
        "season": season_name,
        "crop_year": request.crop_year,
        "area_hectares": ensure_finite_number(
            farm.area_hectares,
            "Farm area",
        ),
        "nitrogen": ensure_finite_number(
            soil.nitrogen,
            "Nitrogen",
        ),
        "phosphorus": ensure_finite_number(
            soil.phosphorus,
            "Phosphorus",
        ),
        "potassium": ensure_finite_number(
            soil.potassium,
            "Potassium",
        ),
        "ph": ensure_finite_number(
            soil.ph,
            "Soil pH",
        ),
        "average_temperature_c": (
            ensure_finite_number(
                weather.avg_temp_c,
                "Average temperature",
            )
        ),
        "total_rainfall_mm": (
            ensure_finite_number(
                weather.total_rainfall_mm,
                "Total rainfall",
            )
        ),
        "average_humidity_percent": (
            ensure_finite_number(
                weather.avg_humidity_percent,
                "Average humidity",
            )
        ),
        "weather_reference_year": weather.year,
    }

    return values


def run_candidate_predictions(
    environment: dict[str, Any],
    candidates: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []

    for candidate in candidates:
        model_values = {
            "crop_year": environment[
                "crop_year"
            ],
            "area_hectares": environment[
                "area_hectares"
            ],
            "annual_rainfall": candidate[
                "annual_rainfall"
            ],
            "fertilizer": candidate[
                "fertilizer"
            ],
            "pesticide": candidate[
                "pesticide"
            ],
            "nitrogen": environment[
                "nitrogen"
            ],
            "phosphorus": environment[
                "phosphorus"
            ],
            "potassium": environment[
                "potassium"
            ],
            "ph": environment["ph"],
            "average_temperature_c": environment[
                "average_temperature_c"
            ],
            "total_rainfall_mm": environment[
                "total_rainfall_mm"
            ],
            "average_humidity_percent": environment[
                "average_humidity_percent"
            ],
            "crop": candidate["crop"],
            "season": environment["season"],
            "state": environment["state"],
        }

        try:
            model_dataframe = (
                build_model_dataframe(
                    model_values
                )
            )

            predicted_yield = (
                run_yield_inference(
                    model_dataframe
                )
            )
        except HTTPException:
            # Skip a historical crop that is not
            # compatible with the production model.
            continue

        estimated_production = (
            predicted_yield
            * environment["area_hectares"]
        )

        results.append(
            {
                **candidate,
                "predicted_yield": (
                    predicted_yield
                ),
                "estimated_production": (
                    estimated_production
                ),
            }
        )

    if not results:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "No candidate crops could be evaluated "
                "by the current yield model."
            ),
        )

    return results


def rank_candidate_crops(
    candidates: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    predicted_scores = normalize_score_values(
        [
            item["predicted_yield"]
            for item in candidates
        ]
    )

    historical_scores = normalize_score_values(
        [
            item["historical_average_yield"]
            for item in candidates
        ]
    )

    support_values = [
        math.log1p(
            item["historical_record_count"]
        )
        for item in candidates
    ]

    support_scores = normalize_score_values(
        support_values
    )

    ranked_candidates = []

    for index, candidate in enumerate(
        candidates
    ):
        recommendation_score = (
            predicted_scores[index] * 0.70
            + historical_scores[index] * 0.20
            + support_scores[index] * 0.10
        )

        ranked_candidates.append(
            {
                **candidate,
                "recommendation_score": round(
                    recommendation_score,
                    2,
                ),
            }
        )

    ranked_candidates.sort(
        key=lambda item: (
            item["recommendation_score"],
            item["predicted_yield"],
            item["historical_record_count"],
        ),
        reverse=True,
    )

    for rank, candidate in enumerate(
        ranked_candidates,
        start=1,
    ):
        candidate["rank"] = rank

    return ranked_candidates


def determine_recommendation_strength(
    ranked_candidates: list[dict[str, Any]],
) -> str:
    best_score = ranked_candidates[0][
        "recommendation_score"
    ]

    second_score = (
        ranked_candidates[1][
            "recommendation_score"
        ]
        if len(ranked_candidates) > 1
        else 0.0
    )

    score_margin = best_score - second_score

    if best_score >= 75 and score_margin >= 8:
        return "high"

    if best_score >= 55 and score_margin >= 3:
        return "medium"

    return "low"


def create_recommendation_reasons(
    best_crop: dict[str, Any],
    environment: dict[str, Any],
    strength: str,
) -> list[str]:
    reasons = [
        (
            f"{best_crop['crop']} achieved the "
            "highest combined recommendation score "
            "among the eligible crops."
        ),
        (
            "The crop produced a strong estimated "
            "yield under the selected farm, soil, "
            "weather and seasonal conditions."
        ),
        (
            f"It is supported by "
            f"{best_crop['historical_record_count']} "
            "historical records for the selected "
            "state and season."
        ),
        (
            "Its historical average yield contributed "
            "positively to the final ranking."
        ),
        (
            f"Weather information from "
            f"{environment['weather_reference_year']} "
            "was used for the evaluation."
        ),
    ]

    if strength == "low":
        reasons.append(
            "The leading crops have similar scores, "
            "so the recommendation should be reviewed "
            "with local agricultural guidance."
        )

    return reasons


def create_recommendation_explanation(
    environment: dict[str, Any],
    candidate_count: int,
) -> str:
    return (
        f"{candidate_count} historically supported "
        "crops were evaluated for "
        f"{environment['state']} during the "
        f"{environment['season']} season. Each crop "
        "was tested using the production yield model "
        "with the same farm area, soil nutrients and "
        "weather conditions. Crop-specific historical "
        "rainfall, fertilizer and pesticide averages "
        "were used. The final score combines 70% "
        "predicted-yield performance, 20% historical "
        "average-yield performance and 10% historical "
        "record support. This recommendation should "
        "support, not replace, professional agricultural "
        "advice."
    )


def serialize_ranked_crop(
    crop: dict[str, Any],
) -> dict[str, Any]:
    return {
        "crop": crop["crop"],
        "rank": crop["rank"],
        "recommendation_score": round(
            crop["recommendation_score"],
            2,
        ),
        "predicted_yield": round(
            crop["predicted_yield"],
            6,
        ),
        "estimated_production": round(
            crop["estimated_production"],
            6,
        ),
        "historical_average_yield": round(
            crop["historical_average_yield"],
            6,
        ),
        "historical_record_count": crop[
            "historical_record_count"
        ],
    }


def create_crop_recommendation(
    db: Session,
    request: CropRecommendationRequest,
    current_user: User,
) -> CropRecommendation:
    environment = (
        resolve_recommendation_environment(
            db=db,
            request=request,
            current_user=current_user,
        )
    )

    candidates = get_candidate_crop_statistics(
        db=db,
        state_name=environment["state"],
        season_name=environment["season"],
    )

    evaluated_candidates = (
        run_candidate_predictions(
            environment=environment,
            candidates=candidates,
        )
    )

    ranked_candidates = rank_candidate_crops(
        evaluated_candidates
    )

    best_crop = ranked_candidates[0]

    strength = (
        determine_recommendation_strength(
            ranked_candidates
        )
    )

    reasons = create_recommendation_reasons(
        best_crop=best_crop,
        environment=environment,
        strength=strength,
    )

    alternatives = [
        serialize_ranked_crop(candidate)
        for candidate in ranked_candidates[
            1 : MAX_ALTERNATIVES + 1
        ]
    ]

    model_bundle = get_yield_model()

    recommendation = CropRecommendation(
        user_id=current_user.id,
        farm_id=environment["farm_id"],
        farm_name=environment["farm_name"],
        state=environment["state"],
        area_hectares=environment[
            "area_hectares"
        ],
        crop_year=environment["crop_year"],
        season=environment["season"],
        nitrogen=environment["nitrogen"],
        phosphorus=environment["phosphorus"],
        potassium=environment["potassium"],
        ph=environment["ph"],
        average_temperature_c=environment[
            "average_temperature_c"
        ],
        total_rainfall_mm=environment[
            "total_rainfall_mm"
        ],
        average_humidity_percent=environment[
            "average_humidity_percent"
        ],
        recommended_crop=best_crop["crop"],
        recommendation_score=best_crop[
            "recommendation_score"
        ],
        recommendation_strength=strength,
        predicted_yield=round(
            best_crop["predicted_yield"],
            6,
        ),
        estimated_production=round(
            best_crop["estimated_production"],
            6,
        ),
        historical_average_yield=round(
            best_crop[
                "historical_average_yield"
            ],
            6,
        ),
        historical_record_count=best_crop[
            "historical_record_count"
        ],
        alternatives_json=json.dumps(
            alternatives
        ),
        reasons_json=json.dumps(reasons),
        model_name=model_bundle.model_name,
        model_version=model_bundle.model_version,
        prediction_unit=PREDICTION_UNIT,
        production_unit=PRODUCTION_UNIT,
        explanation=(
            create_recommendation_explanation(
                environment=environment,
                candidate_count=len(
                    ranked_candidates
                ),
            )
        ),
    )

    try:
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)
    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "The crop recommendation was generated "
                "but could not be saved."
            ),
        ) from exc

    return recommendation


def is_admin_user(
    current_user: User,
) -> bool:
    return bool(
        current_user.role
        and current_user.role.name.lower()
        == "admin"
    )


def get_crop_recommendation(
    db: Session,
    recommendation_id: int,
    current_user: User,
) -> CropRecommendation:
    query = db.query(CropRecommendation).filter(
        CropRecommendation.id
        == recommendation_id
    )

    if not is_admin_user(current_user):
        query = query.filter(
            CropRecommendation.user_id
            == current_user.id
        )

    recommendation = query.first()

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop recommendation not found.",
        )

    return recommendation


def get_crop_recommendation_history(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[CropRecommendation], int]:
    query = db.query(CropRecommendation)

    if not is_admin_user(current_user):
        query = query.filter(
            CropRecommendation.user_id
            == current_user.id
        )

    total = query.count()

    recommendations = (
        query.order_by(
            CropRecommendation.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return recommendations, total


def build_recommendation_response(
    recommendation: CropRecommendation,
) -> dict[str, Any]:
    try:
        alternatives = json.loads(
            recommendation.alternatives_json
            or "[]"
        )

        reasons = json.loads(
            recommendation.reasons_json
            or "[]"
        )
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Stored recommendation details are "
                "invalid."
            ),
        ) from exc

    return {
        "id": recommendation.id,
        "user_id": recommendation.user_id,
        "farm_id": recommendation.farm_id,
        "farm_name": recommendation.farm_name,
        "state": recommendation.state,
        "area_hectares": (
            recommendation.area_hectares
        ),
        "crop_year": recommendation.crop_year,
        "season": recommendation.season,
        "nitrogen": recommendation.nitrogen,
        "phosphorus": (
            recommendation.phosphorus
        ),
        "potassium": recommendation.potassium,
        "ph": recommendation.ph,
        "average_temperature_c": (
            recommendation.average_temperature_c
        ),
        "total_rainfall_mm": (
            recommendation.total_rainfall_mm
        ),
        "average_humidity_percent": (
            recommendation.average_humidity_percent
        ),
        "recommended_crop": (
            recommendation.recommended_crop
        ),
        "recommendation_score": (
            recommendation.recommendation_score
        ),
        "recommendation_strength": (
            recommendation.recommendation_strength
        ),
        "predicted_yield": (
            recommendation.predicted_yield
        ),
        "estimated_production": (
            recommendation.estimated_production
        ),
        "historical_average_yield": (
            recommendation.historical_average_yield
        ),
        "historical_record_count": (
            recommendation.historical_record_count
        ),
        "alternatives": alternatives,
        "reasons": reasons,
        "model_name": recommendation.model_name,
        "model_version": (
            recommendation.model_version
        ),
        "prediction_unit": (
            recommendation.prediction_unit
        ),
        "production_unit": (
            recommendation.production_unit
        ),
        "explanation": recommendation.explanation,
        "created_at": recommendation.created_at,
    }