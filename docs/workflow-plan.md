# Agricultural Forecasting Workflow Plan

This document traces the programmatic flow of information through YieldSense AI, from user authentication to yield prediction, before implementation.

## Problem Statement

Farmers and agricultural organizations operate under high economic vulnerability due to changing climate dynamics, variable soil qualities, and unpredictable weather events. Traditional farming relies on historical intuition, which fails under extreme climate volatility — leading to resource misallocation (over-fertilization, poor crop choice, water wastage), lower seasonal yield, and food supply insecurity.

## Project Aim

A centralized, web-responsive predictive analytics ecosystem that uses machine learning (tabular & time-series models) to ingest environmental metrics and provide real-time agricultural yield forecasts (kg/ha), alongside proactive climate risk mitigation advice.

## End-to-End Pipeline

```
┌─────────────────────┐
│  1. User Login        │
│  Frontend captures     │
│  credentials → backend │
│  issues JWT             │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│  2. Farm Profile      │
│  Creation              │
│  User submits:          │
│  - Geo-coordinates      │
│    (lat/long)            │
│  - Soil N-P-K readings  │
│  - Farm name, area, pH  │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│  3. Weather Data       │
│  Enrichment             │
│  Backend takes farm      │
│  coordinates → requests  │
│  external Weather API →  │
│  stores historical        │
│  environmental features   │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│  4. Dataset Unification │
│  Soil parameters +        │
│  historic weather +       │
│  target crop type are      │
│  merged into one record    │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│  5. Preprocessing      │
│  Pipeline               │
│  Missing values imputed, │
│  outliers dropped,        │
│  clean matrix produced    │
│  for ML training          │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│  6. Yield Prediction   │
│  ML model (XGBoost /     │
│  RandomForest) infers     │
│  yield estimate (kg/ha)   │
│  + risk mitigation advice │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│  7. Dashboard Display  │
│  Role-based dashboard     │
│  (Farmer / Analyst /       │
│  Admin) renders forecast,   │
│  weather trends, soil        │
│  health, and recommendations│
└─────────────────────┘
```



1. **User Login** — Frontend captures credentials, backend issues an encrypted JWT authorization token.
2. **Farm Profile Creation** — User creates a farm profile containing geo-coordinates (latitude/longitude) and soil N-P-K readings.
3. **Weather Data Enrichment** — Backend captures the farm's coordinates, issues a request to an external Weather API, and stores historical environmental features.
4. **Dataset Unification** — Soil parameters + historic weather + target crop type are merged into a single feature set.
5. **Preprocessing** — Missing climate variables are imputed, invalid records (e.g. negative rainfall) are dropped, clean data is written to `data/processed/`.
6. **Yield Prediction** — The unified, preprocessed feature row is passed to the trained ML model (XGBoost / RandomForest), producing a yield estimate (kg/ha) and risk assessment.
7. **Recommendations** — A rules/recommendation layer translates model output + input features into farming advice (irrigation timing, fertilizer adjustment, risk flags).
8. **Dashboard Presentation** — Results are rendered per role (Farmer / Analyst / Admin).


## Step-by-Step Detail

### Step 1 — Authentication
- User submits email/password via the login/register form.
- Backend validates credentials, hashes/verifies password (bcrypt), and issues a JWT containing user ID and role.
- Frontend stores the token and attaches it as a Bearer token on all subsequent requests.

### Step 2 — Farm Profile Creation
- Authenticated user creates a farm record with:
  - Farm name, location
  - Latitude / longitude
  - Area (hectares)
  - Soil pH (and N-P-K where available)
- Stored against the user's ID (`farms.user_id` foreign key).

### Step 3 — Weather Data Integration
- Backend uses the farm's stored coordinates to call a weather API.
- Historical and current rainfall, temperature, and humidity are retrieved and cached/stored.

### Step 4 — Dataset Unification
- For a given farm + crop combination, the system merges:
  - Soil parameters (from the farm profile)
  - Weather features (from Step 3)
  - Target crop type (user-selected)
- Produces a single feature row ready for inference.

### Step 5 — Preprocessing
- Missing climate variables are imputed using historical means.
- Invalid records (e.g. negative rainfall) are filtered out.
- Output written to `data/processed/` as clean, model-ready CSV.

### Step 6 — Prediction & Recommendations
- The unified, preprocessed feature row is passed to the trained ML model.
- Model returns a yield estimate (kg/ha or tons/hectare).
- A rules/recommendation layer translates model output + input features into farming advice (e.g. irrigation timing, fertilizer adjustment, risk flags).

### Step 7 — Dashboard Presentation
- Results are rendered per role:
  - **Farmer** — sees their own farm's yield forecast, weather trends, soil health, and recommendations.
  - **Analyst** — sees aggregated data across farms, can run/tune models, generate reports.
  - **Admin** — manages users/roles and views system-wide analytics.

## Actors

| Actor | Responsibility |
|---|---|
| Farmer | Registers, creates farm profiles, requests yield predictions, views recommendations |
| Analyst | Reviews model outputs, generates reports, explores raw data |
| Admin | Manages user accounts and roles, monitors system health |
| System (backend) | Authenticates users, orchestrates weather API calls, runs preprocessing, serves ML inference, persists data |

## Data Flow Summary

```
User → Auth (JWT) → Farm Profile (Postgres) → Weather API → Merged Dataset
    → Preprocessing Pipeline → ML Model → Prediction + Recommendations → Dashboard
```
