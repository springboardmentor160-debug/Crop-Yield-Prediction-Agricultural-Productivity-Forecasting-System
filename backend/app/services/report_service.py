from datetime import UTC, datetime, time

from sqlalchemy.orm import Query

from app.models.prediction import YieldPrediction


def apply_prediction_filters(
    query: Query,
    *,
    farm_id=None,
    crop=None,
    season=None,
    start_date=None,
    end_date=None,
):
    if farm_id:
        query = query.filter(
            YieldPrediction.farm_id == farm_id
        )

    if crop:
        query = query.filter(
            YieldPrediction.crop.ilike(
                crop.strip()
            )
        )

    if season:
        query = query.filter(
            YieldPrediction.season.ilike(
                season.strip()
            )
        )

    if start_date:
        start_datetime = datetime.combine(
            start_date,
            time.min,
            tzinfo=UTC,
        )

        query = query.filter(
            YieldPrediction.created_at >= start_datetime
        )

    if end_date:
        end_datetime = datetime.combine(
            end_date,
            time.max,
            tzinfo=UTC,
        )

        query = query.filter(
            YieldPrediction.created_at <= end_datetime
        )
    return query


PREDICTION_HEADERS = [
    "Prediction ID",
    "Farm",
    "State",
    "Crop",
    "Season",
    "Crop Year",
    "Area (ha)",
    "Predicted Yield",
    "Estimated Production",
    "Yield Category",
    "Model",
    "Version",
    "Created At",
]


def prediction_rows(predictions):
    rows = []

    for p in predictions:
        rows.append(
            [
                p.id,
                p.farm_name,
                p.state,
                p.crop,
                p.season,
                p.crop_year,
                p.area_hectares,
                p.predicted_yield,
                p.estimated_production,
                p.yield_category_label,
                p.model_name,
                p.model_version,
                p.created_at,
            ]
        )

    return rows