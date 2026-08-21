"""
YieldSense AI - Weather Analysis Router
Module 4: Rainfall, temperature, climate trends
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app import models
from app.database import get_db
from app.core.permissions import require_permission, check_farm_ownership
from app.services.weather_service import WeatherService
router = APIRouter(prefix="/api/v1/weather", tags=["Weather Analysis"])

# Mock weather data - replace with real API (OpenWeatherMap) later
WEATHER_DATA = {
    "Bhubaneswar": {"temp": 32.5, "rainfall": 1450, "humidity": 78, "condition": "Partly Cloudy"},
    "Mumbai": {"temp": 29.0, "rainfall": 2400, "humidity": 82, "condition": "Humid"},
    "Delhi": {"temp": 35.0, "rainfall": 650, "humidity": 45, "condition": "Hot & Dry"},
    "Chennai": {"temp": 30.0, "rainfall": 1200, "humidity": 75, "condition": "Warm"},
    "Kolkata": {"temp": 31.0, "rainfall": 1600, "humidity": 80, "condition": "Tropical"},
    "Pune": {"temp": 27.0, "rainfall": 720, "humidity": 55, "condition": "Pleasant"},
    "Default": {"temp": 28.0, "rainfall": 1000, "humidity": 65, "condition": "Moderate"},
}

MONTHLY_RAINFALL = {
    "Jan": 12, "Feb": 18, "Mar": 25, "Apr": 45,
    "Jun": 180, "Jul": 320, "Aug": 290, "Sep": 210,
    "Oct": 85, "Nov": 30, "Dec": 15,
}


@router.get("/current")
def get_current_weather(
    location: str = "Bhubaneswar",
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):

    weather = WeatherService.get_current_weather(location)

    return weather





@router.get("/forecast")
def get_weather_forecast(
    location: str = "Bhubaneswar",
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):
    return {
        "location": location,
        "forecast": WeatherService.get_7day_forecast(location)
    }


@router.get("/rainfall-trend")
def get_rainfall_trend(
    current_user: models.User = Depends(require_permission("view_own_farms"))
):
    return {
        "monthly_rainfall_mm": MONTHLY_RAINFALL,
        "annual_total_mm": sum(MONTHLY_RAINFALL.values()),
        "peak_month": "July",
        "dry_months": ["Jan", "Feb", "Dec"],
        "wet_months": ["Jun", "Jul", "Aug", "Sep"],
    }


@router.get("/climate-analysis")
def get_climate_analysis(
    location: str = "Bhubaneswar",
    current_user: models.User = Depends(require_permission("view_own_farms"))
):
    return {
        "location": location,
        "climate_zone": "Tropical Wet and Dry",
        "growing_seasons": [
            {"season": "Kharif", "months": "Jun-Oct", "crops": ["Rice", "Maize", "Soybean"], "rainfall": "High"},
            {"season": "Rabi", "months": "Nov-Mar", "crops": ["Wheat", "Mustard", "Chickpea"], "rainfall": "Low"},
            {"season": "Zaid", "months": "Apr-Jun", "crops": ["Vegetables", "Fruits"], "rainfall": "Very Low"},
        ],
        "temperature_range": {"min_c": 12, "max_c": 42, "optimal_c": 28},
        "risk_factors": [
            {"factor": "Drought", "probability": "25%", "months": "Mar-May"},
            {"factor": "Flood", "probability": "15%", "months": "Jul-Aug"},
            {"factor": "Heat Stress", "probability": "35%", "months": "Apr-Jun"},
        ],
    }


@router.get("/impact-assessment")
def weather_impact_assessment(
    rainfall_mm: float = 1000,
    temperature_c: float = 28,
    crop_type: str = "wheat",
    current_user: models.User = Depends(require_permission("view_own_farms"))
):
    impact_score = 100
    issues = []

    if rainfall_mm < 400:
        impact_score -= 30
        issues.append("Severe drought stress")
    elif rainfall_mm < 700:
        impact_score -= 15
        issues.append("Moderate water deficit")
    elif rainfall_mm > 2500:
        impact_score -= 20
        issues.append("Waterlogging risk")

    if temperature_c > 38:
        impact_score -= 25
        issues.append("Extreme heat stress")
    elif temperature_c > 33:
        impact_score -= 10
        issues.append("Mild heat stress")
    elif temperature_c < 10:
        impact_score -= 20
        issues.append("Cold damage risk")

    return {
        "crop_type": crop_type,
        "rainfall_mm": rainfall_mm,
        "temperature_c": temperature_c,
        "impact_score": max(0, impact_score),
        "impact_level": "Favorable" if impact_score >= 80 else "Moderate" if impact_score >= 60 else "Adverse",
        "issues_detected": issues,
        "recommendation": "Conditions are suitable for planting." if impact_score >= 80
                          else "Take precautionary measures before planting.",
    }


# ── NEW: weather alerts on dashboard ──
@router.get("/alerts")
def get_alerts(
    location: str = Query(...),
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):
    weather = WeatherService.get_current_weather(location)

    return {
        "location": location,
        "generated_at": datetime.utcnow().isoformat(),
        "alerts": WeatherService.generate_alerts(weather)
    }

# ── NEW: historical weather ──
@router.get("/history")
def get_weather_history(
    location: str = "Bhubaneswar",
    days: int = 30,
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):
    return {
        "location": location,
        "history": WeatherService.get_historical_weather(
            location,
            days
        )
    }


@router.get("/advisory")
def agricultural_advisory(
    location: str = "Bhubaneswar",
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):

    weather = WeatherService.get_current_weather(location)
    advisory_items = WeatherService.agricultural_advisory(weather)
    advisory_text = " ".join(item.get("advice", str(item)) for item in advisory_items)

    return {
        "location": location,
        "advisory": advisory_text
    }

@router.get("/hourly")
def get_hourly_weather(
    location: str = "Bhubaneswar",
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):
    return {
        "location": location,
        "hourly": WeatherService.get_hourly_forecast(location)
    }
@router.get("/risk")
def weather_risk(
    location: str = "Bhubaneswar",
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):

    weather = WeatherService.get_current_weather(location)

    return WeatherService.calculate_risk(weather)

@router.get("/dashboard")
def weather_dashboard(
    location: str = "Bhubaneswar",
    current_user: models.User = Depends(
        require_permission("view_own_farms")
    ),
):

    current = WeatherService.get_current_weather(location)

    return {

        "current": current,

        "forecast": WeatherService.get_7day_forecast(location),

        "hourly": WeatherService.get_hourly_forecast(location),

        "history": WeatherService.get_historical_weather(location, 30),

        "risk": WeatherService.calculate_risk(current),

        "alerts": WeatherService.generate_alerts(current),

        "advisory": WeatherService.agricultural_advisory(current)

    }
