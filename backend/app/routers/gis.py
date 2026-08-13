"""
YieldSense AI - GIS Router
Farm location, geo data, mapping endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/gis", tags=["GIS & Maps"])

@router.get("/farms/locations")
def get_farm_locations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    locations = []
    for farm in farms:
        preds = db.query(models.Prediction).filter(models.Prediction.farm_id == farm.id).all()
        avg_yield = round(sum(p.predicted_yield_tons_per_ha for p in preds) / len(preds), 2) if preds else 0
        risk = preds[0].risk_level if preds else "Unknown"
        locations.append({
            "id": farm.id,
            "name": farm.farm_name,
            "latitude": farm.latitude or 20.2961,
            "longitude": farm.longitude or 85.8245,
            "location": farm.location or "Unknown",
            "area_hectares": farm.area_hectares,
            "soil_ph": farm.soil_ph,
            "avg_yield": avg_yield,
            "risk_level": risk,
            "total_predictions": len(preds),
            "marker_color": "#22c55e" if risk == "Low" else "#f59e0b" if risk == "Medium" else "#ef4444",
        })
    return {
        "farms": locations,
        "total": len(locations),
        "center": {
            "lat": locations[0]["latitude"] if locations else 20.5937,
            "lng": locations[0]["longitude"] if locations else 78.9629,
        }
    }

@router.get("/weather-overlay")
def get_weather_overlay(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "overlays": [
            {"type": "rainfall", "intensity": "high", "lat": 20.2961, "lng": 85.8245, "value": "320mm"},
            {"type": "temperature", "intensity": "medium", "lat": 20.5, "lng": 85.5, "value": "28°C"},
            {"type": "humidity", "intensity": "high", "lat": 20.8, "lng": 86.0, "value": "78%"},
        ]
    }

@router.get("/soil-zones")
def get_soil_zones(current_user: models.User = Depends(get_current_user)):
    return {
        "zones": [
            {"zone": "Zone A", "soil_type": "Alluvial", "ph": 6.8, "fertility": "High", "lat": 20.2961, "lng": 85.8245},
            {"zone": "Zone B", "soil_type": "Red Laterite", "ph": 5.9, "fertility": "Medium", "lat": 20.5, "lng": 85.5},
            {"zone": "Zone C", "soil_type": "Black Cotton", "ph": 7.2, "fertility": "High", "lat": 20.8, "lng": 86.0},
        ]
    }

@router.get("/nearby-stations")
def get_nearby_stations(
    lat: float = 20.2961,
    lng: float = 85.8245,
    current_user: models.User = Depends(get_current_user)
):
    return {
        "weather_stations": [
            {"name": "Bhubaneswar AWS", "distance_km": 2.3, "lat": 20.2900, "lng": 85.8100, "status": "Active"},
            {"name": "Cuttack Station", "distance_km": 28.5, "lat": 20.4620, "lng": 85.8830, "status": "Active"},
        ],
        "soil_labs": [
            {"name": "OUAT Soil Lab", "distance_km": 5.1, "address": "Bhubaneswar", "contact": "0674-2397700"},
        ]
    }
