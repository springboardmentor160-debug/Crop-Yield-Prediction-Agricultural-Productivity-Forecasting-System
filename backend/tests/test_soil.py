"""
Tests for soil health analysis API.
"""

def test_soil_analysis_endpoint(client):
    payload = {
        "soil_ph": 6.8,
        "nitrogen": 90.0,
        "phosphorus": 45.0,
        "potassium": 35.0,
        "crop": "Wheat",
    }
    response = client.post("/api/v1/soil/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "health_score" in data
    assert data["health_score"] > 0
    assert "health_label" in data
