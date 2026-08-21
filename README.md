# YieldSense AI

**Crop Yield Prediction & Agricultural Productivity Forecasting System**

YieldSense AI is a full-stack, AI-powered platform that helps farmers, cooperatives,
agricultural consultants, and government agriculture departments forecast crop
yield using historical farming data, weather conditions, and soil characteristics.
It combines a trained machine learning model with role-based farm management,
weather and soil analysis, analytics dashboards, and an automated agronomic
recommendation engine.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Quick Start (Docker)](#quick-start-docker)
6. [Manual Setup — Backend](#manual-setup--backend)
7. [Manual Setup — Frontend](#manual-setup--frontend)
8. [Windows-Specific Notes](#windows-specific-notes)
9. [Demo Accounts](#demo-accounts)
10. [API Overview](#api-overview)
11. [Machine Learning Pipeline](#machine-learning-pipeline)
12. [Role-Based Access Control](#role-based-access-control)
13. [Environment Variables](#environment-variables)
14. [Troubleshooting](#troubleshooting)

---

## Features

- **Authentication & RBAC** — JWT-based auth with 5 roles: Admin, Government
  Official, Agricultural Consultant, Cooperative Manager, and Farmer, each with
  scoped data visibility.
- **Farm & Crop Management** — Create and manage farms, crop cycles, planting
  dates, irrigation types, and growth stages.
- **Weather Analysis** — Log and visualize rainfall, temperature, humidity, and
  wind speed history per farm.
- **Soil Analysis** — Track pH, N-P-K levels, organic matter, and moisture, with
  an automatically computed soil health index.
- **AI Yield Prediction** — A RandomForest regression pipeline (trained on an
  agronomically-grounded dataset) predicts yield in kg/ha, total production,
  a 0–100 productivity score, and a model confidence score.
- **Risk Assessment** — Automatic Low/Moderate/High risk classification from
  soil and weather stress indicators.
- **Recommendation Engine** — Rule-based fertilizer, irrigation, pest, and
  general farming recommendations generated from each prediction.
- **Analytics Dashboards** — Yield trends, risk distribution, crop comparison,
  and farm-to-farm productivity comparison reports.
- **Dockerized Deployment** — One-command startup with Docker Compose.

## Architecture

```
 Users (Farmers, Consultants, Gov, Co-ops)
              │
      React 18 + Vite Frontend  (Tailwind CSS, Recharts)
              │  REST / JWT
      FastAPI Backend  (SQLAlchemy ORM, Pydantic v2)
              │
   ┌──────────┼──────────────┐
   │          │              │
 SQLite/   ML Pipeline    Recommendation
 Postgres  (scikit-learn   Engine (rules)
  (data)    RandomForest)
```

Request flow for a prediction: the frontend calls `POST /api/predictions` with
a `crop_id`. The backend fetches the crop's most recent weather and soil
records, builds a feature vector, runs it through the persisted RandomForest
pipeline (`app/ml/predictor.py`), stores the result, generates fresh
recommendations, and returns everything to the client in one response.

## Tech Stack

| Layer            | Technology                                              |
|-------------------|----------------------------------------------------------|
| Backend           | Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2        |
| Auth              | JWT (python-jose), bcrypt (direct, not via passlib)      |
| Database          | SQLite (default) — swappable for PostgreSQL              |
| Machine Learning  | scikit-learn (RandomForestRegressor), pandas, numpy       |
| Frontend          | React 18, Vite, React Router 6, Tailwind CSS, Recharts    |
| Deployment        | Docker, Docker Compose, Nginx (frontend static serving)  |

## Project Structure

```
yieldsense-ai/
├── backend/
│   ├── app/
│   │   ├── core/          # config, security (JWT/bcrypt), RBAC deps
│   │   ├── db/            # SQLAlchemy engine/session
│   │   ├── models/        # ORM models (User, Farm, Crop, Weather, Soil, Prediction)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routers/       # API route handlers, one file per resource
│   │   ├── services/      # access control + recommendation engine
│   │   ├── ml/            # dataset generator, training script, predictor
│   │   └── main.py        # FastAPI app entrypoint
│   ├── seed.py             # demo data seeding script
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/            # axios client + resource functions
│   │   ├── context/        # AuthContext
│   │   ├── components/     # AppLayout, ProtectedRoute, UI kit
│   │   ├── pages/           # Login, Register, Dashboard, Farms, Predictions, ...
│   │   └── App.jsx / main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start (Docker)

The fastest way to run the full platform. Requires **Docker Desktop**
(Windows/macOS) or Docker Engine + Compose (Linux).

```bash
git clone <this-repository>
cd yieldsense-ai
docker compose up --build
```

This will:
1. Build the backend image, train the ML model, and seed demo data.
2. Build the frontend image and serve it via Nginx (proxying `/api` to the backend).

Once running:
- Frontend: **http://localhost:5173**
- Backend API docs (Swagger): **http://localhost:8000/docs**

Stop with `docker compose down`. Add `-v` to also remove the persisted database
volume if you want a completely fresh start.

## Manual Setup — Backend

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows PowerShell
venv\Scripts\Activate.ps1
# If PowerShell blocks the script with an execution-policy error, run once:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

pip install -r requirements.txt

# Train the ML model (writes app/ml/artifacts/yield_model.joblib)
python -m app.ml.train

# Seed demo users, farms, crops, weather/soil history, and sample predictions
python seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`. The model auto-trains on first prediction request
if the artifact is missing, so `python -m app.ml.train` is optional but
recommended so the first request isn't slowed down by training.

## Manual Setup — Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies any `/api/*`
request to `http://localhost:8000` (configured in `vite.config.js`), so make
sure the backend is running first.

For a production build:

```bash
npm run build
npm run preview
```

## Windows-Specific Notes

These notes reflect common issues on a fresh Windows 11 setup:

- **PowerShell venv activation**: use `venv\Scripts\Activate.ps1`, not the
  Unix `source venv/bin/activate`. If you see an execution-policy error, run:
  `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **bcrypt/passlib conflicts**: this project calls `bcrypt` directly
  (`app/core/security.py`) instead of going through `passlib`, which avoids
  the version-detection breakage seen with newer bcrypt wheels on Windows.
- **Build tools**: if `pip install` fails on a package that needs compilation,
  install the "Desktop development with C++" workload from the Visual Studio
  Build Tools installer, or prefer the pinned minimum versions already set in
  `requirements.txt`.
- **Docker Desktop PATH**: if `docker` isn't recognized in a new terminal
  after installing Docker Desktop, add its install directory to your user PATH
  manually and restart the terminal.

## Demo Accounts

After running `python seed.py` (or `docker compose up`), the following demo
accounts are available — all with password **`YieldSense@123`**:

| Role                  | Email                       |
|------------------------|------------------------------|
| Admin                  | admin@yieldsense.ai          |
| Government Official    | gov@yieldsense.ai             |
| Agricultural Consultant| consultant@yieldsense.ai      |
| Cooperative Manager    | coop@yieldsense.ai             |
| Farmer                 | farmer1@yieldsense.ai         |
| Farmer                 | farmer2@yieldsense.ai         |

## API Overview

All endpoints are prefixed with `/api`. Full interactive documentation is
available at `/docs` (Swagger UI) or `/redoc` once the backend is running.

| Resource        | Endpoints                                                        |
|-------------------|--------------------------------------------------------------------|
| Auth             | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `GET /auth/me` |
| Users            | `GET /users`, `PUT /users/me`, `PATCH /users/{id}/activate`         |
| Farms            | `GET/POST /farms`, `GET/PUT/DELETE /farms/{id}`                     |
| Crops            | `GET/POST /crops`, `GET/PUT/DELETE /crops/{id}`                     |
| Weather          | `GET/POST /weather`, `GET /weather/trend`                           |
| Soil             | `GET/POST /soil`, `GET /soil/health-index`                          |
| Predictions      | `POST /predictions`, `GET /predictions/crop/{crop_id}`              |
| Recommendations  | `GET /recommendations`, `GET /recommendations/crop/{crop_id}`       |
| Analytics        | `GET /analytics/summary`, `GET /analytics/farm-comparison`          |

## Machine Learning Pipeline

- **Training data**: `app/ml/dataset.py` generates a synthetic dataset of
  6,000 samples across 8 crop profiles (Wheat, Rice, Maize, Soybean, Cotton,
  Sugarcane, Barley, Potato) using agronomically-motivated response curves
  (Gaussian temperature/rainfall optima, nutrient-saturation curves,
  irrigation buffering). Swap this module for a loader over FAOSTAT, USDA, or
  Kaggle crop-yield datasets to use real-world data — the feature schema
  (`temperature_c`, `rainfall_mm`, `ph_level`, `nitrogen_ppm`, etc.) is
  designed to match columns available in those sources.
- **Model**: `RandomForestRegressor` (300 trees) inside a scikit-learn
  `Pipeline` with a `ColumnTransformer` (StandardScaler for numeric features,
  OneHotEncoder for categorical features).
- **Evaluation** (on the bundled synthetic dataset): **R² ≈ 0.98**,
  **MAE ≈ 850 kg/ha**, **MAPE ≈ 10%** on a held-out 20% test split. Metrics
  are written to `app/ml/artifacts/metrics.json` after each training run.
- **Confidence scoring**: derived from agreement across the RandomForest's
  individual trees (lower prediction variance → higher confidence), discounted
  when a farm has no recent weather/soil records.
- **Risk assessment & recommendations**: `app/services/recommendation_engine.py`
  applies agronomic thresholds (pH, N-P-K, rainfall, temperature, humidity) to
  classify risk and generate specific, prioritised advice.

## Role-Based Access Control

| Role                 | Access                                                          |
|------------------------|--------------------------------------------------------------------|
| **Admin**             | Full access to all farms, users, and platform administration        |
| **Government Official**| Read access across all farms; user directory visibility             |
| **Agri Consultant**   | Read access across all farms (to advise multiple clients)            |
| **Cooperative Manager**| Full access to farms they own/manage                                 |
| **Farmer**            | Full access to their own farms only                                  |

Row-level checks live in `app/services/access.py` and are applied consistently
across every farm-scoped router (crops, weather, soil, predictions).

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust as needed:

| Variable                        | Default                            | Description                       |
|-----------------------------------|--------------------------------------|--------------------------------------|
| `DATABASE_URL`                   | `sqlite:///./yieldsense.db`         | SQLAlchemy connection string        |
| `SECRET_KEY`                     | (dev default — **change in prod**)  | JWT signing secret                  |
| `ACCESS_TOKEN_EXPIRE_MINUTES`    | `480`                                 | Access token lifetime (8 hours)     |
| `REFRESH_TOKEN_EXPIRE_MINUTES`   | `10080`                               | Refresh token lifetime (7 days)     |

## Troubleshooting

- **"Could not validate credentials" on every request** — your access token
  expired; the frontend automatically retries with the refresh token, but if
  both have expired, log in again.
- **Predictions look generic / low confidence** — add at least one weather
  and one soil record for the farm before running a prediction; without them
  the model falls back to regional defaults and confidence is discounted.
- **`bcrypt` install errors on Windows** — ensure you're using the pinned
  version in `requirements.txt` (`bcrypt>=4.0.1`) and that pip is not pulling
  a pre-release build.
- **Port already in use** — change the exposed ports in `docker-compose.yml`
  or stop the conflicting process (`8000` for backend, `5173` for frontend).

---

Built as part of the YieldSense AI project brief — see the original PDF spec
for the full module breakdown, week-by-week milestones, and evaluation
criteria this implementation covers.
