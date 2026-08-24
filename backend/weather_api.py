import os
import requests
from pathlib import Path

# 1. Locate the .env file in the exact same directory
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE_PATH = BASE_DIR / ".env"

# 2. Read the key directly from the file (bypassing python-dotenv)
WEATHER_API_KEY = None

if ENV_FILE_PATH.exists():
    try:
        # Try reading with utf-8 first, fallback if Windows used utf-16
        content = ""
        try:
            with open(ENV_FILE_PATH, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(ENV_FILE_PATH, "r", encoding="utf-16") as f:
                content = f.read()

        # Parse out the key manually
        for line in content.splitlines():
            line = line.strip()
            if line.startswith("WEATHER_API_KEY="):
                # Clean off quotes or extra whitespace
                WEATHER_API_KEY = line.split("=", 1)[1].strip(' "\' \t')

    except Exception as e:
        print(f"Read Error: {e}")

BASE_URL = "http://api.openweathermap.org/data/2.5/weather"


def get_live_weather(city_name: str):
    if not WEATHER_API_KEY:
        return {
            "success": False,
            "error": "API Key not found inside file!"
        }

    params = {
        "q": city_name,
        "appid": WEATHER_API_KEY,
        "units": "metric"
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        weather = data["weather"][0]["main"]
        wind_speed = data["wind"]["speed"]
        rainfall = data.get("rain", {}).get("1h", 0.0)

        return {
            "success": True,
            "city": city_name,
            "avg_temp": temp,
            "current_rainfall_mm": rainfall,
            "humidity": humidity,
            "weather": weather,
            "wind_speed": wind_speed
        }


    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


# --- Run Debug Test ---
if __name__ == "__main__":
    print("\n================ DEBUG REPORT ================")
    print(f"1. Looking at Path : {ENV_FILE_PATH}")
    print(f"2. File Exists?    : {ENV_FILE_PATH.exists()}")
    if WEATHER_API_KEY:
        # Mask key for privacy
        masked = WEATHER_API_KEY[:4] + "..." + WEATHER_API_KEY[-4:] if len(WEATHER_API_KEY) > 8 else "***"
        print(f"3. Key Found!      : {masked}")
    else:
        print("3. Key Found!      : NO (File is empty or key name is misspelled)")
    print("==============================================\n")

    test_data = get_live_weather("Delhi")
    print("API Result:", test_data)