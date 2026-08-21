"""
YieldSense AI - Alerts Router
"""
from fastapi import APIRouter, Depends
from app import models
from app.core.deps import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])

@router.get("/")
def get_alerts(current_user: models.User = Depends(get_current_user)):
    return {
        "alerts": [
            {"id": 1, "type": "weather", "priority": "high", "icon": "🌧️", "title": "Heavy Rain Expected", "message": "Heavy rainfall (80mm+) expected in next 24 hours. Ensure proper drainage.", "time": "2 hours ago", "is_read": False},
            {"id": 2, "type": "temperature", "priority": "medium", "icon": "🌡️", "title": "High Temperature Alert", "message": "Temperature forecast 38°C tomorrow. Irrigate crops early morning.", "time": "4 hours ago", "is_read": False},
            {"id": 3, "type": "disease", "priority": "medium", "icon": "🦠", "title": "Disease Risk: Medium", "message": "High humidity conditions increase fungal disease risk. Monitor weekly.", "time": "1 day ago", "is_read": True},
            {"id": 4, "type": "harvest", "priority": "high", "icon": "🌾", "title": "Harvest Reminder", "message": "Wheat crop is approaching maturity. Plan harvest in next 2 weeks.", "time": "1 day ago", "is_read": False},
            {"id": 5, "type": "prediction", "priority": "low", "icon": "📊", "title": "New Prediction Ready", "message": "Your yield prediction for Farm 1 is ready. Predicted yield: 4.67 t/ha.", "time": "2 days ago", "is_read": True},
            {"id": 6, "type": "soil", "priority": "medium", "icon": "🧪", "title": "Low Soil Moisture", "message": "Soil moisture below optimal. Schedule irrigation within 48 hours.", "time": "2 days ago", "is_read": False},
        ],
        "unread_count": 4,
        "total": 6,
    }

@router.put("/read/{alert_id}")
def mark_read(alert_id: int, current_user: models.User = Depends(get_current_user)):
    return {"message": f"Alert {alert_id} marked as read", "alert_id": alert_id}

@router.put("/read-all")
def mark_all_read(current_user: models.User = Depends(get_current_user)):
    return {"message": "All alerts marked as read"}

@router.delete("/{alert_id}")
def delete_alert(alert_id: int, current_user: models.User = Depends(get_current_user)):
    return {"message": f"Alert {alert_id} deleted"}

@router.get("/weather-alerts")
def get_weather_alerts(current_user: models.User = Depends(get_current_user)):
    return {
        "alerts": [
            {"type": "Heavy Rain", "severity": "High", "expected": "Tomorrow", "advice": "Check drainage"},
            {"type": "Heat Wave", "severity": "Medium", "expected": "Next 3 days", "advice": "Increase irrigation"},
        ]
    }
