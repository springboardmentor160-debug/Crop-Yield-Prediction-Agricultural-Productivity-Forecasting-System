from fastapi import APIRouter, HTTPException, Depends
from app.models import YieldPredictionRequest
from app.services.prediction_service import get_yield_prediction
from app.ml_service import ModelUnavailableError
from app.auth_handler import get_current_user
from app.db import execute

router = APIRouter(prefix="/api/v1", tags=["Yield Prediction"])

@router.post("/predict-yield")
def predict_yield_endpoint(payload: YieldPredictionRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = get_yield_prediction(payload)
        user_id = int(current_user["sub"]) if current_user else None
        execute(
            """
            INSERT INTO prediction_logs (user_id, crop_name, avg_temp, rainfall, soil_ph, nitrogen, phosphorus, potassium, predicted_yield, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                payload.crop_name or "Rice",
                payload.avg_temp,
                payload.rainfall,
                payload.soil_ph,
                payload.nitrogen or 0.0,
                payload.phosphorus or 0.0,
                payload.potassium or 0.0,
                result.get("predicted_yield_kg_per_ha") or result.get("predicted_yield"),
                result.get("confidence_score"),
            )
        )
        return result
    except ModelUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Yield prediction failed: {exc}")

@router.post("/predict")
def predict_alias_endpoint(payload: YieldPredictionRequest, current_user: dict = Depends(get_current_user)):
    return predict_yield_endpoint(payload, current_user)

