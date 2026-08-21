import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_analyst.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        yield client
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

@pytest.fixture
def farmer_auth_headers(client):
    """Create a test farmer user and return auth headers"""
    user_data = {
        "email": "farmer@example.com",
        "password": "farmerpass123",
        "full_name": "Farmer User",
        "role": "Farmer"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def analyst_auth_headers(client):
    """Create a test analyst user and return auth headers"""
    user_data = {
        "email": "analyst@example.com",
        "password": "analystpass123",
        "full_name": "Analyst User",
        "role": "Analyst"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_auth_headers(client):
    """Create a test admin user and return auth headers"""
    user_data = {
        "email": "admin@example.com",
        "password": "adminpass123",
        "full_name": "Admin User",
        "role": "Admin"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_analyst_dashboard_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access analyst dashboard"""
    response = client.get("/api/v1/analyst/dashboard", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    # Check that expected fields are present
    assert "total_users" in data
    assert "total_farms" in data
    assert "total_predictions" in data
    assert "average_yield" in data

def test_analyst_dashboard_access_admin(client, admin_auth_headers):
    """Test that admin can access analyst dashboard"""
    response = client.get("/api/v1/analyst/dashboard", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data

def test_analyst_dashboard_forbidden_farmer(client, farmer_auth_headers):
    """Test that farmer cannot access analyst dashboard"""
    response = client.get("/api/v1/analyst/dashboard", headers=farmer_auth_headers)
    assert response.status_code == 403
    assert "Analyst or Admin access required" in response.json()["detail"]

def test_analyst_dashboard_unauthorized(client):
    """Test that unauthenticated user cannot access analyst dashboard"""
    response = client.get("/api/v1/analyst/dashboard")
    assert response.status_code == 401

def test_analyst_yield_trends_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access yield trends"""
    response = client.get("/api/v1/analyst/yield-trends", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "yield_trend" in data
    assert "total_predictions" in data

def test_analyst_crop_performance_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access crop performance"""
    response = client.get("/api/v1/analyst/crop-performance", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "crop_performance" in data
    assert "total_crops" in data

def test_analyst_farm_comparison_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access farm comparison"""
    response = client.get("/api/v1/analyst/farm-comparison", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "farm_comparison" in data
    assert "total_farms" in data

def test_analyst_weather_impact_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access weather impact"""
    response = client.get("/api/v1/analyst/weather-impact", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "average_temperature" in data
    assert "average_rainfall" in data

def test_analyst_soil_analysis_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access soil analysis"""
    response = client.get("/api/v1/analyst/soil-analysis", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_analyses" in data
    assert "average_ph" in data

def test_analyst_productivity_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access productivity"""
    response = client.get("/api/v1/analyst/productivity", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_area_hectares" in data
    assert "average_yield_tons_per_ha" in data

def test_analyst_risk_distribution_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access risk distribution"""
    response = client.get("/api/v1/analyst/risk-distribution", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    # This endpoint might return different structure, just check it doesn't error
    assert isinstance(data, dict)

def test_analyst_recent_predictions_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access recent predictions"""
    response = client.get("/api/v1/analyst/recent-predictions", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)  # Should return a list of predictions

def test_analyst_reports_access_analyst(client, analyst_auth_headers):
    """Test that analyst can access reports"""
    response = client.get("/api/v1/analyst/reports", headers=analyst_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)

# Test forbidden access for farmers on all analyst endpoints
def test_analyst_endpoints_forbidden_for_farmer(client, farmer_auth_headers):
    """Test that farmer cannot access any analyst endpoints"""
    endpoints = [
        "/api/v1/analyst/dashboard",
        "/api/v1/analyst/yield-trends",
        "/api/v1/analyst/crop-performance",
        "/api/v1/analyst/weather-impact",
        "/api/v1/analyst/soil-analysis",
        "/api/v1/analyst/farm-comparison",
        "/api/v1/analyst/productivity",
        "/api/v1/analyst/risk-distribution",
        "/api/v1/analyst/recent-predictions",
        "/api/v1/analyst/reports"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint, headers=farmer_auth_headers)
        assert response.status_code == 403, f"Farmer should not access {endpoint}"
        assert "Analyst or Admin access required" in response.json()["detail"]

# Test unauthorized access for all analyst endpoints
def test_analyst_endpoints_unauthorized(client):
    """Test that unauthenticated users cannot access any analyst endpoints"""
    endpoints = [
        "/api/v1/analyst/dashboard",
        "/api/v1/analyst/yield-trends",
        "/api/v1/analyst/crop-performance",
        "/api/v1/analyst/weather-impact",
        "/api/v1/analyst/soil-analysis",
        "/api/v1/analyst/farm-comparison",
        "/api/v1/analyst/productivity",
        "/api/v1/analyst/risk-distribution",
        "/api/v1/analyst/recent-predictions",
        "/api/v1/analyst/reports"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == 401, f"Unauthenticated user should not access {endpoint}"