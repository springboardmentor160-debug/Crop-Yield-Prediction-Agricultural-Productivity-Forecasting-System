import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_auth.db"

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

def test_register_success(client):
    """Test successful user registration"""
    user_data = {
        "email": "newuser@example.com",
        "password": "securepassword123",
        "full_name": "New User",
        "role": "Farmer"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "New User"
    assert data["user"]["role"] == "Farmer"

def test_register_duplicate_email(client):
    """Test registration with duplicate email"""
    user_data = {
        "email": "duplicate@example.com",
        "password": "password123",
        "full_name": "First User",
        "role": "Farmer"
    }
    # First registration
    response1 = client.post("/api/v1/auth/register", json=user_data)
    assert response1.status_code == 200
    
    # Second registration with same email
    response2 = client.post("/api/v1/auth/register", json=user_data)
    assert response2.status_code == 400
    assert "Email already registered" in response2.json()["detail"]

def test_login_success(client):
    """Test successful login"""
    # Register a user first
    user_data = {
        "email": "loginuser@example.com",
        "password": "loginpassword123",
        "full_name": "Login User",
        "role": "Farmer"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Login
    login_data = {
        "email": "loginuser@example.com",
        "password": "loginpassword123"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == "loginuser@example.com"

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_login_wrong_password(client):
    """Test login with wrong password"""
    # Register a user
    user_data = {
        "email": "wrongpass@example.com",
        "password": "correctpassword123",
        "full_name": "Wrong Pass User",
        "role": "Farmer"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Try login with wrong password
    login_data = {
        "email": "wrongpass@example.com",
        "password": "incorrectpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]