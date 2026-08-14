import requests
from fastapi import APIRouter

router = APIRouter()


def get_weather(latitude, longitude):

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}&longitude={longitude}"
        "&current=temperature_2m,relative_humidity_2m,rain,"
        "wind_speed_10m,pressure_msl"
        "&daily=rain_sum"
        "&timezone=auto"
    )

    response = requests.get(url, timeout=10)
    response.raise_for_status()

    data = response.json()

    return {
        "temperature": data["current"]["temperature_2m"],
        "humidity": data["current"]["relative_humidity_2m"],
        "rainfall": data["current"]["rain"],
        "wind_speed": data["current"]["wind_speed_10m"],
        "pressure": data["current"]["pressure_msl"],
        "today_rainfall": data["daily"]["rain_sum"][0]
    }


def weather_status(temp, rainfall):

    if 20 <= temp <= 30 and rainfall >= 10:
        return "Optimal"

    elif temp > 35:
        return "Heat Stress"

    elif rainfall < 1:
        return "Low Rainfall"

    else:
        return "Moderate"


@router.get("/weather")
def weather(latitude: float, longitude: float):

    data = get_weather(latitude, longitude)

    data["condition"] = weather_status(
        data["temperature"],
        data["rainfall"]
    )

    return data