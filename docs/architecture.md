# YieldSense AI — System Architecture

## Overview

```
[ Users: Farmers, Admins, Agri Consultants ]
                │
                ▼
[ Web / Mobile Application (React.js / Next.js, Tailwind CSS) ]
                │
                ▼
[ API Gateway — Authentication (JWT), Request Routing, Rate Limiting, Logging ]
                │
                ▼
[ AI & Data Processing Pipeline ]
   1. Data Collection      (crop info, farm data, soil test results)
   2. Data Preprocessing   (cleaning, missing value handling, feature engineering)
   3. Weather Analysis     (rainfall, temperature, seasonal patterns)
   4. Soil Analysis        (pH, nutrients, fertility, suitability)
   5. Yield Prediction     (XGBoost / Random Forest / LightGBM)
   6. Prediction Outputs   (predicted yield kg/ha, risk score, confidence)
   7. Recommendations      (crop suggestions, fertilizer advice, irrigation plan)
                │
                ▼
[ Agricultural Analytics & Insights — dashboards, reports, risk & anomaly detection ]
                │
                ▼
[ Data & Storage Layer ]
   - PostgreSQL (Users, Farms, Crops — relational data)
   - MongoDB (operational/unstructured data)
   - Historical crop data storage
   - Weather data storage (AWS S3 / Blob)
                │
                ▼
[ Infrastructure Layer ]
   - Docker / Docker Compose (containerization)
   - Kubernetes (orchestration, optional at scale)
   - Cloud Platform: AWS / Azure
   - Load Balancer, Monitoring, CI/CD Pipeline
```

## Component Responsibilities

### Frontend (React.js / Next.js)
- Farmer/Admin dashboards
- Farm onboarding forms
- Yield prediction visualizations (charts, maps)
- Auth screens (login/register)

### Backend (FastAPI)
- REST API endpoints for auth, farms, crops, predictions
- JWT issuance and validation
- Orchestrates calls to ML inference layer and external Weather APIs
- Role-based access control middleware

### Database Layer
- **PostgreSQL** — structured relational data: `users`, `farms`, `crops`
- **MongoDB** (optional) — operational logs, unstructured farm notes
- **Data Warehouse** — historical yield + weather data for model training

### AI/ML Layer
- Preprocessing pipeline (Pandas, NumPy)
- Model training (Scikit-learn, XGBoost, TensorFlow)
- Model serving (inference endpoint consumed by backend)

### Infrastructure
- Dockerized backend + frontend services
- Deployed via AWS or Azure
- CI/CD pipeline for automated build/test/deploy

## Data Flow Summary

| Stage | Input | Process | Output |
|---|---|---|---|
| Auth | Email/password | JWT issuance | Authenticated session |
| Farm Onboarding | Geo-coords, soil N-P-K, pH | Stored in `farms` table | Farm profile record |
| Weather Enrichment | Farm coordinates | External Weather API call | Historical/forecast weather features |
| Data Unification | Soil + Weather + Crop type | Feature assembly | ML-ready feature vector |
| Prediction | Feature vector | ML model inference | Yield (kg/ha), confidence, risk flags |
| Recommendation | Prediction output | Rule/ML-based advisory logic | Farming suggestions, risk mitigation tips |
