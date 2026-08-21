from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.agronomy import Crop
from app.models.prediction import Recommendation
from app.models.user import User
from app.schemas.prediction import RecommendationOut
from app.services.access import assert_can_access_farm, visible_farm_ids

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/crop/{crop_id}", response_model=list[RecommendationOut])
def list_for_crop(crop_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    assert_can_access_farm(db, current_user, crop.farm)
    return (
        db.query(Recommendation)
        .filter(Recommendation.crop_id == crop_id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )


@router.get("", response_model=list[RecommendationOut])
def list_all_visible(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ids = visible_farm_ids(db, current_user)
    query = db.query(Recommendation).join(Crop, Recommendation.crop_id == Crop.id)
    if ids is not None:
        query = query.filter(Crop.farm_id.in_(ids)) if ids else query.filter(Crop.id == -1)
    return query.order_by(Recommendation.created_at.desc()).limit(100).all()
