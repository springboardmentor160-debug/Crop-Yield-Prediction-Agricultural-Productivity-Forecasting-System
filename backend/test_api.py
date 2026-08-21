"""
YieldSense AI — API Test Suite

Tests the Prediction, Weather, and Soil endpoints of the FastAPI backend.
"""

import asyncio
import httpx


async def test_health():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000/api/v1") as client:
        # Test health check
        r = await client.get("/health")
        print("Health Check Response:", r.status_code, r.json())
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"

        # Test model-info
        r = await client.get("/prediction/model-info")
        print("\nModel Info Response:", r.status_code, r.json())
        assert r.status_code == 200
        assert r.json()["status"] == "ready"

        # Test predict-yield
        payload = {
            "crop": "Rice",
            "season": "Kharif",
            "state": "Uttar Pradesh",
            "area": 10.0,
            "temperature": 28.5,
            "annual_rainfall": 1200.0,
            "humidity": 70.0,
            "soil_ph": 6.5,
            "nitrogen": 80.0,
            "phosphorus": 40.0,
            "potassium": 38.0,
            "fertilizer_usage": 180.0,
            "pesticide_usage": 12.5
        }
        r = await client.post("/prediction/predict-yield", json=payload)
        print("\nPredict Yield Response:", r.status_code, r.json())
        assert r.status_code == 200
        data = r.json()
        assert "predicted_yield" in data
        assert "weather_summary" in data or data["weather_summary"] is None
        assert data["soil_summary"]["health_label"] in ["Poor", "Fair", "Good", "Excellent"]

        # Test predict-yield with location coordinates
        payload_loc = {**payload, "latitude": 28.6139, "longitude": 77.2090}
        r = await client.post("/prediction/predict-yield", json=payload_loc)
        print("\nPredict Yield (with Lat/Lon) Response:", r.status_code, r.json())
        assert r.status_code == 200
        data = r.json()
        assert data["weather_summary"] is not None
        assert "temperature" in data["weather_summary"]

        # Test predict-yield with extreme unviable conditions (drastic inputs)
        payload_unviable = {
            "crop": "Rice",
            "season": "Kharif",
            "state": "Uttar Pradesh",
            "area": 10.0,
            "temperature": 0.0,
            "annual_rainfall": 0.0,
            "humidity": 1.0,
            "soil_ph": 0.0,
            "nitrogen": 0.0,
            "phosphorus": 0.0,
            "potassium": 0.0,
            "fertilizer_usage": 0.0,
            "pesticide_usage": 0.0
        }
        r = await client.post("/prediction/predict-yield", json=payload_unviable)
        print("\nPredict Yield (Unviable / Drastic Inputs) Response:", r.status_code, r.json())
        assert r.status_code == 200
        data = r.json()
        assert data["predicted_yield"] == 0.0
        assert "Rule Override" in data["model_used"]

        # Test weather current
        r = await client.get("/weather/", params={"lat": 28.6139, "lon": 77.2090})
        print("\nWeather Current Response:", r.status_code, r.json())
        assert r.status_code == 200
        assert "temperature" in r.json()

        # Test weather forecast
        r = await client.get("/weather/forecast", params={"lat": 28.6139, "lon": 77.2090, "days": 5})
        print("\nWeather Forecast Response:", r.status_code, r.json())
        assert r.status_code == 200
        assert len(r.json()["forecast"]) > 0

        # Test soil analyze
        soil_payload = {
            "soil_ph": 6.8,
            "nitrogen": 90.0,
            "phosphorus": 45.0,
            "potassium": 35.0,
            "crop": "Wheat"
        }
        r = await client.post("/soil/analyze", json=soil_payload)
        print("\nSoil Analyze Response:", r.status_code, r.json())
        assert r.status_code == 200
        assert r.json()["health_score"] > 0

        # Test recommend-crop
        recommend_payload = {
            "nitrogen": 90.0,
            "phosphorus": 45.0,
            "potassium": 35.0,
            "temperature": 24.5,
            "humidity": 82.0,
            "soil_ph": 6.8,
            "annual_rainfall": 1000.0
        }
        r = await client.post("/prediction/recommend-crop", json=recommend_payload)
        print("\nRecommend Crop Response:", r.status_code, r.json())
        assert r.status_code == 200
        assert "recommended_crop" in r.json()
        assert len(r.json()["top_recommendations"]) > 0



if __name__ == "__main__":
    try:
        asyncio.run(test_health())
        print("\nAll API tests passed successfully!")
    except Exception as e:
        print("\nAPI testing failed:", e)
