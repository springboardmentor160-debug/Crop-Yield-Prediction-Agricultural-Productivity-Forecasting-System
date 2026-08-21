"""
YieldSense AI - Yield Prediction Router
Module 3: Crop yield forecasting endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.core.deps import get_current_user
from app.ml.predictor import predict, get_model_metrics, get_available_crops
from app.core.notify import send_notification

router = APIRouter(prefix="/api/v1/predictions", tags=["Yield Prediction"])

@router.post("/predict", response_model=schemas.PredictionOut)
def predict_yield(
    request: schemas.PredictionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify farm belongs to user
    farm = db.query(models.Farm).filter(
        models.Farm.id == request.farm_id,
        models.Farm.user_id == current_user.id
    ).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Run ML prediction
    result = predict(
        crop_type=request.crop_type,
        rainfall=request.rainfall_mm,
        temperature=request.temperature_c,
        humidity=request.humidity_percent,
        soil_ph=request.soil_ph,
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
    )

    # Save prediction to database
    prediction = models.Prediction(
        farm_id=request.farm_id,
        crop_type=request.crop_type,
        rainfall_mm=request.rainfall_mm,
        temperature_c=request.temperature_c,
        humidity_percent=request.humidity_percent,
        soil_ph=request.soil_ph,
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
        predicted_yield_tons_per_ha=result["predicted_yield_tons_per_ha"],
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # Send notification if high risk
    if result["risk_level"] == "High":
        send_notification(
            db=db,
            user_id=current_user.id,
            title="High Risk Alert",
            message=f"High risk detected for {request.crop_type} on farm {farm.farm_name}. Predicted yield: {result['predicted_yield_tons_per_ha']} t/ha"
        )

    return {
        "id": prediction.id,
        "crop_type": prediction.crop_type,
        "predicted_yield_tons_per_ha": prediction.predicted_yield_tons_per_ha,
        "confidence_score": prediction.confidence_score,
        "risk_level": prediction.risk_level,
        "recommendations": result["recommendations"],
        "created_at": prediction.created_at,
    }

@router.get("/history", response_model=List[schemas.PredictionHistoryOut])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    predictions = db.query(models.Prediction).filter(
        models.Prediction.farm_id.in_(farm_ids)
    ).order_by(models.Prediction.created_at.desc()).all()
    return predictions

@router.get("/farm/{farm_id}", response_model=List[schemas.PredictionHistoryOut])
def get_farm_predictions(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farm = db.query(models.Farm).filter(
        models.Farm.id == farm_id,
        models.Farm.user_id == current_user.id
    ).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    predictions = db.query(models.Prediction).filter(
        models.Prediction.farm_id == farm_id
    ).order_by(models.Prediction.created_at.desc()).all()
    return predictions

@router.get("/model/metrics")
def model_metrics(current_user: models.User = Depends(get_current_user)):
    return get_model_metrics()

@router.get("/crops/available")
def available_crops(current_user: models.User = Depends(get_current_user)):
    return {"crops": get_available_crops()}
