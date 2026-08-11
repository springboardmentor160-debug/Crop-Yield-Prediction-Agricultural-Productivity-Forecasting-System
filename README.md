# YieldSense AI

YieldSense AI is a centralized, predictive analytics web platform designed to estimate future crop production using environmental parameters, weather conditions, and soil characteristics.

---

## 📋 Problem Statement
Farmers and agricultural organizations operate under high economic vulnerability due to changing climate dynamics, variable soil qualities, and unpredictable weather events. Traditional farming relies on historical intuition, which fails under extreme climate volatility. This creates resource misallocation (over-fertilization, poor crop choice, water wastage), lowers seasonal crop yield, and causes food supply insecurity.

## 🛠️ What We Have Implemented
* **Scaffolded Workspace**: Initialized a Next.js frontend with Tailwind CSS and a Python FastAPI backend server running a mock database fallback to SQLite for local development.
* **Authentication Engine**: Created password encryption and JWT session handlers (`auth_handler.py`) to manage user security.
* **Data Cleaning Preprocessor**: Wrote a Pandas data preprocessor (`preprocess.py`) to clean datasets, impute missing values, and filter negative-value outliers.
* **Predictive ML Script**: Built a training script (`train_model.py`) using XGBoost to split datasets, train predictions, analyze feature coefficients, and serialize weights to a binary model (`crop_yield_model.pkl`).
* **Inference Endpoint & UI Form**: Developed the POST API route `/api/v1/predict-yield` and connected it to a dynamic frontend form that triggers live predictions and updates stats in real-time.

## 💻 Tech Stack
* **Frontend**: React, Next.js (App Router), Tailwind CSS (v3 with Custom Glassmorphism).
* **Backend**: Python, FastAPI, Uvicorn, SQLAlchemy.
* **Database**: PostgreSQL (Structured Models) + SQLite (Fallback cache) + MongoDB (Prediction Logs).
* **Machine Learning**: Scikit-Learn, XGBoost, Joblib, Pandas, NumPy.

## ✨ Core Features
* **Role-Based Access (RBAC)**: Secure pages and custom dashboard layouts mapping specifically to 5 user roles (Farmer, Admin, Consultant, Researcher, Department).
* **AI Yield Forecasting**: Inputs for Average Temperature, Rainfall, and pH that return mathematically calculated yield estimates ($kg/ha$).
* **Real-time Advisories**: Instant weather warnings (Optimal vs Stress) and soil health feedback (High Fertility vs Suboptimal pH) based on inputs.