"""
YieldSense AI  -  API v1 Router

Aggregates all v1 API routers into a single unified router.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.farms import router as farms_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.health import router as health_router
from app.api.v1.prediction import router as prediction_router
from app.api.v1.weather import router as weather_router
from app.api.v1.soil import router as soil_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.risk import router as risk_router
from app.api.v1.history import router as history_router
from app.api.v1.reports import router as reports_router
from app.api.v1.exports import router as exports_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter()

# Core Authentication & User Management
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(farms_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(health_router)

# Machine Learning, Weather & Soil Analysis
api_v1_router.include_router(prediction_router)
api_v1_router.include_router(weather_router)
api_v1_router.include_router(soil_router)

# Analytics, Advisory, History & Reporting
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(recommendations_router)
api_v1_router.include_router(risk_router)
api_v1_router.include_router(history_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(exports_router)
api_v1_router.include_router(admin_router)
