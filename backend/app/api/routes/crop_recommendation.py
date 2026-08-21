from fastapi import (
    APIRouter,
    Depends,
    Query,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.crop_recommendation import (
    CropRecommendationHistoryResponse,
    CropRecommendationRequest,
    CropRecommendationResponse,
)
from app.services.crop_recommendation_service import (
    build_recommendation_response,
    create_crop_recommendation,
    get_crop_recommendation,
    get_crop_recommendation_history,
)

router = APIRouter(
    prefix="/crop-recommendation",
    tags=["Crop Recommendation"],
)


@router.post(
    "",
    response_model=CropRecommendationResponse,
)
def recommend_crop(
    request: CropRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):
    recommendation = create_crop_recommendation(
        db=db,
        request=request,
        current_user=current_user,
    )

    return build_recommendation_response(
        recommendation
    )


@router.get(
    "/history",
    response_model=CropRecommendationHistoryResponse,
)
def recommendation_history(
    skip: int = Query(
        0,
        ge=0,
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):
    recommendations, total = (
        get_crop_recommendation_history(
            db=db,
            current_user=current_user,
            skip=skip,
            limit=limit,
        )
    )

    return {
        "items": recommendations,
        "total": total,
    }


@router.get(
    "/{recommendation_id}",
    response_model=CropRecommendationResponse,
)
def recommendation_details(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):
    recommendation = get_crop_recommendation(
        db=db,
        recommendation_id=recommendation_id,
        current_user=current_user,
    )

    return build_recommendation_response(
        recommendation
    )