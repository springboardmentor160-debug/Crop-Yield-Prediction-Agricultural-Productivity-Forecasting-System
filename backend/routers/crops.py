from typing import List
from fastapi import APIRouter, Depends, HTTPException
from auth_handler import get_current_user
from database import get_db_cursor
from models import CropCreate, CropResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/crops", tags=["Crops"])

class CropUpdate(BaseModel):
    crop_name: str
    hectares_planted: float

@router.post("", response_model=CropResponse, status_code=201)
def create_crop(payload: CropCreate, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    # verify farm ownership
    with get_db_cursor() as cur:
        cur.execute("SELECT user_id FROM farms WHERE id = %s", (payload.farm_id,))
        farm = cur.fetchone()
    
    if not farm or (farm["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized for this farm")
        
    with get_db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO crops (farm_id, crop_name, hectares_planted)
            VALUES (%s, %s, %s)
            RETURNING id, farm_id, crop_name, hectares_planted
            """,
            (payload.farm_id, payload.crop_name, payload.hectares_planted)
        )
        row = cur.fetchone()
    return row

@router.get("/farm/{farm_id}", response_model=List[CropResponse])
def list_crops_by_farm(farm_id: int, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    with get_db_cursor() as cur:
        cur.execute("SELECT user_id FROM farms WHERE id = %s", (farm_id,))
        farm = cur.fetchone()
        
    if not farm or (farm["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    with get_db_cursor() as cur:
        cur.execute("SELECT id, farm_id, crop_name, hectares_planted FROM crops WHERE farm_id = %s ORDER BY created_at DESC", (farm_id,))
        rows = cur.fetchall()
    return rows

@router.put("/{crop_id}", response_model=CropResponse)
def update_crop(crop_id: int, payload: CropUpdate, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    
    with get_db_cursor() as cur:
        cur.execute("SELECT c.id, c.farm_id, f.user_id FROM crops c JOIN farms f ON c.farm_id = f.id WHERE c.id = %s", (crop_id,))
        crop = cur.fetchone()
        
    if not crop or (crop["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    with get_db_cursor() as cur:
        cur.execute(
            """
            UPDATE crops
            SET crop_name = %s, hectares_planted = %s
            WHERE id = %s
            RETURNING id, farm_id, crop_name, hectares_planted
            """,
            (payload.crop_name, payload.hectares_planted, crop_id)
        )
        row = cur.fetchone()
    return row

@router.delete("/{crop_id}", status_code=204)
def delete_crop(crop_id: int, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    
    with get_db_cursor() as cur:
        cur.execute("SELECT c.id, f.user_id FROM crops c JOIN farms f ON c.farm_id = f.id WHERE c.id = %s", (crop_id,))
        crop = cur.fetchone()
        
    if not crop or (crop["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    with get_db_cursor() as cur:
        cur.execute("DELETE FROM crops WHERE id = %s", (crop_id,))
    return None
