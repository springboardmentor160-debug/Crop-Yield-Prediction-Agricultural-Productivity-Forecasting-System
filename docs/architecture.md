# YieldSense AI Architecture

## 1. System Overview

YieldSense AI is a full-stack AI-powered agricultural productivity forecasting system.

The system allows farmers to:

- Register and log in securely
- Enter agricultural and environmental parameters
- Obtain crop yield predictions
- Receive AI-based crop recommendations
- View weather information
- Analyze agricultural risks
- View prediction history
- View dashboard statistics
- Export prediction data as CSV

The application follows a layered architecture consisting of the frontend, backend API, database, machine learning layer, external weather service, and reporting/analytics components.

---

## 2. System Architecture

```text
                         ┌──────────────────────┐
                         │       Farmer         │
                         │   Web Application    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Frontend        │
                         │ HTML / CSS / JS      │
                         │ Dashboard / Login    │
                         │ Register / History   │
                         └──────────┬───────────┘
                                    │ HTTP Requests
                                    ▼
                         ┌──────────────────────┐
                         │      FastAPI         │
                         │      Backend         │
                         ├──────────────────────┤
                         │ Authentication       │
                         │ Prediction APIs      │
                         │ Dashboard APIs       │
                         │ History APIs         │
                         │ Report Export        │
                         └───────┬──────┬───────┘
                                 │      │
                    ┌────────────┘      └─────────────┐
                    ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │   PostgreSQL     │              │  Weather API     │
          │    Database      │              │  Live Weather    │
          └──────────────────┘              └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ Machine Learning │
          │     Layer        │
          ├──────────────────┤
          │ Trained Model    │
          │ Preprocessing    │
          │ Yield Prediction │
          │ Recommendation   │
          │ Risk Analysis    │
          └──────────────────┘
```

---

## 3. User Layer

The primary user of the system is the farmer.

### Farmer

The farmer can:

- Create an account
- Log in using registered credentials
- Authenticate using JWT
- Submit crop and environmental information
- Generate crop yield predictions
- View AI recommendations
- View agricultural risk information
- View previous predictions
- Access dashboard statistics
- Export prediction reports

---

## 4. Frontend Layer

The frontend is implemented using standard web technologies.

### Technologies

- HTML5
- CSS3
- JavaScript
- Chart.js

### Main Frontend Components

- Login page
- Registration page
- Dashboard
- Prediction interface
- Prediction history
- Analytics visualizations
- Report/export interface

The frontend communicates with the FastAPI backend through HTTP requests and uses the authentication token for protected API operations.

---

## 5. Backend Layer

The backend is implemented using Python and FastAPI.

### Main Responsibilities

- Handle HTTP requests
- Validate user input
- Authenticate users
- Verify JWT tokens
- Process prediction requests
- Communicate with the machine learning model
- Retrieve live weather information
- Store prediction results
- Retrieve prediction history
- Calculate dashboard statistics
- Export prediction data

### Main API Endpoints

```text
GET  /
POST /register
POST /login

POST /api/v1/predict-yield
GET  /api/v1/predictions
GET  /api/v1/dashboard-stats
GET  /api/v1/reports/export-csv
```

---

## 6. Authentication Layer

The system uses JWT-based authentication.

### Authentication Flow

```text
User
  │
  ▼
Register
  │
  ▼
Password Hashing
  │
  ▼
Database
  │
  ▼
Login
  │
  ▼
Credential Verification
  │
  ▼
JWT Token
  │
  ▼
Protected API Requests
```

Passwords are securely hashed before being stored.

Protected endpoints verify the JWT token before processing requests.

---

## 7. Database Layer

The system uses PostgreSQL as the primary database.

SQLAlchemy is used as the database ORM.

### Database Responsibilities

The database stores:

- User information
- Authentication-related data
- Prediction records
- Crop information
- Environmental parameters
- Estimated yield
- Risk information
- Recommendations
- Prediction timestamps

The database provides persistent storage for prediction history and dashboard analytics.

---

## 8. Machine Learning Layer

The machine learning component is responsible for crop yield prediction.

### ML Workflow

```text
Agricultural Dataset
        │
        ▼
Data Preprocessing
        │
        ▼
Feature Engineering
        │
        ▼
Model Training
        │
        ▼
Trained ML Model
        │
        ▼
Yield Prediction
```

The project uses:

- Scikit-learn
- Pandas
- NumPy
- Joblib

The trained model is loaded by the backend when prediction requests are processed.

---

## 9. Weather Integration Layer

YieldSense AI integrates live weather information into the prediction process.

The backend retrieves weather information for the requested location.

Weather information can include:

- Temperature
- Rainfall
- Humidity
- Weather condition
- Wind speed

The retrieved weather information can be used to improve environmental analysis and provide more relevant agricultural recommendations.

---

## 10. AI Recommendation and Risk Analysis

After processing the prediction input, the system generates additional agricultural insights.

### AI Recommendation

The recommendation component provides:

- Recommended crop
- Confidence score
- Reasoning factors
- Farmer advice

### Risk Analysis

The system evaluates important agricultural conditions such as:

- Rainfall
- Temperature
- Soil pH

The system produces an overall risk level and corresponding alerts.

---

## 11. Dashboard and Analytics Layer

The dashboard provides a centralized view of agricultural prediction results.

### Dashboard Information

- Total predictions
- Average yield
- Best-performing crop
- Current risk level
- Prediction history
- Yield analytics
- AI recommendations

Chart.js is used for interactive visualizations.

---

## 12. Reporting Layer

The system supports prediction data export.

### CSV Export

Prediction records can be exported through:

```text
GET /api/v1/reports/export-csv
```

The exported report can be used for:

- Agricultural analysis
- Research
- Record keeping
- Further data processing

---

## 13. Complete Prediction Flow

```text
Farmer
  │
  ▼
Frontend
  │
  ▼
JWT Authentication
  │
  ▼
FastAPI Prediction API
  │
  ├──────────────► Weather API
  │
  ▼
Input Validation
  │
  ▼
Data Preprocessing
  │
  ▼
Machine Learning Model
  │
  ▼
Yield Prediction
  │
  ├──────────────► AI Recommendation
  │
  ├──────────────► Risk Analysis
  │
  ▼
PostgreSQL
  │
  ▼
Dashboard / History / Reports
```

---

## 14. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Visualization | Chart.js |
| Backend | Python, FastAPI |
| Server | Uvicorn |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Machine Learning | Scikit-learn |
| Data Processing | Pandas, NumPy |
| Model Serialization | Joblib |
| Authentication | JWT |
| Password Security | Passlib / bcrypt |
| Weather | Weather API |

---

## 15. Deployment Architecture

The application can be deployed as a full-stack web application.

The frontend communicates with the FastAPI backend through HTTP APIs.

The backend communicates with:

- PostgreSQL database
- Machine learning model
- External weather API

The architecture can later be extended for cloud deployment and mobile application support.