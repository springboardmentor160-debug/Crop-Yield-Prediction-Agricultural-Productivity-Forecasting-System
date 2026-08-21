from datetime import UTC, datetime, time

from sqlalchemy import func
from sqlalchemy.orm import Query

from app.models.crop_recommendation import (
    CropRecommendation,
)

RECOMMENDATION_HEADERS = [
    "Recommendation ID",
    "Farm",
    "State",
    "Crop Year",
    "Season",
    "Recommended Crop",
    "Recommendation Score",
    "Recommendation Strength",
    "Predicted Yield",
    "Estimated Production",
    "Historical Average Yield",
    "Historical Records",
    "Model",
    "Model Version",
    "Created At",
]


def apply_recommendation_filters(
    query: Query,
    *,
    farm_id: int | None = None,
    recommended_crop: str | None = None,
    season: str | None = None,
    crop_year: int | None = None,
    recommendation_strength: str | None = None,
    start_date=None,
    end_date=None,
):
    if farm_id is not None:
        query = query.filter(
            CropRecommendation.farm_id == farm_id
        )

    if recommended_crop:
        query = query.filter(
            func.lower(
                CropRecommendation.recommended_crop
            )
            == recommended_crop.strip().lower()
        )

    if season:
        query = query.filter(
            func.lower(CropRecommendation.season)
            == season.strip().lower()
        )

    if crop_year is not None:
        query = query.filter(
            CropRecommendation.crop_year == crop_year
        )

    if recommendation_strength:
        query = query.filter(
            func.lower(
                CropRecommendation.recommendation_strength
            )
            == recommendation_strength.strip().lower()
        )

    if start_date:
        start_datetime = datetime.combine(
            start_date,
            time.min,
            tzinfo=UTC,
        )

        query = query.filter(
            CropRecommendation.created_at
            >= start_datetime
        )

    if end_date:
        end_datetime = datetime.combine(
            end_date,
            time.max,
            tzinfo=UTC,
        )

        query = query.filter(
            CropRecommendation.created_at
            <= end_datetime
        )

    return query


def recommendation_rows(recommendations):
    return [
        [
            recommendation.id,
            recommendation.farm_name,
            recommendation.state,
            recommendation.crop_year,
            recommendation.season,
            recommendation.recommended_crop,
            recommendation.recommendation_score,
            recommendation.recommendation_strength,
            recommendation.predicted_yield,
            recommendation.estimated_production,
            recommendation.historical_average_yield,
            recommendation.historical_record_count,
            recommendation.model_name,
            recommendation.model_version,
            recommendation.created_at,
        ]
        for recommendation in recommendations
    ]