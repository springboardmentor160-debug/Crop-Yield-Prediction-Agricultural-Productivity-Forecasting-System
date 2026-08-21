"""
Tests for Risk Assessment endpoints & Week 6 risk scoring logic.
"""

from app.services.farm_advisory_service import assess_farm_risk

def test_post_risk_assess_endpoint(client):
    payload = {
        "crop": "Rice",
        "temperature": 38.0,  # Heat stress
        "annual_rainfall": 400.0, # Drought
        "humidity": 40.0,
        "soil_ph": 4.5,       # Acidic
        "nitrogen": 20.0,
        "phosphorus": 10.0,
        "potassium": 10.0,
        "predicted_yield": 1.2,
        "season": "Kharif",
    }
    response = client.post("/api/v1/risk/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk_level" in data
    assert data["overall_risk_level"] in ["Low", "Medium", "High", "Critical"]
    assert len(data["risks"]) > 0

def test_farm_risk_scoring_logic():
    # Normal farm -> score 0 -> Low
    r = assess_farm_risk(predicted_yield=3.0, avg_yield=3.0, rainfall_deviation=0.0, soil_ph=6.5)
    assert r["risk_score"] == 0
    assert r["risk_level"] == "Low"

    # Extreme scenario -> score >= 4 -> High
    r_high = assess_farm_risk(predicted_yield=2.0, avg_yield=5.0, rainfall_deviation=-40.0, soil_ph=4.5)
    assert r_high["risk_score"] >= 4
    assert r_high["risk_level"] == "High"
