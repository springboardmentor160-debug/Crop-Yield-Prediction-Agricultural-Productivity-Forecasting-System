"""Run an isolated API/database smoke test without starting a web server.

Usage (PowerShell):
  $env:JWT_SECRET_KEY = "a-local-test-secret"
  python test_integration.py
"""

import os
import tempfile
from io import BytesIO
from pathlib import Path

# The test database must be selected before importing the application modules.
test_dir = tempfile.TemporaryDirectory()
os.environ.setdefault("JWT_SECRET_KEY", "local-integration-test-secret")
os.environ["DATABASE_URL"] = f"sqlite:///{Path(test_dir.name, 'verification.db').as_posix()}"

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402


def run() -> None:
    with TestClient(app) as client:
        registration = client.post(
            "/api/v1/register",
            json={"email": "integration-check@example.com", "password": "password123"},
        )
        assert registration.status_code == 200, registration.text
        headers = {"Authorization": f"Bearer {registration.json()['access_token']}"}

        health = client.get("/api/v1/health")
        assert health.status_code == 200, health.text
        assert health.json()["database_status"] == "ready"

        farm = client.post(
            "/api/v1/farms",
            headers=headers,
            json={
                "farm_name": "Verification Farm",
                "latitude": 12.97,
                "longitude": 77.59,
                "farm_size": 2.5,
                "soil_type": "Loamy",
                "irrigation_type": "Drip",
                "crops_grown": "Rice",
            },
        )
        assert farm.status_code == 200, farm.text
        farm_id = farm.json()["id"]

        soil = client.post(
            "/api/v1/soils",
            headers=headers,
            json={"farm_id": farm_id, "ph_value": 6.5, "nitrogen": 70, "phosphorus": 30, "potassium": 40, "organic_matter": 2.5, "fertility_level": "High"},
        )
        assert soil.status_code == 200, soil.text
        weather = client.post(
            "/api/v1/weather",
            headers=headers,
            json={"farm_id": farm_id, "rainfall": 850, "average_temperature": 26, "humidity": 65, "climate_condition": "Clear"},
        )
        assert weather.status_code == 200, weather.text
        assert len(client.get("/api/v1/farms", headers=headers).json()) == 1
        assert len(client.get("/api/v1/soils", headers=headers).json()) == 1
        assert len(client.get("/api/v1/weather", headers=headers).json()) == 1

        csv = b"avg_temp,average_rain_fall_mm_per_year,ph,yield_kg_per_ha\n26,850,6.5,4000\n"
        upload_one = client.post("/api/v1/datasets/upload", headers=headers, files={"file": ("same-name.csv", BytesIO(csv), "text/csv")})
        upload_two = client.post("/api/v1/datasets/upload", headers=headers, files={"file": ("same-name.csv", BytesIO(csv), "text/csv")})
        assert upload_one.status_code == upload_two.status_code == 200, (upload_one.text, upload_two.text)

        datasets = client.get("/api/v1/datasets", headers=headers).json()
        paths = [dataset["filepath"] for dataset in datasets]
        assert len(datasets) == 2 and len(set(paths)) == 2, datasets
        assert client.delete(f"/api/v1/datasets/{upload_one.json()['id']}", headers=headers).status_code == 200
        remaining = client.get("/api/v1/datasets", headers=headers).json()
        assert len(remaining) == 1 and os.path.exists(remaining[0]["filepath"]), remaining
        assert client.delete(f"/api/v1/datasets/{remaining[0]['id']}", headers=headers).status_code == 200

        prediction = client.post(
            "/api/v1/predict-yield",
            headers=headers,
            json={"crop_name": "Rice", "avg_temp": 26, "rainfall": 850, "soil_ph": 6.5, "nitrogen": 70, "phosphorus": 30, "potassium": 40},
        )
        assert prediction.status_code == 200, prediction.text
        logs = client.get("/api/v1/reports/predictions", headers=headers)
        assert logs.status_code == 200 and len(logs.json()) == 1, logs.text

    print("Live API, database persistence, upload isolation, and prediction logging: PASSED")


if __name__ == "__main__":
    try:
        run()
    finally:
        test_dir.cleanup()
