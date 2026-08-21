from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.farm import Farm
from app.models.agronomy import WeatherRecord
from app.models.user import User
from app.schemas.agronomy import WeatherCreate, WeatherOut
from app.services.access import assert_can_access_farm, assert_can_modify_farm

router = APIRouter(prefix="/api/weather", tags=["Weather Analysis"])


@router.post("", response_model=WeatherOut, status_code=status.HTTP_201_CREATED)
def add_weather_record(payload: WeatherCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, payload.farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_modify_farm(current_user, farm)
    record = WeatherRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[WeatherOut])
def list_weather_records(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_access_farm(db, current_user, farm)
    return (
        db.query(WeatherRecord)
        .filter(WeatherRecord.farm_id == farm_id)
        .order_by(WeatherRecord.record_date.desc())
        .all()
    )


@router.get("/trend")
def weather_trend(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Aggregated trend series used by the Weather Analysis dashboard chart."""
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    assert_can_access_farm(db, current_user, farm)
    records = (
        db.query(WeatherRecord)
        .filter(WeatherRecord.farm_id == farm_id)
        .order_by(WeatherRecord.record_date.asc())
        .all()
    )
    return [
        {
            "date": r.record_date.isoformat(),
            "temperature_c": r.temperature_c,
            "rainfall_mm": r.rainfall_mm,
            "humidity_pct": r.humidity_pct,
            "wind_speed_kmh": r.wind_speed_kmh,
        }
        for r in records
    ]
