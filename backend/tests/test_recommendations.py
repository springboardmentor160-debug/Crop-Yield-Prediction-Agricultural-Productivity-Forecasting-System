"""
Tests for Recommendation Engine endpoints (manual POST & Week 6 rule engine).
"""

from app.services.farm_advisory_service import generate_farm_recommendations

def test_post_recommendations_endpoint(client):
    payload = {
        "crop": "Rice",
        "temperature": 28.0,
        "annual_rainfall": 1200.0,
        "humidity": 70.0,
        "soil_ph": 6.5,
        "nitrogen": 80.0,
        "phosphorus": 40.0,
        "potassium": 35.0,
        "predicted_yield": 3.5,
        "season": "Kharif",
    }
    response = client.post("/api/v1/recommendations/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fertilizer_recommendations" in data
    assert "best_practices" in data

def test_farm_recommendations_pure_rules():
    # Acidic soil rule
    recs = generate_farm_recommendations(soil_ph=4.5, predicted_yield=None, avg_yield=None, rainfall_deviation=None)
    assert any("acidic" in r.lower() for r in recs)

    # Low yield rule
    recs = generate_farm_recommendations(soil_ph=6.5, predicted_yield=2.0, avg_yield=4.0, rainfall_deviation=0.0)
    assert any("below" in r.lower() for r in recs)

    # Normal fallback
    recs = generate_farm_recommendations(soil_ph=6.5, predicted_yield=3.0, avg_yield=3.0, rainfall_deviation=0.0)
    assert "all indicators look normal" in recs[0].lower()
