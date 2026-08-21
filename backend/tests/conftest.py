"""
YieldSense AI — Pytest Configuration & Fixtures
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Put backend root on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app

@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as c:
        yield c

@pytest.fixture
def mock_user_token():
    """Mock Bearer token string."""
    return "Bearer mock-firebase-test-token"
