from fastapi import APIRouter
from pydantic import BaseModel
from database import get_conn

router = APIRouter()


class Farm(BaseModel):

    farm_name: str
    location: str
    latitude: float
    longitude: float

    area: float

    crop_type: str
    season: str

    soil_type: str
    soil_ph: float

    nitrogen: float
    phosphorus: float
    potassium: float


# ---------------- SAVE FARM ---------------- #

@router.post("/farm")
def save_farm(data: Farm):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO farms(
        farm_name,
        location,
        latitude,
        longitude,
        area,
        crop_type,
        season,
        soil_type,
        soil_ph,
        nitrogen,
        phosphorus,
        potassium
        )

        VALUES(
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
        )
    """,
    (
        data.farm_name,
        data.location,
        data.latitude,
        data.longitude,
        data.area,
        data.crop_type,
        data.season,
        data.soil_type,
        data.soil_ph,
        data.nitrogen,
        data.phosphorus,
        data.potassium
    ))

    conn.commit()
    cur.close()
    conn.close()

    return {"message":"Farm Saved Successfully"}


# ---------------- GET FARM ---------------- #

@router.get("/farm")
def get_farm():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT
        farm_name,
        location,
        latitude,
        longitude,
        area,
        crop_type,
        season,
        soil_type,
        soil_ph,
        nitrogen,
        phosphorus,
        potassium
        FROM farms
        ORDER BY id DESC
        LIMIT 1
    """)

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row is None:
        return {"message":"No Farm Found"}

    return {
        "farm_name": row[0],
        "location": row[1],
        "latitude": row[2],
        "longitude": row[3],
        "area": row[4],
        "crop_type": row[5],
        "season": row[6],
        "soil_type": row[7],
        "soil_ph": row[8],
        "nitrogen": row[9],
        "phosphorus": row[10],
        "potassium": row[11]
    }