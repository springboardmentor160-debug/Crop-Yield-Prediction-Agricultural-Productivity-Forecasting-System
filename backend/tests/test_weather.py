"""
Tests for live weather APIs.
"""

def test_current_weather_endpoint(client):
    response = client.get("/api/v1/weather/", params={"lat": 28.6139, "lon": 77.2090})
    assert response.status_code == 200
    data = response.json()
    assert "temperature" in data
    assert "humidity" in data

def test_weather_forecast_endpoint(client):
    response = client.get("/api/v1/weather/forecast", params={"lat": 28.6139, "lon": 77.2090, "days": 5})
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data
    assert len(data["forecast"]) > 0
