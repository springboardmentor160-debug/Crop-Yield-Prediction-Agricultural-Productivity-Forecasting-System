from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.core.permissions import require_permission, check_farm_ownership

router = APIRouter(prefix="/api/v1/farms", tags=["Farms"])


@router.post("/", response_model=schemas.FarmOut)
def create_farm(
    farm_data: schemas.FarmCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("add_farm")),
):
    farm = models.Farm(**farm_data.model_dump(), user_id=current_user.id)
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("/", response_model=List[schemas.FarmOut])
def get_my_farms(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("view_own_farms")),
):
    return db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()


@router.get("/{farm_id}", response_model=schemas.FarmOut)
def get_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("view_own_farms")),
):
    # Admins can look up any farm by id; everyone else stays scoped to their own,
    # so the ownership filter only tightens the query for non-admins.
    query = db.query(models.Farm).filter(models.Farm.id == farm_id)
    if current_user.role != "Admin":
        query = query.filter(models.Farm.user_id == current_user.id)
    farm = query.first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm


# NEW - this endpoint didn't exist yet, despite "Edit Farm UI (backend exists
# now)" being listed. Adding it here so the frontend has something to call.
@router.put("/{farm_id}", response_model=schemas.FarmOut)
def update_farm(
    farm_id: int,
    farm_data: schemas.FarmUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("edit_own_farms")),
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    check_farm_ownership(farm, current_user)  # Admin bypasses; Farmer must own it

    for field, value in farm_data.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)

    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}")
def delete_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("edit_own_farms")),
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    check_farm_ownership(farm, current_user)  # Farmer: own farms only, Admin: any farm

    db.delete(farm)
    db.commit()
    return {"message": "Farm deleted successfully"}