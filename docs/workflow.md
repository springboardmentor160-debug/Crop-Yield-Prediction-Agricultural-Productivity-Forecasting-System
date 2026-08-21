# Programmatic Workflows - YieldSense AI

Traces the end-to-end programmatic flow of data across the system.

## 1. Information Flow Diagram
```
  [User Authentication]
           |
           v
  [Onboard Farm Profile]  ---> (Store Geo-coords, Farm Name & Soil pH)
           |
           v
  [Calculate Forecast]    ---> (Input Temperature, Rainfall & Soil pH)
           |
           v
  [POST API Inference]    ---> (Submit payload to /api/v1/predict-yield)
           |
           v
  [Model Prediction]      ---> (FastAPI loads model.pkl, predicts yield via XGBoost)
           |
           v
  [Dynamic UI Update]     ---> (Renders Predicted Yield, Weather status & Soil ratings)
```

## 2. Step-by-Step Sequence

### Step 1: User Login
- The User logs in via a Next.js form.
- The client receives an encrypted JWT authorization token from the FastAPI backend and stores it.

### Step 2: Farm Profile Onboarding
- The User fills out a form specifying:
  - Farm Name
  - Geo-coordinates (Latitude & Longitude)
  - Soil pH

### Step 3: Yield Forecasting Trigger
- Under the Farmer Dashboard tab, the user inputs coordinates/measurements:
  - Avg Temperature (°C)
  - Avg Annual Rainfall (mm)
  - Soil pH
- On form submit, an asynchronous `POST` request is sent to `http://127.0.0.1:8000/api/v1/predict-yield`.

### Step 4: Machine Learning Inference
- The FastAPI backend captures the payload, imports `joblib`, and parses `data/processed/crop_yield_model.pkl`.
- Runs inference via the trained XGBoost Regressor model.
- Determines ratings:
  - Weather Status: `Optimal` (if Temp is 20-30°C) or `Stress Detected`
  - Soil Rating: `High Fertility` (if pH is 6.0-7.5) or `Suboptimal pH`
- Returns prediction values to the frontend.

### Step 5: Visual UI Update
- The frontend extracts data from the JSON response and updates state hooks, updating cards immediately without a page reload.
