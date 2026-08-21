from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_homepage():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_predict_endpoint_success():
    payload = {"temp": 28.5, "rainfall": 800.0, "ph": 6.5}
    response = client.post("/api/v1/predict-yield", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_yield" in data
    assert "weather_status" in data
    assert "soil_suitability" in data

def test_predict_endpoint_invalid_payload():
    payload = {"temp": "hot", "rainfall": 800.0} # Missing ph, wrong type
    response = client.post("/api/v1/predict-yield", json=payload)
    assert response.status_code == 422 # Unprocessable Entity

def test_get_recommendations_farm_1():
    response = client.get("/api/v1/analytics/recommendations?farm_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "risk_level" in data
    assert data["risk_level"] == "Low"

def test_get_recommendations_farm_2_high_risk():
    response = client.get("/api/v1/analytics/recommendations?farm_id=2")
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "risk_level" in data
    assert data["risk_level"] == "High"
    # Acidic soil recommendation check
    assert any("acidic" in tip.lower() for tip in data["recommendations"])

def test_get_recommendations_farm_3_medium_risk():
    response = client.get("/api/v1/analytics/recommendations?farm_id=3")
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "risk_level" in data
    assert data["risk_level"] == "Medium"
    # Alkaline soil recommendation check
    assert any("alkaline" in tip.lower() for tip in data["recommendations"])

def test_post_npk_recommendations():
    payload = {"n": 25.0, "p": 15.0, "k": 30.0, "ph": 6.2}
    response = client.post("/api/v1/analytics/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
