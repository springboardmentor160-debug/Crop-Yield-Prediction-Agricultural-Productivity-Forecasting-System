# YieldSense AI

YieldSense is a FastAPI, SQLite, scikit-learn/XGBoost and Next.js application for recording farm conditions, forecasting crop yield, identifying agricultural risks, and exporting prediction data.

## Features

- JWT-authenticated farmer workflows; public sign-up creates Farmer accounts only. Administrators manage elevated roles.
- Role-aware farm, crop, soil, weather, historical-yield and dataset records.
- CSV validation and preprocessing (numeric coercion, missing-value imputation, duplicate removal and agronomic-range validation).
- Trainable yield model with MAE, RMSE and R² metrics, saved model artifacts, prediction intervals, and feature importance where supported.
- Soil and weather assessment, risk-aware recommendations, live-data analytics, and CSV prediction export.

## Run locally

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET_KEY`. Do not commit `.env`.
2. In `backend`, create and activate a virtual environment, then run `pip install -r requirements.txt`.
3. Prepare and train the bundled sample dataset:

   ```powershell
   cd backend
   python preprocess.py
   python train_model.py
   $env:JWT_SECRET_KEY = "a-long-development-secret"
   uvicorn main:app --reload
   ```

   To bootstrap the first administrator securely, run `python create_admin.py` from `backend` and follow the prompts.

4. In a second terminal start the web client:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

The client runs at `http://localhost:3000`, and API documentation is at `http://localhost:8000/docs`.

## Dataset format

Training data must contain a yield column (`yield_kg_per_ha`, `hg/ha_yield`, `Yield_Tons`, or `yield_amount`) and equivalent temperature, rainfall, and pH columns. Canonical fields are `avg_temp`, `average_rain_fall_mm_per_year`, `ph`, and `yield_kg_per_ha`.

## Verification

From `backend`, run `python -m compileall app main.py preprocess.py train_model.py` and start the API before running `python test_api.py`. From `frontend`, run `npm run build`.

## Deployment notes

Set `JWT_SECRET_KEY`, `CORS_ORIGINS`, `DATABASE_URL`, and `NEXT_PUBLIC_API_BASE` in the deployment environment. Use HTTPS and a managed database for a multi-instance deployment. SQLite is appropriate for local/single-node use.
