# Project Requirements - YieldSense AI

## 1. Problem Statement
Farmers and agricultural organizations operate under high economic vulnerability due to changing climate dynamics, variable soil qualities, and unpredictable weather events. Traditional farming relies on historical intuition, which fails under extreme climate volatility. This creates resource misallocation (over-fertilization, poor crop choice, water wastage), lowers seasonal crop yield, and causes food supply insecurity.

## 2. Project Aim
To develop a centralized Web and Mobile-responsive Predictive Analytics ecosystem called **YieldSense AI** that uses machine learning algorithms (Tabular & Time-series) to ingest environmental metrics and provide real-time agricultural yield forecasts (kg/ha) alongside proactive climate risk mitigation advice.

## 3. Core Project Objectives
- **Objective 1**: Build a multi-tenant authentication engine restricting dashboard analytics by user roles (Complete).
- **Objective 2**: Construct an end-to-end Python-based tabular preprocessing pipeline that converts heterogeneous agricultural data into clean, formatted arrays fit for machine learning (Complete).
- **Objective 3**: Develop high-frequency data integrations with regional meteorological APIs and soil composition structures (Complete).
- **Objective 4**: Deploy localized, lightweight ML models (such as XGBoost/RandomForest) optimized for fast inference latency on consumer mobile viewports (Complete - XGBoost Model deployed).

## 4. Milestone Schedule & Status
- **Milestone 1**: Project Initialization, Design Process & Core Setup (Weeks 1 & 2) - **Status: Complete**
- **Milestone 2**: Yield Prediction & Agricultural Analysis (Weeks 3 & 4) - **Status: Complete**
  - Trained XGBoost Regressor on features `avg_temp`, `average_rain_fall_mm_per_year`, and `ph` against target `yield_kg_per_ha`.
  - Evaluated MAE (`429.02 kg/ha`) and RMSE (`558.22 kg/ha`).
  - Created `/api/v1/predict-yield` API.
  - Linked interactive forecasting UI inputs directly to model endpoints.
- **Milestone 3**: Dashboard, Reporting & Recommendations (Weeks 5 & 6) - **Status: Pending**
- **Milestone 4**: Testing, Deployment & Documentation (Weeks 7 & 8) - **Status: Pending**
