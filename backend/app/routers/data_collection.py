from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/data", tags=["Data Collection"])

@router.post("/farms/{farm_id}/crops", response_model=schemas.CropOut)
def add_crop(
    farm_id: int,
    crop_data: schemas.CropCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farm = db.query(models.Farm).filter(
        models.Farm.id == farm_id,
        models.Farm.user_id == current_user.id
    ).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    crop = models.Crop(**crop_data.model_dump(), farm_id=farm_id)
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.get("/farms/{farm_id}/crops", response_model=List[schemas.CropOut])
def get_crops(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farm = db.query(models.Farm).filter(
        models.Farm.id == farm_id,
        models.Farm.user_id == current_user.id
    ).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return db.query(models.Crop).filter(models.Crop.farm_id == farm_id).all()