# backend/tests/test_api.py
"""
Week 7 deliverable — automated API tests using FastAPI's TestClient.
Run with: pytest backend/tests/

These use an in-memory SQLite DB so tests don't touch your real Postgres
data. Adjust the fixture below if your app.database module needs a
different override pattern.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# ------------------------------------------------------------
# Test DB setup — isolated in-memory SQLite, one per test run
# ------------------------------------------------------------
SQLALCHEMY_TEST_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


# ------------------------------------------------------------
# Health check
# ------------------------------------------------------------
def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# ------------------------------------------------------------
# Auth flow
# ------------------------------------------------------------
def test_register_and_login():
    register_payload = {
        "full_name": "Test Farmer",
        "email": "test.farmer@example.com",
        "password": "TestPass123!",
        "role": "Farmer",
    }
    register_response = client.post("/api/v1/auth/register", json=register_payload)
    assert register_response.status_code in (200, 201)

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Farmer"


def test_login_with_wrong_password_fails():
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Another Farmer",
            "email": "another.farmer@example.com",
            "password": "CorrectPass123!",
            "role": "Farmer",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "another.farmer@example.com", "password": "WrongPassword"},
    )
    assert response.status_code in (400, 401)


# ------------------------------------------------------------
# Prediction endpoint (requires auth)
# ------------------------------------------------------------
@pytest.fixture
def auth_headers():
    email = "predict.user@example.com"
    password = "PredictPass123!"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Predict User", "email": email, "password": password, "role": "Farmer"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_predict_endpoint_returns_yield(auth_headers):
    # First create a farm to predict against
    farm_response = client.post(
        "/api/v1/farms/",
        json={"farm_name": "Test Farm", "location": "Test Location", "area_hectares": 2.5, "soil_type": "Loam"},
        headers=auth_headers,
    )
    assert farm_response.status_code in (200, 201)
    farm_id = farm_response.json()["id"]

    payload = {
        "farm_id": farm_id,
        "crop_type": "wheat",
        "area": 2.5,
        "temperature": 24,
        "rainfall": 650,
        "humidity": 55,
        "nitrogen": 80,
        "phosphorus": 40,
        "potassium": 60,
        "soil_ph": 6.5,
        "season": "Rabi",
    }
    response = client.post("/api/v1/predictions/predict", json=payload, headers=auth_headers)
    assert response.status_code == 200
    assert "predicted_yield" in response.json()


def test_predict_rejects_invalid_ph(auth_headers):
    payload = {
        "farm_id": 1,
        "crop_type": "wheat",
        "area": 2.5,
        "temperature": 24,
        "rainfall": 650,
        "humidity": 55,
        "nitrogen": 80,
        "phosphorus": 40,
        "potassium": 60,
        "soil_ph": 20,  # invalid — max is 14
        "season": "Rabi",
    }
    response = client.post("/api/v1/predictions/predict", json=payload, headers=auth_headers)
    assert response.status_code == 422


# ------------------------------------------------------------
# Role-based access — Farmer should be blocked from Analyst routes
# ------------------------------------------------------------
def test_farmer_blocked_from_analyst_dashboard(auth_headers):
    response = client.get("/api/v1/analyst/dashboard", headers=auth_headers)
    assert response.status_code == 403
