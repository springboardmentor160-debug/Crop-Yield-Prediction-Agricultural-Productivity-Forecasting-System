import os
import requests
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
CITY = "Hyderabad"


@router.get("/weather")
def get_weather():

    if not API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenWeatherMap API key is not configured"
        )

    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={CITY}&appid={API_KEY}&units=metric"
    )

    response = requests.get(url)

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=response.json()
        )

    data = response.json()

    return {
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"],
        "weather": data["weather"][0]["main"],
        "city": data["name"],
        "description": data["weather"][0]["description"]
    }