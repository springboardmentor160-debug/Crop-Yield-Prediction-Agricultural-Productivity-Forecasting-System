YieldSense AI

Crop Yield Prediction & Agricultural Productivity Forecasting System

An AI-powered platform that helps farmers and agricultural organizations estimate future crop production using historical farming data, weather conditions, and soil characteristics.

📌 Objective

YieldSense AI supports crop yield forecasting, weather analysis, soil analysis, productivity prediction, and agricultural analytics through a centralized platform. It's designed to improve farming decisions, optimize resource utilization, reduce uncertainty, and increase agricultural productivity using data-driven insights.

Target users: Farmers, agricultural cooperatives, agribusiness companies, government agriculture departments, and smart farming initiatives.

✅ Outcomes
AI-powered crop yield prediction and agricultural productivity forecasting platform
Authentication and role-based access control
Crop yield forecasting and production estimation workflows
Weather analysis and soil assessment modules
Rule-based recommendation and risk assessment engine
Analytics dashboards for yield forecasting and seasonal performance monitoring
Interactive GIS map of farm field locations
Downloadable PDF and CSV performance reports
Dockerized backend and frontend, ready for containerized deployment
🏗️ Architecture Overview
User (Browser)
      │
      ▼
Next.js Frontend  ──────────────►  FastAPI Backend  ──────────────►  PostgreSQL
 (React, TS,                        (auth, routers,                  (users, farms,
  Recharts, Leaflet)                 XGBoost inference,               predictions,
                                      recommendation &                 history)
                                      risk logic)

Key components:

Frontend: Next.js app — dashboard, prediction form, analytics charts, GIS map, recommendation/risk views, PDF/CSV export
Backend API: FastAPI — JWT-based authentication, routers for auth, farms, predictions, weather, soil, recommendations, risk, analytics, GIS, admin, notifications
ML Inference: Trained XGBoost model loaded at prediction time to estimate yield from crop, weather, and soil inputs
Database: PostgreSQL — user accounts, farm records, prediction history
🧩 Modules
User Management — registration, login, profile, farm info, JWT auth
Data Collection — crop data, weather integration, soil info, historical records
Yield Prediction — XGBoost-based forecasting and production estimation
Weather Analysis — rainfall, temperature, climate trends, impact assessment
Soil Analysis — soil quality, nutrients, fertility, suitability recommendations
Analytics Dashboard — yield trends, seasonal comparisons, farm performance charts
Recommendations & Risk — crop planning, fertilizer/irrigation advice, drought/heat/flood risk alerts
GIS — interactive map of farm field locations
Reports — downloadable PDF and CSV summaries
📊 Dataset

Trained on a Kaggle-style crop yield dataset (28,242 records) covering 10 crop types: Cassava, Maize, Plantains and others, Potatoes, Rice (paddy), Sorghum, Soybeans, Sweet Potatoes, Wheat, and Yams. Features include rainfall, average temperature, pesticide usage, year, and crop type.

🗓️ Roadmap
Milestone	Weeks	Focus
1	1–2	Project init, architecture/DB design, auth, data collection pipeline
2	3–4	ML model training, weather & soil analysis modules
3	5–6	Analytics dashboards, recommendation engine, risk assessment
4	7–8	Testing, deployment (Docker/cloud), documentation, demo
🛠️ Tech Stack

Backend: FastAPI Frontend: Next.js (React, TypeScript), Tailwind CSS Database: PostgreSQL AI/ML: XGBoost, scikit-learn, Pandas, NumPy Auth: JWT Visualization: Recharts, Leaflet (GIS) DevOps: Docker, Docker Compose, Git/GitHub, Postman

📈 Performance Metrics

AI Model (XGBoost Regressor):

Metric	Value
MAE	0.93 tons/ha
RMSE	1.60 tons/ha
R² Score	0.9647 (96.5%)

Trained on 22,593 samples, evaluated on a held-out test set of 5,649 samples (20% split) not seen during training.

Model configuration:

python
XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
)
🚀 Getting Started
bash
# Clone the repository
git clone <repo-url>
cd yieldsense-ai

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend runs at http://localhost:8000. Interactive API docs at http://localhost:8000/docs.

bash
# Frontend setup
cd frontend
npm install
npm run dev

Frontend runs at http://localhost:3000.

bash
# Train the model (optional — a trained model is already included)
cd backend
python -m app.ml.train_model
bash
# Run with Docker (optional)
docker compose up --build
📄 License

This project is licensed under the MIT License — see LICENSE.