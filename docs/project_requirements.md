# YieldSense AI — Project Requirements

## 1. Problem Statement

Farmers and agricultural organizations operate under high economic vulnerability due to
changing climate dynamics, variable soil qualities, and unpredictable weather events.
Traditional farming relies on historical intuition, which fails under extreme climate
volatility. This creates resource misallocation (over-fertilization, poor crop choice,
water wastage), lowers seasonal crop yield, and causes food supply insecurity.

## 2. Project Aim/ Solution

Build a centralized, web and mobile-responsive predictive analytics platform —
**YieldSense AI** — that uses machine learning (tabular & time-series models) to ingest
environmental metrics and provide real-time agricultural yield forecasts (kg/ha),
alongside proactive climate risk mitigation advice.

## 3. Target Users

- Farmers
- Agricultural cooperatives
- Agribusiness companies
- Government agriculture departments
- Smart farming initiatives

## 4. Core Objectives

| # | Objective |
|---|---|
| 1 | Build a multi-tenant authentication engine restricting dashboard analytics by user role (Farmer vs. Agribusiness Admin) |
| 2 | Construct an end-to-end preprocessing pipeline converting heterogeneous agricultural data into clean, ML-ready arrays |
| 3 | Develop data integrations with regional meteorological APIs and soil composition structures |
| 4 | Deploy lightweight ML models (XGBoost / Random Forest) optimized for fast inference on web/mobile |

## 5. Functional Requirements

- User registration, login, and role-based access control (Farmer / Admin)
- Farm profile creation with geo-coordinates and soil test data
- Weather data integration per farm location
- Crop yield prediction (kg/ha) with confidence score
- Risk assessment and farming recommendations
- Analytics dashboard: yield trends, seasonal performance, farm comparisons

## 6. Non-Functional Requirements

- API response time under 500ms
- Dashboard load time under 2 seconds
- Secure password storage (bcrypt hashing) and JWT-based session management
- Data privacy: each farmer can only view their own farm data (unless Admin role)

## 7. Success Metrics

- Prediction accuracy (MAE, RMSE) within acceptable thresholds
- Successful JWT-authenticated register/login flow
- Persisted data in PostgreSQL across users, farms, and crops tables
- Clean, anomaly-free processed dataset ready for ML training in Milestone 2
