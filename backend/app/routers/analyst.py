"""
YieldSense AI - Analyst Router
Platform-wide analytics for Analyst and Admin roles.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.core.deps import get_current_user
from app import models
from app.services.analytics_service import AnalystService

router = APIRouter(prefix="/api/v1/analyst", tags=["Analyst"])


def require_analyst(current_user: models.User = Depends(get_current_user)):
    """Allow Analyst and Admin roles; block Farmer."""
    if current_user.role not in ("Analyst", "Admin"):
        raise HTTPException(status_code=403, detail="Analyst or Admin access required")
    return current_user


@router.get("/dashboard")
def analyst_dashboard(
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.dashboard(db)


@router.get("/yield-trends")
def analyst_yield_trends(
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.yield_trends(db)


@router.get("/crop-performance")
def analyst_crop_performance(
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.crop_performance(db)


@router.get("/weather-impact")
def analyst_weather_impact(
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.weather_impact(db)


@router.get("/soil-analysis")
def analyst_soil_analysis(
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.soil_analysis(db)


@router.get("/farm-comparison")
def analyst_farm_comparison(
    limit: Optional[int] = None,
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.farm_comparison(db, limit)


@router.get("/productivity")
def analyst_productivity(
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.productivity(db)


@router.get("/risk-distribution")
def analyst_risk_distribution(
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.risk_distribution(db)


@router.get("/recent-predictions")
def analyst_recent_predictions(
    limit: int = 10,
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.recent_predictions(db, limit)


@router.get("/reports")
def analyst_reports(
    days: int = 30,
    db: Session = Depends(get_db),
    _current_user: models.User = Depends(require_analyst),
):
    return AnalystService.reports(db, days)