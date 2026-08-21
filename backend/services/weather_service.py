import requests
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

def get_current_weather(latitude: float, longitude: float) -> dict:
    """
    Fetches current weather (temperature, relative humidity, precipitation) from Open-Meteo.
    Open-Meteo requires no API key.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        current = data.get("current", {})
        
        return {
            "temperature": current.get("temperature_2m", 25.0),
            "humidity": current.get("relative_humidity_2m", 60.0),
            "rainfall": current.get("precipitation", 0.0)
        }
    except Exception as e:
        print(f"Weather API failed: {e}")
        # Graceful fallback
        return {
            "temperature": 25.0,
            "humidity": 60.0,
            "rainfall": 10.0
        }

def get_country_from_coordinates(latitude: float, longitude: float) -> str:
    """
    Uses Geopy to reverse geocode coordinates into a Country name (Area).
    """
    try:
        geolocator = Nominatim(user_agent="yieldsense_app")
        location = geolocator.reverse(f"{latitude}, {longitude}", timeout=5)
        if location and "address" in location.raw:
            return location.raw["address"].get("country", "Unknown")
        return "Unknown"
    except (GeocoderTimedOut, GeocoderServiceError, Exception) as e:
        print(f"Geocoding failed: {e}")
        return "Unknown"
