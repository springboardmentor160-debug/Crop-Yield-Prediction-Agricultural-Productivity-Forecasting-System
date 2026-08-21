from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.farm import Farm
from app.models.agronomy import Crop
from app.models.user import User
from app.schemas.agronomy import CropCreate, CropOut, CropUpdate
from app.services.access import assert_can_access_farm, assert_can_modify_farm, visible_farm_ids

router = APIRouter(prefix="/api/crops", tags=["Crops"])


def _get_farm_or_404(db: Session, farm_id: int) -> Farm:
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    return farm


@router.post("", response_model=CropOut, status_code=status.HTTP_201_CREATED)
def create_crop(payload: CropCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = _get_farm_or_404(db, payload.farm_id)
    assert_can_modify_farm(current_user, farm)
    crop = Crop(**payload.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@router.get("", response_model=list[CropOut])
def list_crops(farm_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ids = visible_farm_ids(db, current_user)
    query = db.query(Crop)
    if farm_id is not None:
        farm = _get_farm_or_404(db, farm_id)
        assert_can_access_farm(db, current_user, farm)
        query = query.filter(Crop.farm_id == farm_id)
    elif ids is not None:
        query = query.filter(Crop.farm_id.in_(ids)) if ids else query.filter(Crop.id == -1)
    return query.order_by(Crop.created_at.desc()).all()


@router.get("/{crop_id}", response_model=CropOut)
def get_crop(crop_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    assert_can_access_farm(db, current_user, crop.farm)
    return crop


@router.put("/{crop_id}", response_model=CropOut)
def update_crop(crop_id: int, payload: CropUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    assert_can_modify_farm(current_user, crop.farm)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(crop, field, value)
    db.commit()
    db.refresh(crop)
    return crop


@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_crop(crop_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    assert_can_modify_farm(current_user, crop.farm)
    db.delete(crop)
    db.commit()
    return None
