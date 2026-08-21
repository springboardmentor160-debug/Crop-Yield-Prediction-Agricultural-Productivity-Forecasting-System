"""
YieldSense AI  -  Weather Service

Integrates with Open-Meteo (free, no API key) for weather data.
Includes in-memory TTL caching to minimize API calls.
"""

import time
from typing import Dict, Optional, Tuple

import httpx

# ============================================================
# In-Memory Cache
# ============================================================
_weather_cache: Dict[str, Tuple[float, dict]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


def _get_cache_key(lat: float, lon: float, kind: str) -> str:
    """Generate a cache key from coordinates (rounded to 2 decimal places)."""
    return f"{kind}:{round(lat, 2)}:{round(lon, 2)}"


def _get_cached(key: str) -> Optional[dict]:
    """Get a cached result if it exists and hasn't expired."""
    if key in _weather_cache:
        timestamp, data = _weather_cache[key]
        if time.time() - timestamp < CACHE_TTL_SECONDS:
            return data
        del _weather_cache[key]
    return None


def _set_cached(key: str, data: dict) -> None:
    """Store a result in the cache."""
    _weather_cache[key] = (time.time(), data)


# ============================================================
# WMO Weather Code Descriptions
# ============================================================
WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle (light)",
    57: "Freezing drizzle (dense)",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain (light)",
    67: "Freezing rain (heavy)",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def _code_to_description(code: int) -> str:
    """Convert WMO weather code to human-readable description."""
    return WMO_CODES.get(code, "Unknown")


# ============================================================
# Public API
# ============================================================

async def get_current_weather(lat: float, lon: float) -> dict:
    """
    Fetch current weather conditions from Open-Meteo.

    Args:
        lat: Latitude (-90 to 90)
        lon: Longitude (-180 to 180)

    Returns:
        Dictionary with temperature, humidity, rainfall, wind_speed, description.
    """
    cache_key = _get_cache_key(lat, lon, "current")
    cached = _get_cached(cache_key)
    if cached:
        return cached

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,cloud_cover",
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        current = data.get("current", {})
        result = {
            "temperature": current.get("temperature_2m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "rainfall": current.get("precipitation", 0),
            "wind_speed": current.get("wind_speed_10m", 0),
            "description": _code_to_description(current.get("weather_code", 0)),
            "cloud_cover": current.get("cloud_cover"),
        }

        _set_cached(cache_key, result)
        return result

    except Exception as e:
        # Return safe fallback on failure
        return {
            "temperature": 25.0,
            "humidity": 60.0,
            "rainfall": 0.0,
            "wind_speed": 10.0,
            "description": f"Weather data unavailable ({str(e)[:50]})",
            "cloud_cover": None,
        }


async def get_weather_forecast(lat: float, lon: float, days: int = 7) -> dict:
    """
    Fetch weather forecast from Open-Meteo.

    Args:
        lat: Latitude
        lon: Longitude
        days: Number of forecast days (1-16)

    Returns:
        Dictionary with current weather and daily forecast array.
    """
    cache_key = _get_cache_key(lat, lon, f"forecast_{days}")
    cached = _get_cached(cache_key)
    if cached:
        return cached

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,cloud_cover",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        "timezone": "auto",
        "forecast_days": min(days, 16),
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        current = data.get("current", {})
        daily = data.get("daily", {})

        forecast_days = []
        dates = daily.get("time", [])
        for i, date in enumerate(dates):
            forecast_days.append({
                "date": date,
                "temp_max": daily.get("temperature_2m_max", [0])[i] if i < len(daily.get("temperature_2m_max", [])) else 0,
                "temp_min": daily.get("temperature_2m_min", [0])[i] if i < len(daily.get("temperature_2m_min", [])) else 0,
                "rainfall": daily.get("precipitation_sum", [0])[i] if i < len(daily.get("precipitation_sum", [])) else 0,
                "description": _code_to_description(
                    daily.get("weather_code", [0])[i] if i < len(daily.get("weather_code", [])) else 0
                ),
            })

        result = {
            "latitude": lat,
            "longitude": lon,
            "current": {
                "temperature": current.get("temperature_2m", 0),
                "humidity": current.get("relative_humidity_2m", 0),
                "rainfall": current.get("precipitation", 0),
                "wind_speed": current.get("wind_speed_10m", 0),
                "description": _code_to_description(current.get("weather_code", 0)),
                "cloud_cover": current.get("cloud_cover"),
            },
            "forecast": forecast_days,
            "source": "Open-Meteo",
        }

        _set_cached(cache_key, result)
        return result

    except Exception as e:
        return {
            "latitude": lat,
            "longitude": lon,
            "current": {
                "temperature": 25.0,
                "humidity": 60.0,
                "rainfall": 0.0,
                "wind_speed": 10.0,
                "description": f"Weather data unavailable ({str(e)[:50]})",
                "cloud_cover": None,
            },
            "forecast": [],
            "source": "Open-Meteo (fallback)",
        }
