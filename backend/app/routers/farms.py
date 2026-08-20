from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.farm import Farm
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmOut, FarmUpdate
from app.services.access import assert_can_access_farm, assert_can_modify_farm, visible_farm_ids

router = APIRouter(prefix="/api/farms", tags=["Farms"])


@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
def create_farm(payload: FarmCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = Farm(owner_id=current_user.id, **payload.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("", response_model=list[FarmOut])
def list_farms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ids = visible_farm_ids(db, current_user)
    query = db.query(Farm)
    if ids is not None:
        query = query.filter(Farm.id.in_(ids)) if ids else query.filter(Farm.id == -1)
    return query.order_by(Farm.created_at.desc()).all()


@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_access_farm(db, current_user, farm)
    return farm


@router.put("/{farm_id}", response_model=FarmOut)
def update_farm(farm_id: int, payload: FarmUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_modify_farm(current_user, farm)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)
    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_modify_farm(current_user, farm)
    db.delete(farm)
    db.commit()
    return None
