# YieldSense AI

## Overview
YieldSense AI is a centralized, predictive agricultural analytics platform designed to estimate future crop yields using environmental factors, weather metrics, and soil characteristics. The platform translates complex predictive model data into plain-English agronomic recommendations and real-time risk assessment alerts, empowering farmers, researchers, and administrators to make data-driven agricultural decisions.

## Features
- **Crop Yield Prediction**: Interactive machine learning crop yield forecasting using a trained XGBoost regressor model.
- **Role-Based Portals**: Dedicated, responsive dashboard layouts tailored to the needs of Farmers (prediction/alerts), Researchers (model metrics/API specs), and Administrators (system logs/metrics).
- **Agronomic Recommendations**: Dynamic soil and nutrient recommendations (NPK/pH inputs) to optimize crop management.
- **Risk Assessment System**: Real-time climate risk calculation (Low/Medium/High Risk badges) using automated temperature and rainfall threshold alerts.
- **Data Exporting**: Capability to export productivity and prediction reports as CSV or PDF documents.
- **Comprehensive API Tests**: Full unit testing coverage of backend endpoints with Pytest.

## Tech Stack
- **Backend**: Python FastAPI, SQLAlchemy (SQLite local / PostgreSQL production), Pydantic
- **Frontend**: Next.js, React, Tailwind CSS, Recharts
- **ML & Analytics**: Scikit-learn, XGBoost, Pandas, NumPy
- **Deployment & DevOps**: Docker, Docker Compose, Pytest, HTTPX

## Setup Instructions

### Local Manual Installation

#### 1. Clone the repository
```bash
git clone https://github.com/springboardmentor656-alt/Title-YieldSense-AI-Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System.git
cd Title-YieldSense-AI-Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System
git checkout Tirutopu-Srivardhan
```

#### 2. Start Backend Server
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

#### 3. Start Frontend Server
In a new terminal window:
```bash
cd frontend
npm install
npm run dev -- --port 3000
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

#### 4. Run Backend Tests
Ensure your backend virtual environment is active, then run:
```bash
python -m pytest tests/ -W ignore
```

---

### Run with Docker (Recommended)
You can start all services (Frontend, Backend, and PostgreSQL database) simultaneously using Docker Compose:
```bash
docker-compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000).

For cloud production deployment steps (AWS and Azure architecture), see the detailed [Cloud & Container Deployment Guide](docs/deployment.md).

## Screenshots
*(Dashboards screenshots can be added here during documentation review)*

## License
This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md)
