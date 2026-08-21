import pytest
from fastapi.testclient import TestClient
from main import app
from database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    yield

def test_register_and_login():
    # Register
    res = client.post("/api/v1/auth/register", json={
        "email": "test_farmer@example.com",
        "password": "password123",
        "role": "Farmer"
    })
    assert res.status_code in [201, 409] # 409 if already exists
    
    # Duplicate registration
    res = client.post("/api/v1/auth/register", json={
        "email": "test_farmer@example.com",
        "password": "password123",
        "role": "Farmer"
    })
    assert res.status_code == 409
    
    # Login
    res = client.post("/api/v1/auth/login", json={
        "email": "test_farmer@example.com",
        "password": "password123"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert token is not None
    return token

def test_invalid_login():
    res = client.post("/api/v1/auth/login", json={
        "email": "test_farmer@example.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401

def test_create_farm():
    token = test_register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/farms", json={
        "farm_name": "Test Farm",
        "latitude": 34.05,
        "longitude": -118.24,
        "soil_ph": 6.5,
        "soil_n": 10.0,
        "soil_p": 15.0,
        "soil_k": 20.0
    }, headers=headers)
    assert res.status_code == 201
    return token, res.json()["id"]

def test_authorization_boundary():
    # User A creates farm
    token_a, farm_id = test_create_farm()
    
    # User B registers
    res = client.post("/api/v1/auth/register", json={
        "email": "user_b@example.com",
        "password": "password123",
        "role": "Farmer"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": "user_b@example.com",
        "password": "password123"
    })
    token_b = res.json()["access_token"]
    
    # User B tries to analyze User A's farm
    headers_b = {"Authorization": f"Bearer {token_b}"}
    res = client.post(f"/api/v1/analysis/{farm_id}/analyze?crop=Rice", headers=headers_b)
    assert res.status_code == 403

def test_create_crop():
    token, farm_id = test_create_farm()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/crops", json={
        "farm_id": farm_id,
        "crop_name": "Rice",
        "hectares_planted": 5.5
    }, headers=headers)
    assert res.status_code == 201

def test_analysis_endpoint():
    token, farm_id = test_create_farm()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post(f"/api/v1/analysis/{farm_id}/analyze?crop=Rice", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "predicted_yield" in data
    assert "recommendation" in data
    assert "weather" in data

def test_history_endpoint():
    token, farm_id = test_create_farm()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Run analysis to populate history
    client.post(f"/api/v1/analysis/{farm_id}/analyze?crop=Rice", headers=headers)
    
    res = client.get(f"/api/v1/analysis/{farm_id}/history", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["predictions"]) > 0
    assert len(data["recommendations"]) > 0
    assert len(data["weather"]) > 0
