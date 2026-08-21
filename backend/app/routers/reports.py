"""
YieldSense AI - Reports Router
Module 9: PDF/CSV/Excel report generation
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.core.deps import get_current_user
from app.ml.predictor import get_model_metrics
import json
from datetime import datetime

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.get("/prediction-summary")
def get_prediction_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    predictions = db.query(models.Prediction).filter(
        models.Prediction.farm_id.in_(farm_ids)
    ).order_by(models.Prediction.created_at.desc()).all() if farm_ids else []

    avg_yield = round(sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2) if predictions else 0

    return {
        "report_type": "Prediction Summary",
        "generated_at": datetime.now().isoformat(),
        "generated_by": current_user.full_name,
        "summary": {
            "total_predictions": len(predictions),
            "average_yield": avg_yield,
            "high_risk_count": len([p for p in predictions if p.risk_level == "High"]),
            "low_risk_count": len([p for p in predictions if p.risk_level == "Low"]),
            "crops_analyzed": list(set(p.crop_type for p in predictions)),
        },
        "predictions": [
            {
                "id": p.id,
                "crop_type": p.crop_type,
                "predicted_yield": p.predicted_yield_tons_per_ha,
                "confidence": p.confidence_score,
                "risk_level": p.risk_level,
                "rainfall_mm": p.rainfall_mm,
                "temperature_c": p.temperature_c,
                "soil_ph": p.soil_ph,
                "date": p.created_at.strftime("%Y-%m-%d"),
            }
            for p in predictions[:20]
        ]
    }

@router.get("/farm-report")
def get_farm_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_data = []
    for farm in farms:
        preds = db.query(models.Prediction).filter(models.Prediction.farm_id == farm.id).all()
        farm_data.append({
            "farm_name": farm.farm_name,
            "location": farm.location,
            "area_hectares": farm.area_hectares,
            "soil_ph": farm.soil_ph,
            "total_predictions": len(preds),
            "avg_yield": round(sum(p.predicted_yield_tons_per_ha for p in preds) / len(preds), 2) if preds else 0,
            "created_date": farm.created_at.strftime("%Y-%m-%d"),
        })
    return {
        "report_type": "Farm Report",
        "generated_at": datetime.now().isoformat(),
        "total_farms": len(farms),
        "farms": farm_data
    }

@router.get("/weather-report")
def get_weather_report(current_user: models.User = Depends(get_current_user)):
    return {
        "report_type": "Weather Report",
        "generated_at": datetime.now().isoformat(),
        "period": "Current Season 2026",
        "summary": {
            "avg_temperature_c": 28.5,
            "total_rainfall_mm": 842,
            "peak_rain_month": "July",
            "dry_months": ["Jan", "Feb", "Mar"],
            "weather_alerts": 3,
        },
        "monthly_data": [
            {"month": "Jan", "temp": 22, "rain": 12, "humidity": 45},
            {"month": "Feb", "temp": 25, "rain": 18, "humidity": 50},
            {"month": "Mar", "temp": 29, "rain": 25, "humidity": 55},
            {"month": "Apr", "temp": 33, "rain": 45, "humidity": 60},
            {"month": "May", "temp": 36, "rain": 80, "humidity": 65},
            {"month": "Jun", "temp": 32, "rain": 180, "humidity": 80},
            {"month": "Jul", "temp": 29, "rain": 320, "humidity": 85},
            {"month": "Aug", "temp": 28, "rain": 290, "humidity": 82},
            {"month": "Sep", "temp": 29, "rain": 210, "humidity": 78},
            {"month": "Oct", "temp": 28, "rain": 85, "humidity": 70},
            {"month": "Nov", "temp": 25, "rain": 30, "humidity": 55},
            {"month": "Dec", "temp": 22, "rain": 15, "humidity": 48},
        ]
    }

@router.get("/soil-report")
def get_soil_report(current_user: models.User = Depends(get_current_user)):
    return {
        "report_type": "Soil Health Report",
        "generated_at": datetime.now().isoformat(),
        "overall_soil_health": "Good",
        "health_score": 72,
        "parameters": {
            "ph": {"value": 6.5, "status": "Optimal", "range": "6.0-7.0"},
            "nitrogen": {"value": 85, "unit": "kg/ha", "status": "Good"},
            "phosphorus": {"value": 42, "unit": "kg/ha", "status": "Optimal"},
            "potassium": {"value": 65, "unit": "kg/ha", "status": "Good"},
            "organic_carbon": {"value": 1.2, "unit": "%", "status": "Low"},
            "moisture": {"value": 35, "unit": "%", "status": "Adequate"},
        },
        "recommendations": [
            "Add organic matter to improve soil structure",
            "Apply micronutrients zinc and boron",
            "Consider green manure crops next season",
        ]
    }

@router.get("/export/csv")
def export_csv(
    report_type: str = "predictions",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    predictions = db.query(models.Prediction).filter(
        models.Prediction.farm_id.in_(farm_ids)
    ).all() if farm_ids else []

    csv_data = "id,crop_type,yield_tons_ha,confidence,risk_level,rainfall_mm,temperature_c,soil_ph,date\n"
    for p in predictions:
        csv_data += f"{p.id},{p.crop_type},{p.predicted_yield_tons_per_ha},{p.confidence_score},{p.risk_level},{p.rainfall_mm},{p.temperature_c},{p.soil_ph},{p.created_at.strftime('%Y-%m-%d')}\n"

    return {
        "filename": f"yieldsense_predictions_{datetime.now().strftime('%Y%m%d')}.csv",
        "content_type": "text/csv",
        "data": csv_data,
        "rows": len(predictions)
    }
