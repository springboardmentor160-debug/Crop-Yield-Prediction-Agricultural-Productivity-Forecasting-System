"""
routers/farms.py — Farm Profile creation and retrieval (Task 1, step 2 of the pipeline plan).
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from auth_handler import get_current_user
from database import get_db_cursor
from models import FarmCreate, FarmResponse

router = APIRouter(prefix="/api/v1/farms", tags=["Farms"])


@router.post("", response_model=FarmResponse, status_code=201)
def create_farm(payload: FarmCreate, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    with get_db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO farms (user_id, farm_name, latitude, longitude, soil_ph, soil_n, soil_p, soil_k)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, user_id, farm_name, latitude, longitude, soil_ph, soil_n, soil_p, soil_k
            """,
            (
                user_id,
                payload.farm_name,
                payload.latitude,
                payload.longitude,
                payload.soil_ph,
                payload.soil_n,
                payload.soil_p,
                payload.soil_k,
            ),
        )
        row = cur.fetchone()
    return row


@router.get("", response_model=List[FarmResponse])
def list_my_farms(user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, user_id, farm_name, latitude, longitude, soil_ph, soil_n, soil_p, soil_k
            FROM farms WHERE user_id = %s ORDER BY created_at DESC
            """,
            (user_id,),
        )
        rows = cur.fetchall()
    return rows


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, user: dict = Depends(get_current_user)):
    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, user_id, farm_name, latitude, longitude, soil_ph, soil_n, soil_p, soil_k
            FROM farms WHERE id = %s
            """,
            (farm_id,),
        )
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Farm not found")
    if row["user_id"] != int(user["sub"]) and user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="You do not have access to this farm")
    return row

@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: int, payload: FarmCreate, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    with get_db_cursor() as cur:
        cur.execute("SELECT user_id FROM farms WHERE id = %s", (farm_id,))
        farm = cur.fetchone()
        
    if not farm or (farm["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    with get_db_cursor() as cur:
        cur.execute(
            """
            UPDATE farms
            SET farm_name=%s, latitude=%s, longitude=%s, soil_ph=%s, soil_n=%s, soil_p=%s, soil_k=%s
            WHERE id=%s
            RETURNING id, user_id, farm_name, latitude, longitude, soil_ph, soil_n, soil_p, soil_k
            """,
            (payload.farm_name, payload.latitude, payload.longitude, payload.soil_ph, payload.soil_n, payload.soil_p, payload.soil_k, farm_id)
        )
        row = cur.fetchone()
    return row

@router.delete("/{farm_id}", status_code=204)
def delete_farm(farm_id: int, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    with get_db_cursor() as cur:
        cur.execute("SELECT user_id FROM farms WHERE id = %s", (farm_id,))
        farm = cur.fetchone()
        
    if not farm or (farm["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    with get_db_cursor() as cur:
        cur.execute("DELETE FROM farms WHERE id = %s", (farm_id,))
    return None
