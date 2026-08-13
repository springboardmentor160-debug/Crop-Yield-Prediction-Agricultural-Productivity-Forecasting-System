"""
YieldSense AI - Analytics Router v2
Uses AnalyticsService for clean separation
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app import models
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.dashboard(db, current_user.id)

@router.get("/yield-trends")
def yield_trends(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.yield_trends(db, current_user.id)

@router.get("/crop-performance")
def crop_performance(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.crop_performance(db, current_user.id)

@router.get("/farm-comparison")
def farm_comparison(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.farm_comparison(db, current_user.id)

@router.get("/productivity")
def productivity(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.productivity(db, current_user.id)

@router.get("/risk-distribution")
def risk_distribution(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.risk_distribution(db, current_user.id)

@router.get("/soil-health")
def soil_health(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.soil_health(db, current_user.id)

@router.get("/weather-impact")
def weather_impact(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.weather_impact(db, current_user.id)

@router.get("/recent-predictions")
def recent_predictions(limit: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.recent_predictions(db, current_user.id, limit)

@router.get("/model-performance")
def model_performance(current_user: models.User = Depends(get_current_user)):
    return AnalyticsService.model_performance()
