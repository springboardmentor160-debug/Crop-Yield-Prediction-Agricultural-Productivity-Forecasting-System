# System Architecture

## YieldSense AI Platform

### 1. Frontend
* **Framework**: Next.js (React) + Tailwind CSS
* **Components**: 
    - `api.ts`: Centralized fetch wrapper that communicates with the FastAPI backend.
    - `Dashboard`: Pulls combined agricultural analysis (Yield, Recommendation, Weather).
    - `Onboarding`: Collects latitude, longitude, and base soil metrics (N, P, K, pH).

### 2. Backend API
* **Framework**: FastAPI
* **Routers**:
    - `auth.py`: JWT issuance and validation.
    - `farms.py`: CRUD operations for farm profiles.
    - `crops.py`: CRUD operations for crops planted on farms.
    - `analysis.py`: The core agricultural intelligence workflow tying together models, weather, and farm data.

### 3. Services Layer
* **Weather Service (`weather_service.py`)**:
    - Integrates with Open-Meteo API to fetch `temperature`, `humidity`, and `rainfall`.
    - Integrates with Geopy (Nominatim) for reverse geocoding to resolve `latitude`/`longitude` to `Area` (Country) for ML models.
* **ML Service (`ml_service.py`)**:
    - Keeps `joblib` models cached in memory to avoid reloading during inference.
    - Prepares the canonical feature vector required by the ML models.
    - Executes prediction logic.

### 4. Machine Learning Pipeline
* **Training Scripts**: `ml/training/train_yield.py` and `train_recommendation.py`
* **Artifacts**: Persisted in `ml/models/`.
* **Execution**: Offline execution; models are pre-trained and serialized.

### 5. Database Layer
* **Store**: PostgreSQL
* **Schema**: Handled via raw SQL (`schema.sql` and `database.py`). 
* **Entities**: `users`, `farms`, `crops`, `weather_observations`, `yield_predictions`, `recommendations`, `risk_assessments`.
* **Flow**: The `analysis` router persists weather and prediction data continuously, enabling historical analytics.
