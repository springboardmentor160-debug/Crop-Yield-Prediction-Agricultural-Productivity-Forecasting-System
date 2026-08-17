from fastapi import APIRouter, Depends
from app.models import WeatherAnalysisRequest
from app.services.prediction_service import get_weather_analysis
from app.auth_handler import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Weather Analysis"])

@router.get("/weather-analysis")
@router.get("/weather-overview")
def get_weather_overview(avg_temp: float = 27.5, rainfall: float = 1200.0, humidity: float = 65.0, current_user: dict = Depends(get_current_user)):
    return get_weather_analysis(avg_temp, rainfall, humidity)

@router.post("/weather-analysis")
@router.post("/weather/analyze")
def post_weather_analysis(payload: WeatherAnalysisRequest, current_user: dict = Depends(get_current_user)):
    return get_weather_analysis(payload.avg_temp, payload.rainfall)
