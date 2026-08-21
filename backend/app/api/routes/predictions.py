from __future__ import annotations

import math

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_role,
)
from app.db.database import get_db
from app.models.prediction import YieldPrediction
from app.models.user import User
from app.schemas.prediction import (
    ModelInformationResponse,
    YieldPredictionListResponse,
    YieldPredictionRequest,
    YieldPredictionResponse,
    YieldPredictionSummaryResponse,
)
from app.services.prediction_service import (
    create_yield_prediction,
)
from ml.model_loader import get_yield_model

router = APIRouter(
    prefix="/api/predictions",
    tags=["Yield Prediction"],
)

@router.post(
    "",
    response_model=YieldPredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_yield_prediction(
    request: YieldPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("farmer")
    ),
):
    return create_yield_prediction(
        db=db,
        request=request,
        current_user=current_user,
    )

@router.get(
    "",
    response_model=YieldPredictionListResponse,
)
def list_predictions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    farm_id: int | None = Query(default=None, gt=0),
    crop: str | None = Query(default=None),
    state: str | None = Query(default=None),
    season: str | None = Query(default=None),
    crop_year: int | None = Query(
        default=None,
        ge=1990,
        le=2100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(YieldPrediction)

    if current_user.role.name != "admin":
        query = query.filter(
            YieldPrediction.user_id == current_user.id
        )

    if farm_id is not None:
        query = query.filter(
            YieldPrediction.farm_id == farm_id
        )

    if crop:
        query = query.filter(
            func.lower(YieldPrediction.crop)
            == crop.strip().lower()
        )

    if state:
        query = query.filter(
            func.lower(YieldPrediction.state)
            == state.strip().lower()
        )

    if season:
        query = query.filter(
            func.lower(YieldPrediction.season)
            == season.strip().lower()
        )

    if crop_year is not None:
        query = query.filter(
            YieldPrediction.crop_year == crop_year
        )

    total = query.count()

    predictions = (
        query.order_by(
            YieldPrediction.created_at.desc(),
            YieldPrediction.id.desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            math.ceil(total / page_size)
            if total
            else 0
        ),
        "items": predictions,
    }

@router.get(
    "/summary",
    response_model=YieldPredictionSummaryResponse,
)
def get_prediction_summary(
    farm_id: int | None = Query(default=None, gt=0),
    crop: str | None = Query(default=None),
    state: str | None = Query(default=None),
    season: str | None = Query(default=None),
    crop_year: int | None = Query(
        default=None,
        ge=1990,
        le=2100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(YieldPrediction)

    if current_user.role.name != "admin":
        query = query.filter(
            YieldPrediction.user_id == current_user.id
        )

    if farm_id is not None:
        query = query.filter(
            YieldPrediction.farm_id == farm_id
        )

    if crop:
        query = query.filter(
            func.lower(YieldPrediction.crop)
            == crop.strip().lower()
        )

    if state:
        query = query.filter(
            func.lower(YieldPrediction.state)
            == state.strip().lower()
        )

    if season:
        query = query.filter(
            func.lower(YieldPrediction.season)
            == season.strip().lower()
        )

    if crop_year is not None:
        query = query.filter(
            YieldPrediction.crop_year == crop_year
        )

    result = query.with_entities(
        func.count(YieldPrediction.id),
        func.count(
            func.distinct(
                YieldPrediction.farm_id
            )
        ),
        func.count(
            func.distinct(
                func.lower(YieldPrediction.crop)
            )
        ),
        func.coalesce(
            func.avg(
                YieldPrediction.predicted_yield
            ),
            0,
        ),
        func.coalesce(
            func.max(
                YieldPrediction.predicted_yield
            ),
            0,
        ),
        func.coalesce(
            func.min(
                YieldPrediction.predicted_yield
            ),
            0,
        ),
        func.coalesce(
            func.sum(
                YieldPrediction.estimated_production
            ),
            0,
        ),
    ).first()

    return {
        "total_predictions": int(result[0] or 0),
        "total_farms": int(result[1] or 0),
        "total_crops": int(result[2] or 0),
        "average_predicted_yield": round(
            float(result[3] or 0),
            6,
        ),
        "maximum_predicted_yield": round(
            float(result[4] or 0),
            6,
        ),
        "minimum_predicted_yield": round(
            float(result[5] or 0),
            6,
        ),
        "total_estimated_production": round(
            float(result[6] or 0),
            6,
        ),
    }

@router.get(
    "/model/info",
    response_model=ModelInformationResponse,
)
def get_model_information(
    current_user: User = Depends(get_current_user),
):
    model_bundle = get_yield_model()
    metadata = model_bundle.metadata

    return {
        "project": metadata.get(
            "project",
            "YieldSense AI",
        ),
        "task": metadata.get(
            "task",
            "Crop Yield Prediction",
        ),
        "model_name": metadata["model_name"],
        "model_type": metadata["model_type"],
        "model_version": metadata["model_version"],
        "training_rows": metadata["training_rows"],
        "training_year_start": metadata[
            "training_year_start"
        ],
        "training_year_end": metadata[
            "training_year_end"
        ],
        "feature_count": metadata["feature_count"],
        "features": metadata["features"],
        "target": metadata["target"],
        "target_transformation": metadata[
            "target_transformation"
        ],
        "prediction_inverse_transformation": metadata[
            "prediction_inverse_transformation"
        ],
        "random_split_metrics": metadata[
            "random_split_metrics"
        ],
        "time_based_metrics": metadata[
            "time_based_metrics"
        ],
        "production_feature_used": metadata[
            "production_feature_used"
        ],
    }

@router.get(
    "/{prediction_id}",
    response_model=YieldPredictionResponse,
)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prediction = (
        db.query(YieldPrediction)
        .filter(
            YieldPrediction.id == prediction_id
        )
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found",
        )

    is_admin = current_user.role.name == "admin"
    is_owner = (
        prediction.user_id == current_user.id
    )

    if not is_admin and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have permission to access "
                "this prediction"
            ),
        )

    return prediction