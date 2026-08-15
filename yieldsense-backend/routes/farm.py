from fastapi import APIRouter
from pydantic import BaseModel
from database import SessionLocal
from models.farm import Farm

router = APIRouter()

class FarmData(BaseModel):
    farmer_name: str
    village: str
    district: str
    state: str
    farm_size: str
    crop: str


@router.post("/farm")
def save_farm(data: FarmData):
    db = SessionLocal()

    farm = Farm(
        farmer_name=data.farmer_name,
        village=data.village,
        district=data.district,
        state=data.state,
        farm_size=data.farm_size,
        crop=data.crop,
    )

    db.add(farm)
    db.commit()
    db.refresh(farm)
    db.close()

    return {"message": "Farm Profile Saved"}


@router.get("/farm")
def get_farm():
    db = SessionLocal()

    farms = db.query(Farm).all()

    result = []

    for farm in farms:
        result.append({
            "id": farm.id,
            "farmer_name": farm.farmer_name,
            "village": farm.village,
            "district": farm.district,
            "state": farm.state,
            "farm_size": farm.farm_size,
            "crop": farm.crop,
        })

    db.close()

    return result