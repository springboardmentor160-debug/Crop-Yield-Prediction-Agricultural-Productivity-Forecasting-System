from fastapi import APIRouter

router = APIRouter()

@router.get("/soil")
def soil_health():
    return {
        "soil_health": "Healthy",
        "ph": 6.8,
        "nitrogen": "Medium",
        "phosphorus": "High",
        "potassium": "Medium",
        "moisture": "65%"
    }