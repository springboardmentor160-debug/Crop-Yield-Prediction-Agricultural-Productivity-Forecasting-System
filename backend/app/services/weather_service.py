import requests
from fastapi import HTTPException
from datetime import date, timedelta

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

WEATHER_CODES = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Heavy Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Severe Thunderstorm"
}


class WeatherService:

    @staticmethod
    def get_coordinates(city: str):

        response = requests.get(
            GEOCODE_URL,
            params={
                "name": city,
                "count": 1
            },
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Unable to connect to geocoding service."
            )

        data = response.json()

        if not data.get("results"):
            raise HTTPException(
                status_code=404,
                detail=f"City '{city}' not found."
            )

        place = data["results"][0]

        return {
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "name": place["name"],
            "country": place.get("country", "")
        }

    @staticmethod
    def get_current_weather(city: str):

        location = WeatherService.get_coordinates(city)

        response = requests.get(
            FORECAST_URL,
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "current": [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "precipitation",
                    "weather_code",
                    "wind_speed_10m"
                ]
            },
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch weather."
            )

        current = response.json()["current"]

        return {
            "location": location["name"],
            "country": location["country"],
            "temperature_c": current["temperature_2m"],
            "feels_like": current["apparent_temperature"],
            "humidity_percent": current["relative_humidity_2m"],
            "wind_speed_kmh": current["wind_speed_10m"],
            "rainfall_mm": current["precipitation"],
            "weather_code": current["weather_code"],
            "condition": WEATHER_CODES.get(
                current["weather_code"],
                "Unknown"
            ),
            "latitude": location["latitude"],
            "longitude": location["longitude"]
        }   
    @staticmethod
    def get_7day_forecast(city: str):

        location = WeatherService.get_coordinates(city)

        response = requests.get(
            FORECAST_URL,
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "daily": [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_sum"
                ],
                "forecast_days": 7,
                "timezone": "auto"
            },
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch forecast."
            )

        daily = response.json()["daily"]

        forecast = []

        for i in range(len(daily["time"])):

            forecast.append({
                "date": daily["time"][i],
                "max_temp": daily["temperature_2m_max"][i],
                "min_temp": daily["temperature_2m_min"][i],
                "rainfall_mm": daily["precipitation_sum"][i],
                "weather_code": daily["weather_code"][i],
                "condition": WEATHER_CODES.get(
                    daily["weather_code"][i],
                    "Unknown"
                )
            })

        return forecast


    @staticmethod
    def get_historical_weather(city: str, days: int = 30):

        location = WeatherService.get_coordinates(city)

        end_date = date.today() - timedelta(days=1)
        start_date = end_date - timedelta(days=days)

        response = requests.get(
            ARCHIVE_URL,
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "daily": [
                    "temperature_2m_mean",
                    "precipitation_sum",
                    "wind_speed_10m_max"
                ],
                "timezone": "auto"
            },
            timeout=15
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch historical weather."
            )

        daily = response.json()["daily"]

        history = []

        for i in range(len(daily["time"])):

            history.append({
                "date": daily["time"][i],
                "temperature": daily["temperature_2m_mean"][i],
                "rainfall": daily["precipitation_sum"][i],
                "wind_speed": daily["wind_speed_10m_max"][i]
            })

        return history    
    @staticmethod
    def get_hourly_forecast(city: str):

        location = WeatherService.get_coordinates(city)

        response = requests.get(
            FORECAST_URL,
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "hourly": [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "precipitation_probability",
                    "wind_speed_10m",
                    "weather_code"
                ],
                "forecast_days": 1,
                "timezone": "auto"
            },
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch hourly forecast."
            )

        hourly = response.json()["hourly"]

        forecast = []

        for i in range(len(hourly["time"])):

            forecast.append({
                "time": hourly["time"][i],
                "temperature": hourly["temperature_2m"][i],
                "humidity": hourly["relative_humidity_2m"][i],
                "rain_probability": hourly["precipitation_probability"][i],
                "wind_speed": hourly["wind_speed_10m"][i],
                "weather_code": hourly["weather_code"][i],
                "condition": WEATHER_CODES.get(
                    hourly["weather_code"][i],
                    "Unknown"
                )
            })

        return forecast


    @staticmethod
    def generate_alerts(weather):

        alerts = []

        # Temperature Alerts
        if weather["temperature_c"] >= 40:
            alerts.append({
                "type": "Heatwave",
                "severity": "High",
                "message": "Extreme heatwave conditions expected."
            })
        elif weather["temperature_c"] >= 35:
            alerts.append({
                "type": "High Temperature",
                "severity": "Medium",
                "message": "High temperature may affect crop growth."
            })

        # Rainfall Alerts
        if weather["rainfall_mm"] >= 50:
            alerts.append({
                "type": "Heavy Rain",
                "severity": "High",
                "message": "Heavy rainfall may cause waterlogging."
            })

        # Wind Alerts
        if weather["wind_speed_kmh"] >= 40:
            alerts.append({
                "type": "Strong Wind",
                "severity": "High",
                "message": "Strong winds may damage crops."
            })

        # Humidity Alerts
        if weather["humidity_percent"] >= 90:
            alerts.append({
                "type": "High Humidity",
                "severity": "Medium",
                "message": "High chance of fungal diseases."
            })

        if not alerts:
            alerts.append({
                "type": "Normal",
                "severity": "Low",
                "message": "No severe weather alerts."
            })

        return alerts    
    @staticmethod
    def calculate_risk(weather):

        score = 0
        reasons = []

        # Temperature
        if weather["temperature_c"] >= 40:
            score += 35
            reasons.append("Extreme temperature")
        elif weather["temperature_c"] >= 35:
            score += 20
            reasons.append("High temperature")

        # Rainfall
        if weather["rainfall_mm"] >= 50:
            score += 30
            reasons.append("Heavy rainfall")
        elif weather["rainfall_mm"] >= 20:
            score += 15
            reasons.append("Moderate rainfall")

        # Humidity
        if weather["humidity_percent"] >= 90:
            score += 20
            reasons.append("Very high humidity")

        # Wind
        if weather["wind_speed_kmh"] >= 40:
            score += 25
            reasons.append("Strong wind")
        elif weather["wind_speed_kmh"] >= 25:
            score += 10
            reasons.append("Moderate wind")

        score = min(score, 100)

        if score <= 20:
            level = "Low"
            color = "green"
        elif score <= 50:
            level = "Moderate"
            color = "yellow"
        elif score <= 75:
            level = "High"
            color = "orange"
        else:
            level = "Extreme"
            color = "red"

        return {
            "risk_score": score,
            "risk_level": level,
            "risk_color": color,
            "reasons": reasons
        }


    @staticmethod
    def agricultural_advisory(weather):

        recommendations = []

        # Temperature
        if weather["temperature_c"] > 35:
            recommendations.append({
                "category": "Irrigation",
                "advice": "Increase irrigation frequency to reduce heat stress."
            })

        # Rainfall
        if weather["rainfall_mm"] > 20:
            recommendations.append({
                "category": "Water Management",
                "advice": "Avoid irrigation today because sufficient rainfall is expected."
            })

        # Humidity
        if weather["humidity_percent"] > 90:
            recommendations.append({
                "category": "Disease Prevention",
                "advice": "Monitor crops for fungal diseases due to high humidity."
            })

        # Wind
        if weather["wind_speed_kmh"] > 25:
            recommendations.append({
                "category": "Spraying",
                "advice": "Avoid pesticide spraying because of strong winds."
            })

        if weather["temperature_c"] < 15:
            recommendations.append({
                "category": "Cold Protection",
                "advice": "Protect young crops from cold conditions."
            })

        if len(recommendations) == 0:
            recommendations.append({
                "category": "General",
                "advice": "Current weather conditions are favorable for normal farming activities."
            })

        return recommendations