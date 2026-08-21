"""
YieldSense AI - Main Application v3
All modules registered
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine
from app import models

from app.routers import (
    auth, users, farms, data_collection,
    yield_prediction, weather, soil,
    analytics, recommendations, risk,
    reports, advisor, alerts,
    admin, notifications, gis,
)
from app.routers import analyst_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Crop Yield Prediction & Agricultural Productivity Forecasting System",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Milestone 1
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(farms.router)
app.include_router(data_collection.router)



# ── Milestone 2
app.include_router(yield_prediction.router)
app.include_router(weather.router)
app.include_router(soil.router)



# ── Milestone 3
app.include_router(analytics.router)
app.include_router(analyst_router.router)
app.include_router(recommendations.router)
app.include_router(risk.router)
app.include_router(reports.router)
app.include_router(advisor.router)
app.include_router(alerts.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(gis.router)




@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "YieldSense Engine Core",
        "version": "3.0.0",
        "modules": [
            "Authentication", "Farm Management",
            "Yield Prediction", "Weather Analysis", "Soil Analysis",
            "Analytics", "Analyst", "Recommendations",
            "Risk Assessment", "Reports", "AI Advisor",
            "Alerts", "Admin", "Notifications", "GIS",
        ]
    }
