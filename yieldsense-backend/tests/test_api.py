from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_homepage():
    response = client.get("/")

    assert response.status_code == 200
    assert "message" in response.json()


def test_soil_endpoint():
    response = client.get("/soil")

    assert response.status_code == 200
    assert "soil_health" in response.json()


def test_farm_endpoint():
    response = client.get("/farm")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_dashboard_summary():
    response = client.get("/dashboard/summary?farm_id=1")

    assert response.status_code in [200, 404]


def test_recommendations():
    payload = {
        "crop_type": "Rice",
        "avg_temp": 28,
        "rainfall": 700,
        "soil_ph": 6.8,
        "nitrogen": 70,
        "phosphorus": 60,
        "potassium": 60,
        "predicted_yield": 1000,
        "avg_yield": 1000,
        "rainfall_deviation": 0
    }

    response = client.post(
        "/api/v1/analytics/recommendations",
        json=payload
    )

    assert response.status_code == 200
    assert "overall_risk_level" in response.json()