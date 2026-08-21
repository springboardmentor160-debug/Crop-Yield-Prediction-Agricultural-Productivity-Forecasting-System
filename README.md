# 🌾 YieldSense AI

## Crop Yield Prediction & Agricultural Productivity Forecasting System

> **Infosys Virtual Internship Project**
>
> An end-to-end AI-powered smart agriculture platform for crop yield prediction, farm management, weather analysis, soil assessment, crop recommendation, agricultural analytics, and professional reporting across Web and Mobile platforms.

---

## 📖 Project Overview

**YieldSense AI** is an end-to-end intelligent agriculture platform developed as part of the **Infosys Virtual Internship Program**.

The system combines:

- Machine Learning
- Historical Crop Yield Data
- Weather Data
- Soil Nutrient Data
- Farm Information
- Cloud Infrastructure

to help farmers and agricultural stakeholders make informed, data-driven decisions.

YieldSense AI allows users to:

- Register and securely authenticate
- Verify accounts using Gmail OTP
- Manage agricultural farms
- Predict crop yield using Machine Learning
- Estimate agricultural production
- Analyze weather conditions
- Analyze soil fertility and nutrients
- Receive intelligent crop recommendations
- Explore agricultural analytics
- Maintain prediction and recommendation history
- Generate PDF and CSV reports
- Access the system through Web and Android applications

The complete production system is deployed using **Microsoft Azure**, **GitHub Actions**, and **Expo Application Services (EAS)**.

---

# 🌐 Live Deployment

## Web Application

🌐 **YieldSense AI Web App**  
https://jolly-cliff-0c65da800.7.azurestaticapps.net

## Backend API

⚙️ **YieldSense AI API**  
https://yieldsense-api-c2c8e7fcf5hdabe2.centralindia-01.azurewebsites.net

📚 **Swagger API Documentation**  
https://yieldsense-api-c2c8e7fcf5hdabe2.centralindia-01.azurewebsites.net/docs

❤️ **API Health Check**  
https://yieldsense-api-c2c8e7fcf5hdabe2.centralindia-01.azurewebsites.net/health

## 📱 Android Application

YieldSense AI is also available as an installable Android application built using
React Native, Expo, and EAS Build.

### Download Android App

📥 **Download / Install YieldSense AI APK**

https://expo.dev/accounts/kowshuuu/projects/yieldsense-ai/builds/d395c7e5-aeb3-4219-8a02-6a39a948d22b

> Open the link on an Android device and follow the installation instructions.

### Mobile Build

- Platform: Android
- Framework: React Native + Expo
- Expo SDK: 54
- Build Service: Expo EAS Build
- Build Profile: Preview
- Distribution: Internal
- Backend: Azure-hosted YieldSense AI API

---

# 🎯 Project Objectives

The primary objectives of YieldSense AI are:

- Predict crop yield using Machine Learning
- Estimate agricultural production
- Improve agricultural decision-making
- Help farmers choose suitable crops
- Analyze weather conditions affecting crop growth
- Analyze soil nutrients and fertility
- Provide intelligent crop recommendations
- Manage multiple agricultural farms
- Generate downloadable agricultural reports
- Maintain historical predictions and recommendations
- Provide agricultural analytics and visualization
- Deliver responsive Web and Mobile applications
- Deploy the complete system using production cloud infrastructure

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────────┐
                         │        YieldSense AI         │
                         └──────────────┬───────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │      Web Frontend      │              │      Mobile App        │
       │                        │              │                        │
       │ React + Vite           │              │ React Native + Expo    │
       │ Tailwind CSS           │              │ Expo Router            │
       │                        │              │ EAS Build              │
       └────────────┬───────────┘              └────────────┬───────────┘
                    │                                       │
                    │ Azure Static Web Apps                 │ Android Device
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        │ HTTPS / REST API
                                        ▼
                         ┌──────────────────────────────┐
                         │      FastAPI Backend         │
                         │                              │
                         │ Azure App Service            │
                         │ Python 3.11                  │
                         │ JWT + RBAC                   │
                         │ SQLAlchemy + Alembic         │
                         └──────────────┬───────────────┘
                                        │
                       ┌────────────────┼─────────────────┐
                       │                │                 │
                       ▼                ▼                 ▼
             ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
             │ Azure Database │ │ Azure Blob     │ │ Gmail SMTP     │
             │ for PostgreSQL │ │ Storage        │ │                │
             │                │ │                │ │ OTP / Password │
             │ Application DB │ │ ML Model       │ │ Verification   │
             └────────────────┘ └────────────────┘ └────────────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │ Random Forest      │
                           │ Yield Prediction   │
                           │ Pipeline           │
                           └─────────────────────┘
```

---

# ☁️ Cloud Deployment Architecture

```text
                         GitHub Repository
                           YieldSense-AI
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
        GitHub Actions CI/CD           GitHub Actions CI/CD
          Backend Workflow              Frontend Workflow
                  │                             │
                  ▼                             ▼
         Azure App Service              Azure Static Web Apps
          yieldsense-api                   yieldsense-web
                  │                             │
                  └──────────────┬──────────────┘
                                 │
                                 ▼
                         Production System
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
        Azure PostgreSQL                Azure Blob Storage
                                             │
                                             ▼
                               yield_prediction_pipeline.joblib

Mobile Application
        │
        ▼
Expo / EAS Build
        │
        ▼
Signed Android APK
        │
        ▼
Azure App Service API
```

---

# 🧠 Machine Learning Architecture

```text
Historical Crop Yield Dataset
             │
             ▼
      Dataset Auditing
             │
             ▼
        Data Cleaning
             │
             ▼
       Feature Enrichment
        ┌────┴─────┐
        │          │
        ▼          ▼
   Soil Data   Weather Data
        │          │
        └────┬─────┘
             ▼
      Feature Engineering
             │
             ▼
        Preprocessing
             │
      ┌──────┴───────┐
      │              │
      ▼              ▼
Categorical       Numerical
 Encoding         Processing
      │              │
      └──────┬───────┘
             ▼
        Model Training
             │
   ┌─────────┼───────────┬──────────────┐
   ▼         ▼           ▼              ▼
Baseline  Decision    Gradient       Random
 Model      Tree       Boosting       Forest
                                      │
                                      ▼
                              Final Production Model
                                      │
                                      ▼
                         Serialized ML Pipeline
                                      │
                                      ▼
                           Azure Blob Storage
                                      │
                                      ▼
                             FastAPI Prediction
                                      │
                                      ▼
                        Web / Mobile Applications
```

---

# 🤖 Machine Learning Model

Multiple regression models were trained and evaluated during development.

Models evaluated include:

- Baseline Regression Model
- Linear Regression
- Decision Tree Regressor
- Gradient Boosting Regressor
- Random Forest Regressor

## Final Production Model

**Random Forest Regressor**

The final serialized prediction pipeline is:

```text
yield_prediction_pipeline.joblib
```

The production model is stored in:

```text
Azure Blob Storage
└── ml-models
    └── yield_prediction_pipeline.joblib
```

The backend model loader can retrieve the production model from Azure Blob Storage for inference.

---

# 📊 ML Development Results

The final ML development pipeline used approximately:

```text
19,689 historical crop records
30 states
55 crops
6 seasons
1997–2020 historical period
```

Key model evaluation results obtained during development included:

| Model | Test MAE | Test R² |
|---|---:|---:|
| Median Baseline | ~60.26 | — |
| Decision Tree | ~6.43 | ~0.9769 |
| Random Forest | ~4.39 | ~0.990 |
| Gradient Boosting | ~15.28 | ~0.8879 |

The **Random Forest Regressor** provided the strongest overall performance and was selected as the production prediction model.

---

# 📚 Data Sources

YieldSense AI combines multiple agricultural data sources.

## Historical Crop Yield Dataset

Important attributes include:

```text
Crop
Crop_Year
Season
State
Area
Production
Annual_Rainfall
Fertilizer
Pesticide
Yield
```

---

## Soil Reference Dataset

Important attributes include:

```text
State
Nitrogen (N)
Phosphorus (P)
Potassium (K)
pH
```

---

## Weather Reference Dataset

Important attributes include:

```text
State
Year
Average Temperature
Total Rainfall
Average Humidity
```

Weather reference data was prepared using **NASA POWER** data.

---

## Agricultural Analytics Data

Additional agricultural information can be derived from sources such as **FAOSTAT** for analytics and reference purposes.

---

# 🔐 Authentication & Security

YieldSense AI includes a complete authentication and authorization system.

Features include:

- User Registration
- User Login
- Secure Password Hashing
- JWT Access Tokens
- Email Verification
- Gmail OTP Verification
- OTP Expiration
- OTP Resend Cooldown
- OTP Attempt Limits
- Forgot Password
- Password Reset
- Current User API
- Profile Management
- Change Password
- Role-Based Access Control
- Protected API Routes
- Protected Web Routes
- Protected Mobile Navigation
- CORS Configuration
- Environment-Based Secrets

Sensitive credentials are not committed to GitHub.

Production secrets are managed through:

- Azure App Service Environment Variables
- GitHub Actions Secrets
- EAS Environment Variables

---

# 👥 Role-Based Access Control

The platform is designed to support agricultural stakeholders including:

- Farmers
- Agricultural Departments
- Cooperatives
- Agribusiness Users
- Researchers
- Administrators

Access to protected functionality is controlled through backend authorization and frontend route protection.

---

# 🌱 Farm Management

Farm management supports:

- Create Farm
- Edit Farm
- View Farm Details
- Farm Summary
- Farm History
- Search Farms
- Filter Farms
- Pagination
- Soft Delete Farm
- Reactivate Farm

Farm information includes:

```text
Farm Name
State
District
Village
Area (Hectares)
Soil Type
Primary Crop
Irrigation Type
Latitude
Longitude
```

---

# 🌾 Yield Prediction

The prediction system provides:

- ML-Based Yield Prediction
- Input Validation
- Automatic Dataset Feature Resolution
- Weather Feature Integration
- Soil Feature Integration
- Production Estimation
- Yield Classification
- Agricultural Warnings
- Prediction History
- Prediction Details
- Prediction Summary

Prediction results are stored in PostgreSQL for future analysis and reporting.

---

# 🌦️ Weather Analysis

Weather analysis includes:

- Temperature Analysis
- Rainfall Analysis
- Humidity Analysis
- Climate Indicators
- Weather Summary
- State-Level Weather Reference
- Weather Impact on Agriculture

---

# 🧪 Soil Analysis

Soil analysis provides:

- Nitrogen Analysis
- Phosphorus Analysis
- Potassium Analysis
- pH Assessment
- Soil Fertility Analysis
- Soil Health Assessment
- Crop Suitability Information
- Agricultural Recommendations

---

# 🌿 Crop Recommendation Engine

The crop recommendation module provides:

- Crop Recommendation APIs
- Farm-Based Recommendations
- Soil-Aware Recommendations
- Weather-Aware Recommendations
- Yield-Aware Recommendations
- Alternative Crop Suggestions
- Recommendation Explanation
- Recommendation History
- Recommendation Details

---

# 📈 Analytics Dashboard

The analytics module provides:

- Agricultural Summary Cards
- Yield Statistics
- Farm Performance Analytics
- Crop Distribution
- Seasonal Analysis
- Historical Trends
- Prediction Analytics
- Recommendation Analytics
- Charts and Graphs
- Productivity Insights

---

# 📄 Reporting System

YieldSense AI generates professional agricultural reports.

## Prediction Reports

- PDF Prediction Report
- CSV Prediction Export

## Recommendation Reports

- PDF Recommendation Report
- CSV Recommendation Export

Reports are supported on:

- Web
- Android Mobile

The mobile application also supports file sharing through native device capabilities.

---

# 💻 Web Application

The web application is built using:

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- Responsive UI Components

Major web modules include:

- Landing Page
- Registration
- Login
- Email OTP Verification
- Forgot Password
- Reset Password
- Dashboard
- Profile
- Farm Management
- Dataset Management
- Yield Prediction
- Prediction History
- Prediction Details
- Weather Analysis
- Soil Analysis
- Analytics
- Crop Recommendations
- Recommendation History
- Recommendation Details
- PDF Reports
- CSV Reports

Production hosting:

```text
Azure Static Web Apps
```

---

# 📱 Mobile Application

The mobile application is built using:

- React Native
- Expo SDK 54
- Expo Router
- JavaScript
- Native File Sharing
- EAS Build

Major mobile modules include:

- Authentication
- Email Verification
- Dashboard
- Profile
- Farm Management
- Dataset Viewing
- Yield Prediction
- Prediction History
- Prediction Details
- Weather Analysis
- Soil Analysis
- Analytics
- Crop Recommendation
- Recommendation History
- PDF Sharing
- CSV Sharing
- Pull-to-Refresh
- Pagination

The Android application is distributed as a signed APK using **Expo Application Services (EAS)**.

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI |
| Backend Language | Python 3.11 |
| Web | React + Vite |
| Mobile | React Native + Expo |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Authentication | JWT |
| Password Security | Passlib / bcrypt |
| Email | Gmail SMTP |
| Machine Learning | scikit-learn |
| Data Processing | Pandas / NumPy |
| Model Serialization | Joblib |
| Reporting | ReportLab / CSV |
| Backend Hosting | Azure App Service |
| Web Hosting | Azure Static Web Apps |
| Production Database | Azure Database for PostgreSQL |
| Model Storage | Azure Blob Storage |
| Mobile Build | Expo EAS |
| CI/CD | GitHub Actions |
| Version Control | Git + GitHub |

---

# 📂 Project Folder Structure

```text
YieldSense-AI/
│
├── .github/
│   └── workflows/
│       ├── main_yieldsense-api.yml
│       └── azure-static-web-apps-*.yml
│
├── backend/
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── analytics.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── crop_recommendation.py
│   │   │   │   ├── datasets.py
│   │   │   │   ├── farms.py
│   │   │   │   ├── predictions.py
│   │   │   │   ├── reports.py
│   │   │   │   ├── soil_analysis.py
│   │   │   │   └── weather_analysis.py
│   │   │   │
│   │   │   └── deps.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── logging_config.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── database.py
│   │   │
│   │   ├── middleware/
│   │   │   └── request_logging.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── ml/
│   │   ├── artifacts/
│   │   ├── scripts/
│   │   │   ├── audit_datasets.py
│   │   │   ├── build_preprocessing_pipeline.py
│   │   │   ├── feature_importance_analysis.py
│   │   │   ├── final_model_comparison.py
│   │   │   ├── finalize_production_model.py
│   │   │   ├── model_explainability_report.py
│   │   │   ├── prepare_datasets.py
│   │   │   ├── time_based_validation.py
│   │   │   ├── train_baseline_models.py
│   │   │   ├── train_decision_tree.py
│   │   │   ├── train_gradient_boosting.py
│   │   │   └── train_random_forest.py
│   │   │
│   │   └── model_loader.py
│   │
│   ├── tests/
│   ├── logs/
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
│
├── web/
│   │
│   ├── public/
│   │   └── staticwebapp.config.json
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── mobile/
│   │
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── .env
│   ├── app.json
│   ├── eas.json
│   └── package.json
│
├── README.md
└── .gitignore
```

> The exact contents of some feature folders may evolve as the project is maintained. The structure above represents the major production modules and separation of concerns used by YieldSense AI.

---

# 🔄 Application Request Flow

```text
User
 │
 ├──────── Web Browser
 │             │
 │             ▼
 │     Azure Static Web Apps
 │
 └──────── Android App
               │
               ▼
            EAS APK
               │
               │
               ▼
        HTTPS REST Requests
               │
               ▼
        Azure App Service
               │
               ▼
           FastAPI
               │
       ┌───────┼─────────┐
       │       │         │
       ▼       ▼         ▼
 PostgreSQL   ML      Gmail SMTP
             Model
               │
               ▼
        Azure Blob Storage
```

---

# 🔄 Prediction Request Flow

```text
Farmer
  │
  ▼
Select Farm + Crop Information
  │
  ▼
Web / Mobile Prediction Form
  │
  ▼
FastAPI Prediction Endpoint
  │
  ├── Validate User
  ├── Validate Farm
  ├── Resolve Soil Features
  ├── Resolve Weather Features
  └── Prepare ML Features
          │
          ▼
 Random Forest Pipeline
          │
          ▼
   Predicted Yield
          │
          ├── Production Estimate
          ├── Yield Classification
          ├── Warnings
          └── Prediction Metadata
                  │
                  ▼
              PostgreSQL
                  │
                  ▼
        Web / Mobile Result
```

---

# 🔄 Crop Recommendation Flow

```text
Farm Information
       │
       ├── State
       ├── Soil
       ├── Weather
       ├── Primary Crop
       └── Farm Characteristics
               │
               ▼
       Recommendation Engine
               │
               ▼
       Recommended Crops
               │
       ┌───────┴─────────┐
       ▼                 ▼
 Best Recommendation   Alternatives
       │
       ▼
 Explanation + History
       │
       ▼
 Web / Mobile Application
```

---

# 🚀 CI/CD Pipeline

YieldSense AI uses separate GitHub Actions workflows for backend and frontend deployment.

## Backend CI/CD

```text
Push to main
     │
     ▼
GitHub Actions
     │
     ├── Checkout Repository
     ├── Python 3.11
     ├── Install Backend Dependencies
     ├── Package backend/
     │
     ▼
Azure Authentication
     │
     ▼
Azure App Service
     │
     ▼
yieldsense-api
```

Backend workflow:

```text
.github/workflows/main_yieldsense-api.yml
```

---

## Frontend CI/CD

```text
Push to main
     │
     ▼
GitHub Actions
     │
     ├── Checkout
     ├── Build React/Vite Application
     ├── Inject Production Environment
     └── Generate dist/
             │
             ▼
     Azure Static Web Apps
             │
             ▼
        yieldsense-web
```

The frontend deployment configuration uses:

```yaml
app_location: "/web"
api_location: ""
output_location: "dist"
```

---

# 📱 Mobile Build Pipeline

```text
React Native / Expo Source
           │
           ▼
     EAS Preview Build
           │
           ├── Production API Environment
           ├── Android Keystore
           └── Application Bundle
                    │
                    ▼
              Signed APK
                    │
                    ▼
             Android Device
                    │
                    ▼
           Azure Backend API
```

Preview builds use the `preview` profile in:

```text
mobile/eas.json
```

Example:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

# ⚙️ Environment Configuration

## Backend

Create:

```text
backend/.env
```

Required configuration includes variables such as:

```env
DATABASE_URL=<postgresql-connection-string>

SECRET_KEY=<jwt-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=<minutes>

LOG_LEVEL=INFO
LOG_FILE=logs/app.log

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<email>
SMTP_PASSWORD=<app-password>
SMTP_FROM_EMAIL=<email>
SMTP_FROM_NAME=YieldSense AI
SMTP_USE_TLS=true

OTP_EXPIRY_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5

AZURE_STORAGE_CONNECTION_STRING=<azure-storage-connection-string>
AZURE_STORAGE_CONTAINER_NAME=ml-models
AZURE_ML_MODEL_BLOB_NAME=yield_prediction_pipeline.joblib
```

Production values are configured through **Azure App Service Environment Variables**.

Never commit production secrets to GitHub.

---

## Web

Local development uses:

```text
web/.env
```

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_BACKEND_URL=http://127.0.0.1:8000/api
```

Production builds use GitHub Actions secrets such as:

```text
VITE_API_BASE_URL
VITE_BACKEND_URL
```

The production backend is hosted on Azure App Service.

---

## Mobile

Local development:

```text
mobile/.env
```

Example production API configuration:

```env
EXPO_PUBLIC_API_BASE_URL=https://yieldsense-api-c2c8e7fcf5hdabe2.centralindia-01.azurewebsites.net/api
```

For EAS cloud builds, the variable is configured in the EAS build environment:

```text
EXPO_PUBLIC_API_BASE_URL
```

Do not depend on committed `.env` files for production credentials/configuration.

---

# 🖥️ Local Development Setup

## 1. Clone Repository

```bash
git clone https://github.com/kalavalashivaharikowshik/YieldSense-AI.git
cd YieldSense-AI
```

---

# 🐍 Backend Setup

```bash
cd backend
```

Create virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure:

```text
backend/.env
```

Run migrations:

```bash
python -m alembic upgrade head
```

Start backend:

```bash
uvicorn app.main:app --reload
```

Local API:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# 🌐 Web Setup

```bash
cd web
npm install
```

Configure:

```text
web/.env
```

Then run:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

The Vite production output is:

```text
web/dist/
```

---

# 📱 Mobile Setup

```bash
cd mobile
npm install
```

Configure:

```text
mobile/.env
```

Run Expo:

```bash
npx expo start -c
```

Check project health:

```bash
npx expo-doctor
```

Production-compatible Android preview build:

```bash
npx eas-cli@latest build --platform android --profile preview
```

---

# 🗄️ Database Migrations

YieldSense AI uses **Alembic** for database schema management.

Apply all migrations:

```bash
cd backend
python -m alembic upgrade head
```

Check current migration:

```bash
python -m alembic current
```

Check whether model changes require another migration:

```bash
python -m alembic check
```

The production Azure PostgreSQL database is maintained through the same migration history.

---

# ☁️ Azure Infrastructure

The production application uses the following cloud components.

| Component | Service |
|---|---|
| Backend API | Azure App Service |
| Web Frontend | Azure Static Web Apps |
| Database | Azure Database for PostgreSQL |
| ML Artifact Storage | Azure Blob Storage |
| Backend CI/CD | GitHub Actions |
| Frontend CI/CD | GitHub Actions |
| Mobile Distribution | Expo EAS |

---

# 🔍 Production Verification

The production deployment was verified through:

### Backend

```text
GET /health → 200 OK
```

### Authentication

```text
Email OTP verification → Success
Login → JWT access token generated
```

### Web

```text
Azure Static Web App → Loaded successfully
Frontend → Azure Backend → Working
Authentication → Working
```

### Mobile

```text
Signed EAS APK → Installed successfully
Login → Working
Dashboard → Working
Prediction → Working
Recommendation → Working
```

---

# 🧪 Quality & Validation

Development and deployment validation included:

- API testing
- Authentication testing
- OTP verification testing
- Database connectivity testing
- Alembic migration verification
- Dataset validation
- ML model evaluation
- Local Vite production builds
- Expo Doctor checks
- Azure health checks
- GitHub Actions deployment validation
- Production Web testing
- Android APK testing

---

# 📅 Milestone Progress

## ✅ Weeks 1–2 — Milestone 1

### Project Foundation

- Project Architecture
- Backend Setup
- Web Setup
- Mobile Setup
- PostgreSQL Integration
- API Configuration
- Environment Configuration

### Authentication

- Registration
- Login
- JWT
- Gmail OTP
- Forgot Password
- Reset Password
- Profile
- Change Password
- RBAC

### Dataset Management

- Historical Crop Yield Dataset
- Soil Dataset
- Weather Dataset
- Import APIs
- Validation
- Summary APIs
- Search
- Filtering
- Pagination

### Web

- Authentication Pages
- Dashboard
- Profile
- Dataset Management
- Protected Routes
- Responsive UI

### Mobile

- Authentication
- Dashboard
- Profile
- Dataset Viewing
- Pagination
- Pull-to-Refresh
- Protected Navigation

---

## ✅ Weeks 3–4 — Milestone 2

### Farm Management

- Create
- Edit
- Details
- Summary
- History
- Soft Delete
- Reactivation
- Search
- Filtering
- Pagination

### Machine Learning

- Dataset Auditing
- Cleaning
- Feature Engineering
- Preprocessing
- EDA
- Outlier Analysis
- Model Training
- Model Evaluation
- Model Serialization

### Models

- Baseline
- Linear Regression
- Decision Tree
- Gradient Boosting
- Random Forest

### Prediction

- Prediction API
- Input Validation
- Dataset Feature Resolution
- Prediction History
- Prediction Details
- Production Estimation
- Warnings

### Web Prediction

- Form
- Loader/Animation
- Result
- History
- Details
- Summary

### Mobile Prediction

- Prediction
- Loader
- History
- Details
- Pull-to-Refresh
- Pagination

---

## ✅ Weeks 5–6 — Milestone 3

### Weather

- Weather Dashboard
- Rainfall Analysis
- Temperature Analysis
- Climate Indicators
- Summary Cards

### Soil

- Soil Health
- NPK Analysis
- Fertility Analysis
- Suitability Recommendations

### Analytics

- Agricultural Dashboard
- Summary Cards
- Charts
- Seasonal Analysis
- Yield Statistics
- Farm Analytics

### Crop Recommendation

- Recommendation Engine
- APIs
- History
- Details
- Alternative Crops
- Recommendation Explanation

### Reporting

- Prediction PDF
- Prediction CSV
- Recommendation PDF
- Recommendation CSV
- Web Downloads
- Mobile Sharing

### Production Improvements

- Secure Gmail OTP
- Password Reset
- Alembic Migrations
- Request Logging
- Error Logging
- Confirmation Dialogs

---

## ✅ Final Cloud Deployment

### Azure Backend

- Azure App Service created
- Python 3.11 runtime
- Production environment variables
- Azure PostgreSQL connection
- Alembic migrations
- Azure Blob model loading
- GitHub Actions CI/CD
- Production health endpoint verified

### Azure Web

- Azure Static Web Apps
- React/Vite production build
- GitHub Actions CI/CD
- Production API environment
- CORS configuration
- Authentication verified

### Android Mobile

- Production Azure API configuration
- EAS environment configuration
- Android signing credentials
- Signed APK build
- Physical-device installation
- Login verified
- Dashboard verified
- Prediction verified
- Recommendation verified

---

# 🔒 Security Practices

The project follows several production security practices:

- Environment variables for secrets
- `.env` excluded from version control
- JWT-based authentication
- Password hashing
- OTP expiration
- OTP attempt limits
- OTP resend cooldown
- Role-based authorization
- CORS restrictions
- Azure-managed application configuration
- GitHub Actions secrets
- EAS environment variables
- Signed Android builds

---

# 📝 Logging & Monitoring

Backend logging includes:

- Request ID
- HTTP method
- Request path
- Response status
- Processing duration
- Application errors

Production logs can be monitored through Azure App Service logging facilities.

---

# 🌟 Key Features

- 🌾 AI Crop Yield Prediction
- 🚜 Farm Management
- 🌦️ Weather Analysis
- 🧪 Soil Health Analysis
- 🌿 Crop Recommendation
- 📊 Agricultural Analytics
- 📈 Prediction History
- 📋 Recommendation History
- 📄 PDF Reports
- 📑 CSV Exports
- 🔐 JWT Authentication
- ✉️ Gmail OTP Verification
- 🔑 Password Recovery
- 👥 Role-Based Access Control
- 💻 Responsive Web Application
- 📱 Android Mobile Application
- ☁️ Azure Cloud Deployment
- 🤖 Azure-Hosted ML Artifact
- 🔄 GitHub Actions CI/CD

---

# 🏁 Final Project Status

```text
Project Foundation                    ✅ Complete
Authentication                       ✅ Complete
Gmail OTP Verification               ✅ Complete
Role-Based Access Control            ✅ Complete
Dataset Management                   ✅ Complete
Farm Management                      ✅ Complete
Machine Learning Pipeline            ✅ Complete
Random Forest Production Model       ✅ Complete
Yield Prediction                     ✅ Complete
Weather Analysis                     ✅ Complete
Soil Analysis                        ✅ Complete
Crop Recommendation                  ✅ Complete
Analytics Dashboard                  ✅ Complete
PDF / CSV Reporting                  ✅ Complete
Web Application                      ✅ Complete
Mobile Application                   ✅ Complete
Azure PostgreSQL                     ✅ Deployed
Azure Blob Storage                   ✅ Configured
Azure App Service Backend            ✅ Deployed
Azure Static Web App                 ✅ Deployed
Backend GitHub Actions CI/CD         ✅ Working
Frontend GitHub Actions CI/CD        ✅ Working
Android EAS Build                    ✅ Working
Production Web Integration           ✅ Verified
Production Mobile Integration        ✅ Verified
```

---

# 🚀 Deployment Summary

The final production architecture is:

```text
React/Vite Web
      │
      └──── Azure Static Web Apps
                    │
                    │
                    ▼
React Native Mobile ───────► FastAPI
     EAS APK              Azure App Service
                                │
                     ┌──────────┴──────────┐
                     │                     │
                     ▼                     ▼
             Azure PostgreSQL       Azure Blob Storage
                                          │
                                          ▼
                              Random Forest ML Model
```

---

# 🔮 Future Enhancements

Potential future improvements include:

- Real-time weather API integration
- Satellite imagery analysis
- Crop disease detection
- IoT sensor integration
- GPS-based automatic farm mapping
- Advanced ML explainability
- Model monitoring and drift detection
- Automated model retraining
- Push notifications
- Offline mobile support
- Multi-language farmer interface
- Google Play Store release
- Custom production domain
- Advanced Azure monitoring
- Containerized deployment

---

# 👨‍💻 Development & Version Control

Source code is maintained using Git and GitHub.

Repository:

https://github.com/kalavalashivaharikowshik/YieldSense-AI

Primary production branch:

```text
main
```

All production deployment workflows are integrated with the `main` branch.

---

# 📜 License / Academic Use

YieldSense AI was developed as an educational and internship project.

The project demonstrates practical implementation of:

- Full-Stack Development
- Machine Learning
- REST API Development
- Database Engineering
- Cloud Deployment
- CI/CD
- Web Development
- Mobile Development
- Agricultural Data Analytics

---

# 🙏 Acknowledgements

This project was developed as part of the **Infosys Virtual Internship Program**.

Technologies and platforms used include:

- Infosys
- Microsoft Azure
- FastAPI
- React
- React Native
- Expo
- PostgreSQL
- scikit-learn
- GitHub
- NASA POWER
- FAOSTAT

---

# 🌾 YieldSense AI

### Predict Smarter. Farm Better. Grow More.

**End-to-End AI-Powered Agricultural Intelligence Platform**

**Backend + Web + Mobile + Machine Learning + Azure Cloud + CI/CD**
