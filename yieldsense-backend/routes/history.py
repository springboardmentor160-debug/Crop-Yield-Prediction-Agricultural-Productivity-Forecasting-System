from fastapi import APIRouter
from database import SessionLocal
from models.prediction import Prediction

router = APIRouter()

@router.get("/history")
def history():

    db = SessionLocal()

    rows = db.query(Prediction).all()

    result = []

    for row in rows:
        result.append({
            "area": row.area,
            "item": row.item,
            "predicted_yield": row.predicted_yield
        })

    db.close()

    return result