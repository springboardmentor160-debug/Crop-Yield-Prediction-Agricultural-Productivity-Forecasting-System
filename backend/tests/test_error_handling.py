"""
Tests for API validation errors, unauthorized access, and safety checks.
"""

def test_unauthenticated_protected_endpoint(client):
    response = client.get("/api/v1/users/profile")
    assert response.status_code == 403 or response.status_code == 401

def test_invalid_payload_validation(client):
    payload = {
        "crop": "Rice",
        "temperature": "INVALID_NUMBER",
    }
    response = client.post("/api/v1/prediction/predict-yield", json=payload)
    assert response.status_code == 422  # Unprocessable Entity

def test_nonexistent_endpoint_returns_404(client):
    response = client.get("/api/v1/nonexistent-endpoint")
    assert response.status_code == 404
