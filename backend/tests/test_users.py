import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_users.db"

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
def auth_headers(client):
    """Create a test user and return auth headers"""
    user_data = {
        "email": "testuser@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "role": "Farmer"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_profile_success(client, auth_headers):
    """Test getting user profile with valid token"""
    response = client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"
    assert data["role"] == "Farmer"

def test_get_profile_unauthorized(client):
    """Test getting user profile without token"""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401

def test_update_profile_success(client, auth_headers):
    """Test updating user profile"""
    update_data = {
        "full_name": "Updated Name"
    }
    response = client.put("/api/v1/users/me", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["email"] == "testuser@example.com"  # unchanged

def test_update_profile_unauthorized(client):
    """Test updating user profile without token"""
    update_data = {
        "full_name": "Updated Name"
    }
    response = client.put("/api/v1/users/me", json=update_data)
    assert response.status_code == 401