# YieldSense AI

YieldSense AI is a predictive analytics platform designed to forecast agricultural yields and provide crop recommendations. By leveraging geographical data, weather APIs, and soil composition metrics, the system delivers actionable intelligence.

## Current Capabilities

- **User Authentication**: Secure JWT-based registration and login system with Role-Based Access Control (Farmer, Admin).
- **Farm Management**: Create and manage farm profiles including geospatial coordinates and baseline soil metrics (N, P, K, pH).
- **Crop Management**: Register crops planted on specific farms.
- **Weather Integration**: Dynamic weather resolution using Open-Meteo to fetch real-time temperature, humidity, and rainfall based on farm coordinates.
- **Yield Prediction ML**: A Random Forest regression model trained on historical crop yield data to forecast crop yield (`tons/ha`).
- **Crop Recommendation ML**: A multi-class Random Forest classifier that analyzes soil chemistry and current weather to recommend optimal crops.
- **Dashboard**: A React-based interface presenting the latest agricultural analyses and metrics.

*(Note: Risk prediction models are currently blocked pending the acquisition of a verifiably labeled agricultural risk dataset to ensure compliance with strict no-AI-fabrication guidelines.)*

## Architecture

The system consists of three main pillars:
1. **Frontend**: Next.js App Router, React, Tailwind CSS, TypeScript.
2. **Backend**: FastAPI, PostgreSQL, raw SQL (psycopg2).
3. **ML Pipeline**: Scikit-Learn (Random Forest), Pandas, Geopy.

See `docs/architecture.md` for full details.

## Running Locally

### Backend Setup
1. Create a virtual environment: `python3 -m venv backend/venv`
2. Activate and install dependencies: `source backend/venv/bin/activate && pip install -r backend/requirements.txt`
3. Configure PostgreSQL: Update `backend/.env` with your `DATABASE_URL`.
4. Initialize the DB: `python backend/venv/bin/python -c "from database import init_db; init_db()"`
5. Train the models: 
   ```bash
   python backend/ml/training/train_recommendation.py
   python backend/ml/training/train_yield.py
   ```
6. Start FastAPI: `cd backend && uvicorn main:app --reload`

### Frontend Setup
1. Install Node modules: `cd frontend && npm install`
2. Run development server: `npm run dev`
3. Visit `http://localhost:3000`

## Datasets and ML Models

For detailed information on the open datasets used and the evaluation metrics of the ML models, refer to:
- `docs/datasets.md`
- `docs/ml-models.md`
