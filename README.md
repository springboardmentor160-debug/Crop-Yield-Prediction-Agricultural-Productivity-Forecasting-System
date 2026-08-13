# 🌾 YieldSense AI

## AI-Powered Crop Yield Prediction & Agricultural Productivity Forecasting System

YieldSense AI is a full-stack Machine Learning application designed to help farmers, researchers, and agricultural organizations estimate crop yield and make better agricultural decisions.

The system combines Machine Learning-based yield prediction with environmental analysis, weather information, crop recommendations, risk assessment, prediction history, and dashboard analytics.

---

# 🎯 Problem Statement

Farmers often face difficulty in accurately estimating crop yield because agricultural productivity depends on multiple factors such as crop type, rainfall, temperature, soil pH, and pesticide usage.

Traditional estimation methods may require significant manual effort and may not provide timely insights.

YieldSense AI addresses this problem by combining Machine Learning, environmental data, authentication, analytics, recommendations, and risk assessment into a single web-based platform.

The system provides an estimated crop yield together with agricultural recommendations and risk indicators to support better farming decisions.

---

# 🚀 Features

## 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Protected prediction APIs

## 🤖 Machine Learning

- Crop yield prediction
- Agricultural productivity forecasting
- Trained Machine Learning model
- Historical prediction storage
- Model-based yield estimation

## 🌦 Environmental Analysis

- Rainfall analysis
- Temperature analysis
- Soil pH analysis
- Pesticide usage analysis
- Live weather API integration

## 🧠 AI Recommendation & Risk Analysis

- Crop recommendation
- Farmer advisory system
- Prediction confidence score
- Overall agricultural risk assessment
- Rainfall risk analysis
- Temperature risk analysis
- Soil pH risk analysis
- Agricultural recommendations

## 📊 Dashboard & Analytics

- Prediction history
- Total prediction statistics
- Average yield analysis
- Best crop information
- Current risk level
- Dashboard statistics
- Historical prediction information

## 📄 Reports

- Prediction history
- CSV report export
- PostgreSQL prediction storage

---

# 🔄 How YieldSense AI Works

The system follows the following workflow:

1. User registers an account.
2. User logs in and receives a JWT access token.
3. The authenticated user provides agricultural and environmental information.
4. FastAPI validates the submitted data.
5. The Machine Learning model processes the input.
6. The system generates an estimated crop yield.
7. Weather and environmental information is analyzed.
8. The recommendation engine generates crop recommendations and farmer advice.
9. The risk assessment engine evaluates environmental conditions.
10. The prediction is stored in PostgreSQL.
11. Users can view their prediction history.
12. Dashboard statistics are generated from stored predictions.
13. Prediction data can be exported as a CSV report.

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Python
- FastAPI
- Uvicorn

## Database

- PostgreSQL
- SQLAlchemy

## Machine Learning

- Scikit-Learn
- Pandas
- NumPy
- Joblib

## Authentication

- JWT
- Passlib
- bcrypt

## External Services

- Weather API integration

---

# 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Home / API status |
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user and generate JWT |
| POST | `/api/v1/predict-yield` | Generate crop yield prediction |
| GET | `/api/v1/predictions` | Retrieve prediction history |
| GET | `/api/v1/dashboard-stats` | Retrieve dashboard statistics |
| GET | `/api/v1/reports/export-csv` | Export prediction history as CSV |

Interactive API documentation is available through FastAPI Swagger UI:

```text
http://127.0.0.1:8000/docs
```

---

# 🧠 Machine Learning Workflow

YieldSense AI uses a Machine Learning pipeline for agricultural productivity forecasting.

### Workflow

1. Data Collection
2. Data Cleaning
3. Data Preprocessing
4. Feature Engineering
5. Model Training
6. Model Evaluation
7. Model Serialization
8. Yield Prediction
9. Risk Analysis
10. Recommendation Generation

The trained model is loaded by the FastAPI backend and used to generate yield predictions from agricultural and environmental inputs.

---

# 📌 Example Prediction

### Example Input

```json
{
  "area": "Tokyo",
  "crop_type": "Rice",
  "year": 2020,
  "average_rain_fall_mm_per_year": 500,
  "pesticides_tonnes": 70,
  "avg_temp": 25,
  "ph": 6.5
}
```

### System Output

The prediction service returns information including:

- Estimated crop yield
- Crop-specific information
- Weather information
- Recommended crop
- Recommendation confidence
- Farmer advice
- Overall risk level
- Risk alerts
- Agricultural recommendations

Example response structure:

```json
{
  "success": true,
  "estimated_yield_kg_per_ha": 99202.91,
  "crop_message": "Rice requires abundant water and high rainfall.",
  "ai_recommendation": {
    "recommended_crop": "Rice",
    "confidence": 96
  },
  "analytics": {
    "overall_risk": "Low Risk"
  }
}
```

> Note: Prediction values depend on the input data and trained model.

---

# 📂 Project Structure

```text
Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System/
│
├── backend/
│   ├── __init__.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── weather_api.py
│   ├── train_model.py
│   └── main.py
│
├── models/
│   ├── area_encoder.pkl
│   ├── item_encoder.pkl
│   └── crop_yield_model.pkl
│
├── frontend/
│   ├── dashboard.html
│   ├── history.html
│   ├── login.html
│   ├── register.html
│   ├── app.js
│   ├── auth.js
│   └── style.css
│
├── notebooks/
├── visualizations/
│
├── .gitignore
├── README.md
└── LICENSE
```

> The project structure may vary slightly depending on the final repository contents.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System
```

---

## 2. Create a Virtual Environment

On Windows:

```bash
python -m venv .venv
```

Activate the environment:

```bash
.venv\Scripts\activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create the required `.env` configuration according to the backend configuration.

Do not commit passwords, API keys, database credentials, or other secrets to GitHub.

---

## 5. Start the FastAPI Backend

Run:

```bash
uvicorn backend.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

---

## 6. Open the API Documentation

FastAPI provides interactive Swagger documentation at:

```text
http://127.0.0.1:8000/docs
```

From Swagger UI, authenticated endpoints can be tested using the JWT authorization system.

---

# 🔐 Authentication Flow

YieldSense AI uses JWT-based authentication.

### Registration

A user first creates an account through:

```text
POST /register
```

### Login

The user then authenticates through:

```text
POST /login
```

The backend generates a JWT access token.

### Authorization

The token is supplied as a Bearer token when accessing protected endpoints.

Example:

```text
Authorization: Bearer <access_token>
```

Protected functionality includes the crop yield prediction service.

---

# 📊 Dashboard Analytics

The dashboard statistics API provides information such as:

- Total predictions
- Average yield
- Best-performing crop
- Current risk level

Endpoint:

```text
GET /api/v1/dashboard-stats
```

---

# 📜 Prediction History

Authenticated users can retrieve previously stored predictions through:

```text
GET /api/v1/predictions
```

Prediction records include information such as:

- User
- Crop
- Area
- Year
- Environmental inputs
- Predicted yield
- Risk level
- Recommendation
- Prediction date

---

# 📥 CSV Report Export

Prediction history can be exported through:

```text
GET /api/v1/reports/export-csv
```

The system generates a CSV report containing stored prediction information.

---

# 📸 Screenshots

Screenshots of the application will be added here as part of the final project documentation.

### Login

_Add login page screenshot here._

### Dashboard

_Add dashboard screenshot here._

### Crop Yield Prediction

_Add prediction result screenshot here._

### API Documentation

_Add Swagger UI screenshot here._

---

# 📈 Project Milestones

## ✅ Milestone 1 — Backend Foundation

- Project setup
- Database design
- User authentication
- Password hashing
- JWT authentication
- FastAPI backend

## ✅ Milestone 2 — Machine Learning & Prediction

- Machine Learning model
- Crop yield prediction
- Data preprocessing
- Weather integration
- Prediction storage
- Prediction history

## ✅ Milestone 3 — Analytics & Recommendations

- Dashboard
- AI recommendation engine
- Farmer advisory
- Risk analysis
- CSV reporting
- Live environmental analysis
- PostgreSQL prediction history
- Dashboard statistics

## 🚀 Final Milestone — Documentation & Demo

- MIT License
- Final README
- Repository cleanup
- Final application testing
- Final demonstration
- Q&A preparation

---

# 📦 Large Machine Learning Model File

The trained Machine Learning model is a binary model file used by the prediction service.

Large Machine Learning model files should not be unnecessarily committed to the GitHub repository.

The model can be maintained locally and regenerated through the project's training pipeline when required.

Model-related files should be excluded through `.gitignore` when they are not intended for version control.

---

# 🔒 Security

The project uses:

- JWT authentication
- Password hashing
- Protected API endpoints
- Environment variables for sensitive configuration

### Security precautions

Do not commit:

- Passwords
- JWT secrets
- Database credentials
- Weather API keys
- `.env` files
- Personal information

---

# 👨‍💻 Developer

**Varnit Sharma**

AI | Machine Learning | Full Stack Developer

---

# 📜 License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for the complete license text.

---

# 🌱 Future Improvements

Potential future improvements include:

- More advanced crop recommendation models
- Improved weather forecasting integration
- More agricultural datasets
- Model performance optimization
- Cloud deployment
- Mobile application support
- Advanced visualization and analytics
- Automated model retraining
- More detailed farm-level recommendations
