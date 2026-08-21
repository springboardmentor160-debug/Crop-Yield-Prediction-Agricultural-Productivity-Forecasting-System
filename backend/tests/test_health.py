"""
Tests for root and health check endpoints.
"""

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_model_info_endpoint(client):
    response = client.get("/api/v1/prediction/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert "model_name" in data
    assert "feature_names" in data
