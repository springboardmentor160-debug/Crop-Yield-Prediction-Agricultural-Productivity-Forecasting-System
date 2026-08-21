"""
YieldSense AI  -  Analytics API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user_id
from app.schemas.analytics import DashboardSummaryResponse, AnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardSummaryResponse, summary="Get live dashboard summary")
async def get_dashboard_summary(user_id: str = Depends(get_current_user_id)):
    """
    Get real-time dashboard summary including farm stats, recent predictions,
    risk overview, and ML model status.
    """
    try:
        svc = AnalyticsService()
        data = svc.get_dashboard_summary(user_id)
        return DashboardSummaryResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")


@router.get("/", response_model=AnalyticsResponse, summary="Get full analytics chart data")
async def get_analytics(user_id: str = Depends(get_current_user_id)):
    """
    Get full analytics data for charts:
    yield trend, crop comparison, season comparison, rainfall vs yield scatter.
    """
    try:
        svc = AnalyticsService()
        data = svc.get_analytics_data(user_id)
        return AnalyticsResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics data error: {str(e)}")
