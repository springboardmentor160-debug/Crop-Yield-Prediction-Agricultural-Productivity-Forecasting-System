from datetime import date

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.crop_recommendation import (
    CropRecommendation,
)
from app.models.prediction import YieldPrediction
from app.models.user import User
from app.reports.report_utils import (
    build_report_filename,
    create_csv_buffer,
    create_pdf_buffer,
)
from app.services.recommendation_report_service import (
    RECOMMENDATION_HEADERS,
    apply_recommendation_filters,
    recommendation_rows,
)
from app.services.report_service import (
    PREDICTION_HEADERS,
    apply_prediction_filters,
    prediction_rows,
)

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)

@router.get("/predictions/csv")
def export_predictions_csv(
    farm_id: int | None = Query(
        default=None,
        gt=0,
    ),
    crop: str | None = Query(
        default=None,
    ),
    season: str | None = Query(
        default=None,
    ),
    start_date: date | None = Query(
        default=None,
    ),
    end_date: date | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(YieldPrediction)

    if current_user.role.name != "admin":
        query = query.filter(
            YieldPrediction.user_id == current_user.id
        )

    query = apply_prediction_filters(
        query,
        farm_id=farm_id,
        crop=crop,
        season=season,
        start_date=start_date,
        end_date=end_date,
    )

    predictions = (
        query.order_by(
            YieldPrediction.created_at.desc(),
            YieldPrediction.id.desc(),
        )
        .all()
    )

    rows = prediction_rows(predictions)

    csv_buffer = create_csv_buffer(
        headers=PREDICTION_HEADERS,
        rows=rows,
    )

    filename = build_report_filename(
        report_name="yield_predictions",
        extension="csv",
    )

    return StreamingResponse(
        csv_buffer,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            ),
            "Access-Control-Expose-Headers": (
                "Content-Disposition"
            ),
        },
    )

@router.get("/predictions/pdf")
def export_predictions_pdf(
    farm_id: int | None = Query(
        default=None,
        gt=0,
    ),
    crop: str | None = Query(
        default=None,
    ),
    season: str | None = Query(
        default=None,
    ),
    start_date: date | None = Query(
        default=None,
    ),
    end_date: date | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(YieldPrediction)

    if current_user.role.name != "admin":
        query = query.filter(
            YieldPrediction.user_id == current_user.id
        )

    query = apply_prediction_filters(
        query,
        farm_id=farm_id,
        crop=crop,
        season=season,
        start_date=start_date,
        end_date=end_date,
    )

    predictions = (
        query.order_by(
            YieldPrediction.created_at.desc(),
            YieldPrediction.id.desc(),
        )
        .all()
    )

    rows = prediction_rows(predictions)

    total_predictions = len(predictions)

    average_yield = (
        sum(
            prediction.predicted_yield
            for prediction in predictions
        )
        / total_predictions
        if total_predictions
        else 0
    )

    total_production = sum(
        prediction.estimated_production
        for prediction in predictions
    )

    summary_items = {
        "Total Predictions": total_predictions,
        "Average Predicted Yield": (
            f"{average_yield:.4f} "
            "metric tons per hectare"
        ),
        "Total Estimated Production": (
            f"{total_production:.4f} metric tons"
        ),
        "Farm Filter": (
            farm_id
            if farm_id is not None
            else "All farms"
        ),
        "Crop Filter": crop or "All crops",
        "Season Filter": season or "All seasons",
        "Start Date": start_date or "Not specified",
        "End Date": end_date or "Not specified",
    }

    pdf_buffer = create_pdf_buffer(
        title="Yield Prediction Report",
        subtitle=(
            "Crop yield prediction records generated "
            "by YieldSense AI"
        ),
        headers=PREDICTION_HEADERS,
        rows=rows,
        summary_items=summary_items,
    )

    filename = build_report_filename(
        report_name="yield_predictions",
        extension="pdf",
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            ),
            "Access-Control-Expose-Headers": (
                "Content-Disposition"
            ),
        },
    )

@router.get("/recommendations/csv")
def export_recommendations_csv(
    farm_id: int | None = Query(
        default=None,
        gt=0,
    ),
    recommended_crop: str | None = Query(
        default=None,
    ),
    season: str | None = Query(
        default=None,
    ),
    crop_year: int | None = Query(
        default=None,
        ge=1990,
        le=2100,
    ),
    recommendation_strength: str | None = Query(
        default=None,
    ),
    start_date: date | None = Query(
        default=None,
    ),
    end_date: date | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(CropRecommendation)

    if current_user.role.name != "admin":
        query = query.filter(
            CropRecommendation.user_id
            == current_user.id
        )

    query = apply_recommendation_filters(
        query,
        farm_id=farm_id,
        recommended_crop=recommended_crop,
        season=season,
        crop_year=crop_year,
        recommendation_strength=(
            recommendation_strength
        ),
        start_date=start_date,
        end_date=end_date,
    )

    recommendations = (
        query.order_by(
            CropRecommendation.created_at.desc(),
            CropRecommendation.id.desc(),
        )
        .all()
    )

    csv_buffer = create_csv_buffer(
        headers=RECOMMENDATION_HEADERS,
        rows=recommendation_rows(
            recommendations
        ),
    )

    filename = build_report_filename(
        report_name="crop_recommendations",
        extension="csv",
    )

    return StreamingResponse(
        csv_buffer,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            ),
            "Access-Control-Expose-Headers": (
                "Content-Disposition"
            ),
        },
    )

@router.get("/recommendations/pdf")
def export_recommendations_pdf(
    farm_id: int | None = Query(
        default=None,
        gt=0,
    ),
    recommended_crop: str | None = Query(
        default=None,
    ),
    season: str | None = Query(
        default=None,
    ),
    crop_year: int | None = Query(
        default=None,
        ge=1990,
        le=2100,
    ),
    recommendation_strength: str | None = Query(
        default=None,
    ),
    start_date: date | None = Query(
        default=None,
    ),
    end_date: date | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(CropRecommendation)

    if current_user.role.name != "admin":
        query = query.filter(
            CropRecommendation.user_id
            == current_user.id
        )

    query = apply_recommendation_filters(
        query,
        farm_id=farm_id,
        recommended_crop=recommended_crop,
        season=season,
        crop_year=crop_year,
        recommendation_strength=(
            recommendation_strength
        ),
        start_date=start_date,
        end_date=end_date,
    )

    recommendations = (
        query.order_by(
            CropRecommendation.created_at.desc(),
            CropRecommendation.id.desc(),
        )
        .all()
    )

    total_recommendations = len(
        recommendations
    )

    average_score = (
        sum(
            recommendation.recommendation_score
            for recommendation in recommendations
        )
        / total_recommendations
        if total_recommendations
        else 0
    )

    average_predicted_yield = (
        sum(
            recommendation.predicted_yield
            for recommendation in recommendations
        )
        / total_recommendations
        if total_recommendations
        else 0
    )

    total_estimated_production = sum(
        recommendation.estimated_production
        for recommendation in recommendations
    )

    summary_items = {
        "Total Recommendations": (
            total_recommendations
        ),
        "Average Recommendation Score": (
            f"{average_score:.2f}"
        ),
        "Average Predicted Yield": (
            f"{average_predicted_yield:.4f} "
            "metric tons per hectare"
        ),
        "Total Estimated Production": (
            f"{total_estimated_production:.4f} "
            "metric tons"
        ),
        "Farm Filter": (
            farm_id
            if farm_id is not None
            else "All farms"
        ),
        "Crop Filter": (
            recommended_crop or "All crops"
        ),
        "Season Filter": (
            season or "All seasons"
        ),
        "Crop Year Filter": (
            crop_year
            if crop_year is not None
            else "All years"
        ),
        "Strength Filter": (
            recommendation_strength
            or "All strengths"
        ),
        "Start Date": (
            start_date or "Not specified"
        ),
        "End Date": (
            end_date or "Not specified"
        ),
    }

    pdf_buffer = create_pdf_buffer(
        title="Crop Recommendation Report",
        subtitle=(
            "AI-generated crop recommendations "
            "from YieldSense AI"
        ),
        headers=RECOMMENDATION_HEADERS,
        rows=recommendation_rows(
            recommendations
        ),
        summary_items=summary_items,
    )

    filename = build_report_filename(
        report_name="crop_recommendations",
        extension="pdf",
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            ),
            "Access-Control-Expose-Headers": (
                "Content-Disposition"
            ),
        },
    )