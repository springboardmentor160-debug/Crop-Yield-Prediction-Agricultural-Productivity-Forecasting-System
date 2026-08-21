from __future__ import annotations

import math
from typing import Any

import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.agriculture import (
    HistoricalCropYield,
    StateSoilReference,
    StateWeatherReference,
)
from app.models.farm import Farm
from app.models.prediction import YieldPrediction
from app.models.user import User
from app.schemas.prediction import YieldPredictionRequest
from app.services.farm_service import get_accessible_farm
from app.services.prediction_validation import (
    build_prediction_warnings,
    resolve_supported_crop,
    resolve_supported_season,
    resolve_supported_state,
    validate_hard_numeric_ranges,
    validate_model_dataframe,
)
from ml.model_loader import get_yield_model

PREDICTION_UNIT = "metric tons per hectare"
PRODUCTION_UNIT = "metric tons"


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def ensure_finite_number(
    value: float,
    field_name: str,
) -> float:
    numeric_value = float(value)

    if not math.isfinite(numeric_value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} must be a finite number",
        )

    return numeric_value


def get_active_accessible_farm(
    db: Session,
    farm_id: int,
    current_user: User,
) -> Farm:
    farm = get_accessible_farm(
        db=db,
        farm_id=farm_id,
        current_user=current_user,
    )

    if not farm.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Predictions cannot be generated for an inactive farm. "
                "Reactivate the farm first."
            ),
        )

    return farm


def resolve_soil_reference(
    db: Session,
    state_name: str,
) -> StateSoilReference:
    soil = (
        db.query(StateSoilReference)
        .filter(
            func.lower(StateSoilReference.state)
            == state_name.strip().lower()
        )
        .first()
    )

    if not soil:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"No soil reference data is available for "
                f"the state '{state_name}'"
            ),
        )

    return soil


def resolve_weather_reference(
    db: Session,
    state_name: str,
    crop_year: int,
) -> StateWeatherReference | None:
    # First preference: exact state and year.
    exact_weather = (
        db.query(StateWeatherReference)
        .filter(
            func.lower(StateWeatherReference.state)
            == state_name.strip().lower(),
            StateWeatherReference.year == crop_year,
        )
        .first()
    )

    if exact_weather:
        return exact_weather

    # Second preference: latest historical record before
    # or equal to the requested prediction year.
    previous_weather = (
        db.query(StateWeatherReference)
        .filter(
            func.lower(StateWeatherReference.state)
            == state_name.strip().lower(),
            StateWeatherReference.year <= crop_year,
        )
        .order_by(StateWeatherReference.year.desc())
        .first()
    )

    if previous_weather:
        return previous_weather

    # Final fallback: latest weather record available
    # for that state.
    return (
        db.query(StateWeatherReference)
        .filter(
            func.lower(StateWeatherReference.state)
            == state_name.strip().lower()
        )
        .order_by(StateWeatherReference.year.desc())
        .first()
    )


def resolve_annual_rainfall(
    db: Session,
    request: YieldPredictionRequest,
    state_name: str,
) -> float | None:
    if request.annual_rainfall is not None:
        return ensure_finite_number(
            request.annual_rainfall,
            "Annual rainfall",
        )

    crop_name = normalize_text(request.crop)
    season_name = normalize_text(request.season)

    # Best historical fallback:
    # same state, crop, and season.
    rainfall_average = (
        db.query(
            func.avg(
                HistoricalCropYield.annual_rainfall
            )
        )
        .filter(
            func.lower(HistoricalCropYield.state)
            == state_name.lower(),
            func.lower(HistoricalCropYield.crop)
            == crop_name.lower(),
            func.lower(HistoricalCropYield.season)
            == season_name.lower(),
        )
        .scalar()
    )

    if rainfall_average is not None:
        return float(rainfall_average)

    # Broader fallback:
    # same state and crop.
    rainfall_average = (
        db.query(
            func.avg(
                HistoricalCropYield.annual_rainfall
            )
        )
        .filter(
            func.lower(HistoricalCropYield.state)
            == state_name.lower(),
            func.lower(HistoricalCropYield.crop)
            == crop_name.lower(),
        )
        .scalar()
    )

    if rainfall_average is not None:
        return float(rainfall_average)

    # Final historical fallback:
    # state average.
    rainfall_average = (
        db.query(
            func.avg(
                HistoricalCropYield.annual_rainfall
            )
        )
        .filter(
            func.lower(HistoricalCropYield.state)
            == state_name.lower()
        )
        .scalar()
    )

    if rainfall_average is not None:
        return float(rainfall_average)

    return None


def resolve_prediction_inputs(
    db: Session,
    request: YieldPredictionRequest,
    farm: Farm,
) -> dict[str, Any]:
    state_name = resolve_supported_state(
        farm.state
    )

    crop_name = resolve_supported_crop(
        request.crop
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

    annual_rainfall = resolve_annual_rainfall(
        db=db,
        request=request,
        state_name=state_name,
    )

    average_temperature = (
        request.average_temperature_c
        if request.average_temperature_c is not None
        else (
            weather.avg_temp_c
            if weather is not None
            else None
        )
    )

    total_rainfall = (
        request.total_rainfall_mm
        if request.total_rainfall_mm is not None
        else (
            weather.total_rainfall_mm
            if weather is not None
            else None
        )
    )

    average_humidity = (
        request.average_humidity_percent
        if request.average_humidity_percent is not None
        else (
            weather.avg_humidity_percent
            if weather is not None
            else None
        )
    )

    missing_weather_fields = []

    if average_temperature is None:
        missing_weather_fields.append(
            "average_temperature_c"
        )

    if total_rainfall is None:
        missing_weather_fields.append(
            "total_rainfall_mm"
        )

    if average_humidity is None:
        missing_weather_fields.append(
            "average_humidity_percent"
        )

    if annual_rainfall is None:
        missing_weather_fields.append(
            "annual_rainfall"
        )

    if missing_weather_fields:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Required weather information could not be resolved: "
                + ", ".join(missing_weather_fields)
                + ". Supply these values manually."
            ),
        )

    resolved_values = {
        "farm_id": farm.id,
        "farm_name": farm.farm_name,
        "state": state_name,
        "crop": crop_name,
        "crop_year": request.crop_year,
        "season": season_name,
        "area_hectares": ensure_finite_number(
            farm.area_hectares,
            "Farm area",
        ),
        "annual_rainfall": ensure_finite_number(
            annual_rainfall,
            "Annual rainfall",
        ),
        "fertilizer": ensure_finite_number(
            request.fertilizer,
            "Fertilizer",
        ),
        "pesticide": ensure_finite_number(
            request.pesticide,
            "Pesticide",
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
        "average_temperature_c": ensure_finite_number(
            average_temperature,
            "Average temperature",
        ),
        "total_rainfall_mm": ensure_finite_number(
            total_rainfall,
            "Total rainfall",
        ),
        "average_humidity_percent": ensure_finite_number(
            average_humidity,
            "Average humidity",
        ),
        "weather_reference_year": (
            weather.year
            if weather is not None
            else None
        ),
    }

    validate_hard_numeric_ranges(
        resolved_values
    )

    resolved_values["validation_warnings"] = (
        build_prediction_warnings(
             resolved_values
        )
    )

    return resolved_values


def build_model_dataframe(
    values: dict[str, Any],
) -> pd.DataFrame:
    model_bundle = get_yield_model()

    model_row = {
        "Crop_Year": values["crop_year"],
        "Area": values["area_hectares"],
        "Annual_Rainfall": values[
            "annual_rainfall"
        ],
        "Fertilizer": values["fertilizer"],
        "Pesticide": values["pesticide"],
        "N": values["nitrogen"],
        "P": values["phosphorus"],
        "K": values["potassium"],
        "pH": values["ph"],
        "avg_temp_c": values[
            "average_temperature_c"
        ],
        "total_rainfall_mm": values[
            "total_rainfall_mm"
        ],
        "avg_humidity_percent": values[
            "average_humidity_percent"
        ],
        "Crop": values["crop"],
        "Season": values["season"],
        "State": values["state"],
    }

    model_dataframe = pd.DataFrame(
        [model_row],
        columns=model_bundle.features,
    )

    validate_model_dataframe(
        model_dataframe
    )

    return model_dataframe


def run_yield_inference(
    model_dataframe: pd.DataFrame,
) -> float:
    model_bundle = get_yield_model()

    try:
        log_prediction = float(
            model_bundle.pipeline.predict(
                model_dataframe
            )[0]
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "The yield-prediction model could not "
                "process the supplied inputs"
            ),
        ) from exc

    predicted_yield = float(
        np.expm1(log_prediction)
    )

    predicted_yield = max(
        predicted_yield,
        0.0,
    )

    if not math.isfinite(predicted_yield):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "The model produced an invalid prediction"
            ),
        )

    return predicted_yield

def classify_predicted_yield(
    db: Session,
    crop_name: str,
    predicted_yield: float,
) -> dict[str, Any]:
    """
    Classify the prediction relative to historical
    yield values for the selected crop.

    Categories:
    below Q1       -> Low
    Q1 to median   -> Average
    median to Q3   -> Good
    Q3 and above   -> Excellent
    """

    historical_values = (
        db.query(HistoricalCropYield.yield_value)
        .filter(
            func.lower(HistoricalCropYield.crop)
            == crop_name.strip().lower(),
            HistoricalCropYield.yield_value.isnot(None),
        )
        .all()
    )

    yield_values = [
        float(row[0])
        for row in historical_values
        if row[0] is not None
        and math.isfinite(float(row[0]))
        and float(row[0]) >= 0
    ]

    if len(yield_values) < 4:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Insufficient historical yield data is "
                f"available to classify the crop '{crop_name}'"
            ),
        )

    q1, median, q3 = np.percentile(
        np.asarray(yield_values, dtype=float),
        [25, 50, 75],
    )

    if predicted_yield < q1:
        category = "low"
        label = "Low Yield"
        description = (
            "The predicted yield is below the lower "
            "quartile of historical records for this crop."
        )
    elif predicted_yield < median:
        category = "average"
        label = "Average Yield"
        description = (
            "The predicted yield is between the lower "
            "quartile and median of historical records "
            "for this crop."
        )
    elif predicted_yield < q3:
        category = "good"
        label = "Good Yield"
        description = (
            "The predicted yield is above the historical "
            "median but below the upper quartile for this crop."
        )
    else:
        category = "excellent"
        label = "Excellent Yield"
        description = (
            "The predicted yield is within or above the "
            "upper quartile of historical records for this crop."
        )

    return {
        "category": category,
        "label": label,
        "description": description,
        "historical_q1": round(float(q1), 6),
        "historical_median": round(
            float(median),
            6,
        ),
        "historical_q3": round(float(q3), 6),
    }

def create_prediction_explanation(
    values: dict[str, Any],
    yield_classification: dict[str, Any],
) -> str:
    weather_year = values.get(
        "weather_reference_year"
    )

    weather_note = (
        f"Weather reference year: {weather_year}."
        if weather_year is not None
        else (
            "Weather values were supplied directly "
            "with the prediction request."
        )
    )

    warnings = values.get(
        "validation_warnings",
        [],
    )

    warning_note = ""

    if warnings:
        warning_note = (
            " Validation notices: "
            + " ".join(warnings)
        )

    classification_note = (
        f"The result is classified as "
        f"{yield_classification['label']} by comparing it "
        "with historical yield quartiles for the selected crop. "
    )

    return (
        "Prediction generated using the selected crop, "
        "season, farm area, rainfall, fertilizer, pesticide, "
        "state soil nutrients, temperature, and humidity. "
        f"{classification_note}"
        f"{weather_note}"
        f"{warning_note} "
        "The result describes model behaviour and should "
        "support, not replace, professional agricultural advice."
    )


def create_yield_prediction(
    db: Session,
    request: YieldPredictionRequest,
    current_user: User,
) -> YieldPrediction:
    farm = get_active_accessible_farm(
        db=db,
        farm_id=request.farm_id,
        current_user=current_user,
    )

    values = resolve_prediction_inputs(
        db=db,
        request=request,
        farm=farm,
    )

    model_dataframe = build_model_dataframe(
        values
    )

    predicted_yield = run_yield_inference(
        model_dataframe
    )

    estimated_production = (
        predicted_yield
        * values["area_hectares"]
    )

    yield_classification = classify_predicted_yield(
        db=db,
        crop_name=values["crop"],
        predicted_yield=predicted_yield,
    )

    model_bundle = get_yield_model()

    prediction = YieldPrediction(
        user_id=current_user.id,
        farm_id=farm.id,
        farm_name=values["farm_name"],
        state=values["state"],
        crop=values["crop"],
        crop_year=values["crop_year"],
        season=values["season"],
        area_hectares=values["area_hectares"],
        annual_rainfall=values[
            "annual_rainfall"
        ],
        fertilizer=values["fertilizer"],
        pesticide=values["pesticide"],
        nitrogen=values["nitrogen"],
        phosphorus=values["phosphorus"],
        potassium=values["potassium"],
        ph=values["ph"],
        average_temperature_c=values[
            "average_temperature_c"
        ],
        total_rainfall_mm=values[
            "total_rainfall_mm"
        ],
        average_humidity_percent=values[
            "average_humidity_percent"
        ],
        predicted_yield=round(
            predicted_yield,
            6,
        ),
        estimated_production=round(
            estimated_production,
            6,
        ),
        yield_category=yield_classification[
            "category"
        ],
        yield_category_label=yield_classification[
            "label"
        ],
        yield_category_description=yield_classification[
            "description"
        ],
        model_name=model_bundle.model_name,
        model_version=model_bundle.model_version,
        prediction_unit=PREDICTION_UNIT,
        production_unit=PRODUCTION_UNIT,
        explanation=create_prediction_explanation(
            values,
            yield_classification,
        ),
    )

    try:
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
    except SQLAlchemyError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "The prediction was generated but could "
                "not be saved"
            ),
        ) from error

    return prediction