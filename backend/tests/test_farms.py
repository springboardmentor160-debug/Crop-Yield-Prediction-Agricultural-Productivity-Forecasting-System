import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_farms.db"

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

def test_create_farm_success(client, farmer_auth_headers):
    """Test successful farm creation by farmer"""
    farm_data = {
        "farm_name": "Test Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "Test Location"
    }
    response = client.post("/api/v1/farms/", json=farm_data, headers=farmer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["farm_name"] == "Test Farm"
    assert data["latitude"] == 40.7128
    assert data["longitude"] == -74.0060
    assert data["soil_ph"] == 6.5
    assert data["area_hectares"] == 10.5
    assert data["soil_type"] == "Loam"
    assert data["location"] == "Test Location"
    assert "id" in data
    assert "created_at" in data

def test_create_farm_unauthorized(client):
    """Test farm creation without authentication"""
    farm_data = {
        "farm_name": "Test Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "Test Location"
    }
    response = client.post("/api/v1/farms/", json=farm_data)
    assert response.status_code == 401

def test_get_my_farms_success(client, farmer_auth_headers):
    """Test getting user's farms"""
    # Create a farm first
    farm_data = {
        "farm_name": "My Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "My Location"
    }
    client.post("/api/v1/farms/", json=farm_data, headers=farmer_auth_headers)
    
    # Get farms
    response = client.get("/api/v1/farms/", headers=farmer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["farm_name"] == "My Farm"

def test_get_my_farms_empty(client, farmer_auth_headers):
    """Test getting farms when user has none"""
    response = client.get("/api/v1/farms/", headers=farmer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

def test_get_specific_farm_success(client, farmer_auth_headers):
    """Test getting a specific farm by ID"""
    # Create a farm
    farm_data = {
        "farm_name": "Specific Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "Specific Location"
    }
    create_response = client.post("/api/v1/farms/", json=farm_data, headers=farmer_auth_headers)
    farm_id = create_response.json()["id"]
    
    # Get the specific farm
    response = client.get(f"/api/v1/farms/{farm_id}", headers=farmer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == farm_id
    assert data["farm_name"] == "Specific Farm"

def test_get_specific_farm_not_found(client, farmer_auth_headers):
    """Test getting a non-existent farm"""
    response = client.get("/api/v1/farms/99999", headers=farmer_auth_headers)
    assert response.status_code == 404
    assert "Farm not found" in response.json()["detail"]

def test_get_specific_farm_unauthorized(client):
    """Test getting a specific farm without authentication"""
    response = client.get("/api/v1/farms/1")
    assert response.status_code == 401

def test_update_farm_success(client, farmer_auth_headers):
    """Test updating a farm"""
    # Create a farm
    farm_data = {
        "farm_name": "Original Farm Name",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "Original Location"
    }
    create_response = client.post("/api/v1/farms/", json=farm_data, headers=farmer_auth_headers)
    farm_id = create_response.json()["id"]
    
    # Update the farm
    update_data = {
        "farm_name": "Updated Farm Name",
        "area_hectares": 15.0,
        "location": "Updated Location"
    }
    response = client.put(f"/api/v1/farms/{farm_id}", json=update_data, headers=farmer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == farm_id
    assert data["farm_name"] == "Updated Farm Name"
    assert data["area_hectares"] == 15.0
    assert data["location"] == "Updated Location"
    # Check unchanged fields
    assert data["latitude"] == 40.7128
    assert data["longitude"] == -74.0060
    assert data["soil_ph"] == 6.5
    assert data["soil_type"] == "Loam"

def test_update_farm_unauthorized(client):
    """Test updating a farm without authentication"""
    update_data = {
        "farm_name": "Updated Name"
    }
    response = client.put("/api/v1/farms/1", json=update_data)
    assert response.status_code == 401

def test_update_farm_forbidden_analyst(client, analyst_auth_headers):
    """Test that analyst cannot update farms (no permission)"""
    # Create a farm as farmer first
    farmer_client = TestClient(app)
    farmer_user_data = {
        "email": "farmer2@example.com",
        "password": "farmerpass123",
        "full_name": "Farmer 2",
        "role": "Farmer"
    }
    farmer_client.post("/api/v1/auth/register", json=farmer_user_data)
    farmer_login = {
        "email": "farmer2@example.com",
        "password": "farmerpass123"
    }
    farmer_login_response = farmer_client.post("/api/v1/auth/login", json=farmer_login)
    farmer_token = farmer_login_response.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    
    farm_data = {
        "farm_name": "Farmer's Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "Farmer's Location"
    }
    create_response = farmer_client.post("/api/v1/farms/", json=farm_data, headers=farmer_headers)
    farm_id = create_response.json()["id"]
    
    # Try to update as analyst (should fail)
    update_data = {
        "farm_name": "Hacked Farm Name"
    }
    response = client.put(f"/api/v1/farms/{farm_id}", json=update_data, headers=analyst_auth_headers)
    assert response.status_code == 403

def test_delete_farm_success(client, farmer_auth_headers):
    """Test deleting a farm"""
    # Create a farm
    farm_data = {
        "farm_name": "Farm to Delete",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "Delete Location"
    }
    create_response = client.post("/api/v1/farms/", json=farm_data, headers=farmer_auth_headers)
    farm_id = create_response.json()["id"]
    
    # Delete the farm
    response = client.delete(f"/api/v1/farms/{farm_id}", headers=farmer_auth_headers)
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Farm deleted successfully" in response.json()["message"]
    
    # Verify farm is deleted
    get_response = client.get(f"/api/v1/farms/{farm_id}", headers=farmer_auth_headers)
    assert get_response.status_code == 404

def test_delete_farm_unauthorized(client):
    """Test deleting a farm without authentication"""
    response = client.delete("/api/v1/farms/1")
    assert response.status_code == 401

def test_admin_can_access_any_farm(client, admin_auth_headers, farmer_auth_headers):
    """Test that admin can access any farm"""
    # Create a farm as farmer
    farm_data = {
        "farm_name": "Admin Access Test Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "soil_ph": 6.5,
        "area_hectares": 10.5,
        "soil_type": "Loam",
        "location": "Admin Test Location"
    }
    create_response = client.post("/api/v1/farms/", json=farm_data, headers=farmer_auth_headers)
    farm_id = create_response.json()["id"]
    
    # Admin should be able to access this farm
    response = client.get(f"/api/v1/farms/{farm_id}", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == farm_id
    assert data["farm_name"] == "Admin Access Test Farm"