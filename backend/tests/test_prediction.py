"""
Tests for crop yield prediction pipeline & boundary overrides.
"""

def test_predict_yield_valid_input(client):
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
        "pesticide_usage": 12.5,
    }
    response = client.post("/api/v1/prediction/predict-yield", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_yield" in data
    assert data["predicted_yield"] > 0
    assert data["crop"] == "Rice"
    assert "soil_summary" in data

def test_predict_yield_unviable_boundary_override(client):
    """Zero rainfall & freezing temp triggers rule override."""
    payload = {
        "crop": "Rice",
        "season": "Kharif",
        "state": "Uttar Pradesh",
        "area": 10.0,
        "temperature": -5.0,
        "annual_rainfall": 0.0,
        "humidity": 10.0,
        "soil_ph": 3.0,
        "nitrogen": 0.0,
        "phosphorus": 0.0,
        "potassium": 0.0,
        "fertilizer_usage": 0.0,
        "pesticide_usage": 0.0,
    }
    response = client.post("/api/v1/prediction/predict-yield", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_yield"] == 0.0
    assert "Rule Override" in data["model_used"]

def test_recommend_crop_endpoint(client):
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 45.0,
        "potassium": 35.0,
        "temperature": 24.5,
        "humidity": 82.0,
        "soil_ph": 6.8,
        "annual_rainfall": 1000.0,
    }
    response = client.post("/api/v1/prediction/recommend-crop", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommended_crop" in data
    assert len(data["top_recommendations"]) > 0
