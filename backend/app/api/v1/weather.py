"""
YieldSense AI  -  Weather Endpoints

Weather data routes using the Open-Meteo service.
"""

from fastapi import APIRouter, Query

from app.services.weather_service import get_current_weather, get_weather_forecast

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/", summary="Get current weather")
async def current_weather(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
):
    """
    Get current weather conditions for a location.

    Uses Open-Meteo (free, no API key required).
    Results are cached for 5 minutes.
    """
    return await get_current_weather(lat, lon)


@router.get("/forecast", summary="Get weather forecast")
async def weather_forecast(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    days: int = Query(default=7, ge=1, le=16, description="Forecast days"),
):
    """
    Get weather forecast for a location (up to 16 days).

    Uses Open-Meteo (free, no API key required).
    Results are cached for 5 minutes.
    """
    return await get_weather_forecast(lat, lon, days)
