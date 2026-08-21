# System Architecture - YieldSense AI

## 1. Core Stack
- **Frontend**: Next.js (React) + Tailwind CSS (configured for v3 with custom glassmorphism styling).
- **Backend**: Python FastAPI (selected for speed, async efficiency, and native ML integrations).
- **Database**: 
  - **PostgreSQL**: For relational, structured entity storage (Users, Farms, Crops).
  - **MongoDB**: For unstructured, high-frequency, or flexible storage (weather records, soil profiles, and model prediction logs).
- **Authentication**: Stateless JSON Web Tokens (JWT) using `PyJWT` and `passlib` for password hashing.
- **Machine Learning Platform**: Scikit-Learn + XGBoost (`XGBRegressor`) + Joblib (for model serialization).

## 2. System Architecture Design
```
       +---------------------------------------------+
       |             Next.js Frontend                |
       |  - UI Pages (Landing, Login, Dashboard)      |
       |  - Interactive "Calculate Forecast" Form     |
       |  - JWT token storage in Session/Local Storage|
       +----------------------+----------------------+
                              |
                     HTTPS Requests / JSON
                              |
                              v
       +----------------------+----------------------+
       |             FastAPI Backend                 |
       |  - /api/v1/auth (Registration, Login)       |
       |  - /api/v1/predict-yield (Inference API)    |
       |  - /api/v1/health (Health check)            |
       |  - Preprocessing pipeline (preprocess.py)   |
       |  - XGBoost Predictor weights (model.pkl)    |
       +------------------+---------------+----------+
                          |               |
               SQLAlchemy |               | Motor Driver
                          v               v
           +--------------+---+       +---+--------------+
           |    PostgreSQL    |       |     MongoDB      |
           |  (Structured DB) |       |  (ML/Unstructured)|
           +------------------+       +------------------+
```

## 3. Communication Workflows
1. **User Authentication**: Client posts credentials to `/api/v1/auth/token` -> Backend validates and signs JWT -> Client receives and stores JWT.
2. **Data Preprocessing**: Script (`preprocess.py`) cleans raw datasets -> Imputes missing metrics using column means -> Trims anomalies.
3. **ML Training Sequence**: Script (`train_model.py`) reads cleaned dataset, splits data (80% train / 20% test), trains an XGBoost model, prints performance scores (MAE, RMSE), and serializes the binary file (`crop_yield_model.pkl`).
4. **Predictive API Flow**: Client sends POST body containing Temperature, Rainfall, and pH to `/api/v1/predict-yield` -> Backend loads `.pkl` file via `joblib`, converts inputs into a 2D numpy array, returns estimate output + environmental ratings.
