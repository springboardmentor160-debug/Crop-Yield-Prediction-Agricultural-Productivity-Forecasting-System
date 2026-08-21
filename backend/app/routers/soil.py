from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.farm import Farm
from app.models.agronomy import SoilRecord
from app.models.user import User
from app.schemas.agronomy import SoilCreate, SoilOut
from app.services.access import assert_can_access_farm, assert_can_modify_farm

router = APIRouter(prefix="/api/soil", tags=["Soil Analysis"])


def _soil_health_index(record: SoilRecord) -> float:
    """0-100 composite score used by the Soil Analysis module."""
    ph_score = max(0.0, 100 - abs(record.ph_level - 6.5) * 22)
    n_score = min(100.0, record.nitrogen_ppm / 60 * 100)
    p_score = min(100.0, record.phosphorus_ppm / 40 * 100)
    k_score = min(100.0, record.potassium_ppm / 50 * 100)
    om_score = min(100.0, record.organic_matter_pct / 4 * 100)
    return round((ph_score + n_score + p_score + k_score + om_score) / 5, 1)


@router.post("", response_model=SoilOut, status_code=status.HTTP_201_CREATED)
def add_soil_record(payload: SoilCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, payload.farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_modify_farm(current_user, farm)
    record = SoilRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[SoilOut])
def list_soil_records(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_access_farm(db, current_user, farm)
    return (
        db.query(SoilRecord)
        .filter(SoilRecord.farm_id == farm_id)
        .order_by(SoilRecord.record_date.desc())
        .all()
    )


@router.get("/health-index")
def soil_health_index(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_access_farm(db, current_user, farm)
    latest = (
        db.query(SoilRecord)
        .filter(SoilRecord.farm_id == farm_id)
        .order_by(SoilRecord.record_date.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No soil records found for this farm yet")
    return {
        "farm_id": farm_id,
        "record_date": latest.record_date.isoformat(),
        "soil_health_index": _soil_health_index(latest),
        "ph_level": latest.ph_level,
        "soil_texture": latest.soil_texture,
    }
