# 🌾 YieldSense AI

# AI-Powered Crop Yield Prediction & Agricultural Productivity Forecasting System

YieldSense AI is an intelligent agricultural platform that uses **Artificial Intelligence, Machine Learning, weather data, soil characteristics, and historical agricultural data** to predict crop yield and provide actionable agricultural insights.

The platform is designed to help **farmers, agricultural analysts, agribusiness organizations, and administrators** make data-driven decisions related to crop productivity, farm management, environmental conditions, agricultural risks, and yield forecasting.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Machine Learning](#-machine-learning)
- [Model Performance](#-model-performance)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Authentication and Security](#-authentication-and-security)
- [Permission System](#-permission-system)
- [API Architecture](#-api-architecture)
- [API Endpoints](#-api-endpoints)
- [Database](#-database)
- [Environment Configuration](#-environment-configuration)
- [Backend Installation](#-backend-installation)
- [Frontend Installation](#-frontend-installation)
- [Running the Application](#-running-the-application)
- [Docker](#-docker)
- [Testing](#-testing)
- [Development Milestones](#-development-milestones)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Project Outcome](#-project-outcome)
- [Screenshots](#-screenshots)
- [Project Demonstration](#-project-demonstration)
- [Developer](#-developer)
- [Acknowledgement](#-acknowledgement)
- [License](#-license)

---

# 🌱 About the Project

Agriculture is highly dependent on environmental conditions, soil characteristics, crop selection, and historical farming patterns.

Traditional crop yield estimation often depends on manual calculations, historical experience, and assumptions. These methods may not adequately consider the combination of multiple agricultural factors.

**YieldSense AI** addresses this challenge by combining machine learning and agricultural analytics into a single platform.

The system analyzes agricultural information and provides:

- Crop yield predictions
- Weather intelligence
- Soil intelligence
- Agricultural recommendations
- Risk assessment
- Productivity analytics
- Farm comparison
- Reports
- Notifications
- Role-based dashboards

The platform follows a modern full-stack architecture using **Next.js, FastAPI, PostgreSQL, XGBoost, and Docker**.

---

# ❗ Problem Statement

Farmers and agricultural organizations face several challenges:

- Difficulty in accurately estimating crop yield
- Changing weather conditions
- Soil health variations
- Lack of centralized agricultural analytics
- Difficulty identifying potential agricultural risks
- Limited access to data-driven recommendations
- Manual farm productivity analysis
- Lack of centralized monitoring systems

YieldSense AI attempts to solve these problems through an integrated AI-powered agricultural decision-support platform.

---

# 🎯 Project Objectives

The main objectives of YieldSense AI are:

1. Predict crop yield using machine learning.
2. Analyze historical agricultural data.
3. Analyze weather conditions.
4. Analyze soil characteristics.
5. Identify agricultural risks.
6. Provide intelligent recommendations.
7. Analyze farm productivity.
8. Compare multiple farms.
9. Provide role-specific dashboards.
10. Secure APIs using JWT authentication.
11. Implement Role-Based Access Control.
12. Provide centralized administration.
13. Provide agricultural reports and analytics.
14. Build a scalable full-stack architecture.
15. Prepare the application for Docker-based deployment.

---

# 🚀 Key Features

## 🌾 1. Crop Yield Prediction

The system uses a trained machine learning model to estimate crop yield.

Users can provide agricultural parameters and receive a predicted yield value.

Example:

```text
Crop: Wheat

Predicted Yield:
4.67 tons/hectare
```

---

## 🌦️ 2. Weather Intelligence

The platform provides weather-related agricultural insights.

Features include:

- Weather analysis
- Weather impact analysis
- Environmental condition analysis
- Weather-based agricultural insights

---

## 🌱 3. Soil Intelligence

The platform analyzes soil-related information to provide agricultural insights.

Features include:

- Soil analysis
- Soil health information
- Soil impact analysis
- Soil-related recommendations

---

## ⚠️ 4. Agricultural Risk Assessment

The system evaluates agricultural conditions and provides risk information.

Risk levels include:

```text
LOW
MEDIUM
HIGH
```

This helps users identify potential problems and make better agricultural decisions.

---

## 💡 5. Agricultural Recommendations

The platform provides recommendations based on agricultural information such as:

- Crop conditions
- Soil conditions
- Weather conditions
- Predicted yield
- Risk information

---

## 👨‍🌾 6. Farm Management

Farmers can manage their farms through the platform.

Features include:

- Add farm
- View farm
- Update farm
- Delete farm
- Manage crop information
- View farm-related analytics

---

## 📊 7. Agricultural Analytics

The platform provides analytical information including:

- Yield trends
- Crop performance
- Productivity
- Farm comparison
- Weather impact
- Soil health
- Risk distribution
- Recent predictions

---

## 🔔 8. Alerts and Notifications

The system supports agricultural notifications and alerts.

Users can:

- View alerts
- Mark alerts as read
- Delete alerts
- View unread notifications
- View notification history

---

## 📋 9. Reporting

The platform provides reporting functionality for agricultural and administrative information.

Reports can include:

- User statistics
- Farm statistics
- Prediction statistics
- Agricultural analytics
- System-level statistics

---

# 👥 User Roles

YieldSense AI uses three major roles:

```text
Farmer
Analyst
Admin
```

---

# 👨‍🌾 Farmer

The Farmer role is designed for individual agricultural users.

Farmers can:

- Register
- Login
- Manage farms
- Manage crop information
- Perform yield predictions
- View prediction history
- Analyze weather
- Analyze soil
- View recommendations
- View agricultural risks
- View notifications
- View farmer reports

---

# 📊 Analyst

The Analyst role provides access to platform-wide agricultural analytics.

Analysts can access:

- Analyst Dashboard
- Yield Trends
- Crop Performance
- Weather Impact
- Soil Analysis
- Farm Comparison
- Productivity Analytics
- Risk Distribution
- Recent Predictions
- Platform Reports
- Model Metrics

Analysts can analyze platform-level agricultural information without having administrative control over users and system settings.

---

# 🛡️ Admin

The Admin role provides system-wide administrative access.

Admins can:

- Manage users
- View individual users
- Change user roles
- Delete users
- View all farms
- Delete farms
- View predictions
- Delete predictions
- View system health
- View model metrics
- View recent activity
- Generate reports
- Export reports
- Manage system-level functionality

---

# 🤖 Machine Learning

YieldSense AI uses **XGBoost** for crop yield prediction.

The machine learning pipeline includes:

```text
Agricultural Dataset
        ↓
Data Preprocessing
        ↓
Feature Preparation
        ↓
Model Training
        ↓
XGBoost Model
        ↓
Model Evaluation
        ↓
Model Serialization
        ↓
FastAPI Prediction API
        ↓
Next.js Frontend
```

---

# 📊 Training Dataset

The model was trained using:

```text
Training Records: 28,242
```

The dataset contains agricultural information used for crop yield prediction.

The project supports multiple crop types including agricultural crops such as:

- Wheat
- Rice
- Maize
- Soybean
- And other supported crops

---

# 📈 Model Performance

| Metric            |          Result |
| ----------------- | ---------------: |
| Training Records  |           28,242 |
| MAE               |   0.9319 tons/ha |
| RMSE              |   1.5996 tons/ha |
| R² Score          |            96.5% |

### Example Prediction

```text
Input:
Crop = Wheat

Output:
Predicted Yield = 4.67 tons/hectare
```

> The R² score indicates how much variance in the target is explained by the model. It should not be interpreted as classification accuracy.

---

# 🏗️ System Architecture

```text
                         YIELDSENSE AI
                              │
                              ▼
                    ┌───────────────────┐
                    │     Next.js       │
                    │     Frontend      │
                    └─────────┬─────────┘
                              │
                              │ REST API
                              ▼
                    ┌───────────────────┐
                    │      FastAPI      │
                    │      Backend      │
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   ┌────────────┐     ┌──────────────┐    ┌──────────────┐
   │    Auth    │     │      ML      │    │  Analytics   │
   │   & RBAC   │     │  Prediction  │    │   Services   │
   └────────────┘     └──────────────┘    └──────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    PostgreSQL     │
                    │     Database      │
                    └───────────────────┘
```

---

# 🛠️ Technology Stack

## Programming Languages

- Python
- TypeScript
- JavaScript

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- JWT
- REST API

## Machine Learning

- XGBoost
- Scikit-learn
- Pandas
- NumPy
- Joblib

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Database

- PostgreSQL

## DevOps

- Docker
- Docker Compose

## Tools

- Git
- GitHub
- VS Code
- Postman
- Swagger / OpenAPI
- Anaconda

---

# 📂 Project Structure

```text
Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── deps.py
│   │   │   ├── permissions.py
│   │   │   ├── security.py
│   │   │   └── notify.py
│   │   │
│   │   ├── ml/
│   │   │   ├── generate_dataset.py
│   │   │   ├── predictor.py
│   │   │   ├── preprocess.py
│   │   │   └── train_model.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── farms.py
│   │   │   ├── analytics.py
│   │   │   ├── analyst.py
│   │   │   ├── weather.py
│   │   │   ├── soil.py
│   │   │   ├── recommendations.py
│   │   │   ├── risk.py
│   │   │   ├── reports.py
│   │   │   └── admin.py
│   │   │
│   │   ├── services/
│   │   │   └── analytics_service.py
│   │   │
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   │
│   ├── app/
│   │   ├── dashboard/
│   │   ├── farms/
│   │   ├── prediction/
│   │   ├── weather/
│   │   ├── soil/
│   │   ├── analyst/
│   │   ├── admin/
│   │   ├── alerts/
│   │   └── reports/
│   │
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# 🔐 Authentication and Security

YieldSense AI uses JWT-based authentication.

The authentication process is:

```text
User
 ↓
Login
 ↓
Credential Verification
 ↓
JWT Token Generated
 ↓
Frontend Stores Token
 ↓
Authorization Header
 ↓
FastAPI
 ↓
Token Validation
 ↓
Current User
 ↓
Role Verification
 ↓
Protected API
```

JWT tokens contain the authenticated user's information and expiration time.

---

# 🛡️ Permission System

The project includes a centralized permission matrix.

Instead of scattering role checks throughout the backend, permissions can be defined centrally.

Example:

```python
PERMISSIONS = {

    "yield_prediction": {
        "Farmer",
        "Admin"
    },

    "weather_analysis": {
        "Farmer",
        "Analyst",
        "Admin"
    },

    "soil_analysis": {
        "Farmer",
        "Analyst",
        "Admin"
    },

    "manage_users": {
        "Admin"
    },

    "delete_any_farm": {
        "Admin"
    }
}
```

The system also supports farm ownership validation.

For example:

```text
Farmer
   ↓
Can access own farm
   ↓
Cannot access another farmer's farm

Admin
   ↓
Can access all farms
```

---

# 🔌 API Architecture

The backend follows a versioned REST API architecture.

Main API groups:

```text
/api/v1/auth
/api/v1/farms
/api/v1/predictions
/api/v1/weather
/api/v1/soil
/api/v1/analytics
/api/v1/analyst
/api/v1/recommendations
/api/v1/risk
/api/v1/reports
/api/v1/admin
```

---

# 🔑 API Endpoints

## Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

---

## Farmer / Farm APIs

```text
GET    /api/v1/farms
POST   /api/v1/farms
GET    /api/v1/farms/{farm_id}
PUT    /api/v1/farms/{farm_id}
DELETE /api/v1/farms/{farm_id}
```

---

## Prediction APIs

```text
POST /api/v1/predictions/predict
GET  /api/v1/predictions/history
GET  /api/v1/predictions/model/metrics
GET  /api/v1/predictions/crops/available
```

---

## Analyst APIs

```text
GET /api/v1/analyst/dashboard
GET /api/v1/analyst/yield-trends
GET /api/v1/analyst/crop-performance
GET /api/v1/analyst/weather-impact
GET /api/v1/analyst/soil-analysis
GET /api/v1/analyst/farm-comparison
GET /api/v1/analyst/productivity
GET /api/v1/analyst/risk-distribution
GET /api/v1/analyst/recent-predictions
GET /api/v1/analyst/reports
```

---

## Admin APIs

```text
GET    /api/v1/admin/users
GET    /api/v1/admin/users/{user_id}
DELETE /api/v1/admin/users/{user_id}
PUT    /api/v1/admin/users/{user_id}/role

GET    /api/v1/admin/farms
GET    /api/v1/admin/farms/{farm_id}
DELETE /api/v1/admin/farms/{farm_id}

GET    /api/v1/admin/predictions
GET    /api/v1/admin/predictions/{prediction_id}
DELETE /api/v1/admin/predictions/{prediction_id}

GET /api/v1/admin/dashboard
GET /api/v1/admin/stats
GET /api/v1/admin/system
GET /api/v1/admin/model
GET /api/v1/admin/activity
GET /api/v1/admin/reports
```

---

# 🗄️ Database

YieldSense AI is designed to use **PostgreSQL** as the production database.

The backend communicates with PostgreSQL using SQLAlchemy.

The database stores information such as:

- Users
- Farms
- Crops
- Predictions
- Notifications
- Agricultural data
- System-related information

Example database configuration:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/yieldsense
```

---

# ⚙️ Environment Configuration

Create a `.env` file inside the backend directory.

Example:

```env
APP_NAME=YieldSense AI

SECRET_KEY=your-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_HOURS=8

DATABASE_URL=postgresql://username:password@localhost:5432/yieldsense

ALLOWED_ORIGINS=http://localhost:3000

DEBUG=True
```

If weather API integration is enabled:

```env
OPENWEATHER_API_KEY=your-openweather-api-key
```

### ⚠️ Security

Never commit your actual:

- API keys
- Passwords
- JWT secret
- Database credentials
- `.env` file

to GitHub.

Add `.env` to `.gitignore`.

---

# 🐍 Backend Installation

Open a terminal:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the environment on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://localhost:8000
```

---

# 📚 Swagger API Documentation

FastAPI automatically provides interactive API documentation.

Open:

```text
http://localhost:8000/docs
```

Alternative documentation:

```text
http://localhost:8000/redoc
```

Swagger can be used to test APIs directly.

---

# ⚛️ Frontend Installation

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:3000
```

---

# 🏗️ Production Frontend Build

Before deployment, build the Next.js frontend:

```bash
npm run build
```

If the build succeeds:

```text
✓ Compiled successfully
✓ TypeScript validation passed
✓ Production build completed
```

Start production server:

```bash
npm start
```

---

# 🐳 Docker

YieldSense AI supports containerization using Docker.

## Backend Dockerfile

The backend Dockerfile uses Python 3.11:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

# 🐳 Build Backend Image

From the backend directory:

```bash
docker build -t yieldsense-backend .
```

Run:

```bash
docker run -p 8000:8000 yieldsense-backend
```

---

# 🐳 Docker Compose

The recommended architecture is:

```text
┌──────────────────────┐
│      Frontend        │
│      Next.js         │
│      Port 3000       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Backend        │
│       FastAPI        │
│      Port 8000       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
│      Database        │
│      Port 5432       │
└──────────────────────┘
```

Start all services:

```bash
docker compose up --build
```

Stop services:

```bash
docker compose down
```

View running containers:

```bash
docker ps
```

---

# 🧪 Testing

Testing is an important part of the final development stage.

## Authentication Testing

Test:

```text
✓ Registration
✓ Login
✓ Invalid credentials
✓ Missing token
✓ Invalid token
✓ Expired token
✓ Protected routes
```

---

## Farmer Testing

Test:

```text
✓ Farm creation
✓ Farm update
✓ Farm deletion
✓ Farm ownership
✓ Crop management
✓ Yield prediction
✓ Prediction history
✓ Weather analysis
✓ Soil analysis
✓ Recommendations
✓ Risk assessment
✓ Notifications
```

---

## Analyst Testing

Test:

```text
✓ Analyst dashboard
✓ Yield trends
✓ Crop performance
✓ Weather impact
✓ Soil analysis
✓ Farm comparison
✓ Productivity
✓ Risk distribution
✓ Recent predictions
✓ Reports
✓ Model metrics
```

---

## Admin Testing

Test:

```text
✓ User management
✓ User deletion
✓ Role management
✓ Farm management
✓ Prediction management
✓ System health
✓ Model metrics
✓ Activity
✓ Reports
✓ Export functionality
```

---

# 🔒 Role Testing

The system should verify that users cannot access unauthorized resources.

Example:

```text
Farmer → Farmer APIs        ✓
Farmer → Analyst APIs       ✗
Farmer → Admin APIs         ✗

Analyst → Analyst APIs      ✓
Analyst → Farmer APIs       Limited
Analyst → Admin APIs        ✗

Admin → Admin APIs          ✓
Admin → Analyst APIs        ✓
Admin → System APIs         ✓
```

---

# 🧭 Development Milestones

## 📍 Milestone 1 — Foundation

### Week 1–2

- Project architecture
- Database design
- User authentication
- Registration and login
- Farm management
- Initial dashboard
- Role structure
- PostgreSQL configuration

---

# 🤖 Milestone 2 — AI Prediction

### Week 3–4

- Agricultural dataset
- Data preprocessing
- Model training
- XGBoost model
- Model evaluation
- Prediction API
- Prediction history
- Weather analysis
- Soil analysis
- Prediction dashboard

---

# 📊 Milestone 3 — Agricultural Intelligence

### Week 5–6

- Enterprise analytics dashboard
- Productivity analytics
- Recommendation engine
- Risk assessment
- Farm comparison
- Reporting system
- Visualization components
- AI advisor
- Notification center
- Dashboard optimization
- Analyst dashboard
- Admin dashboard

---

# 🐳 Week 7 — Docker & Testing

Tasks:

- Create backend Dockerfile
- Create frontend Dockerfile
- Configure Docker Compose
- Configure PostgreSQL container
- Run backend container
- Run frontend container
- Test API endpoints
- Test authentication
- Test Farmer role
- Test Analyst role
- Test Admin role
- Fix frontend/backend errors
- Fix TypeScript errors
- Validate production build

---

# ☁️ Week 8 — Deployment & Finalization

Tasks:

- Production configuration
- Environment variables
- PostgreSQL production configuration
- Frontend production build
- Backend production configuration
- Deployment preparation
- Final API testing
- Security checks
- README documentation
- GitHub finalization
- Final demonstration
- Project presentation

---

# ☁️ Deployment Architecture

The production architecture can be deployed as:

```text
                    Internet
                       │
                       ▼
             ┌──────────────────┐
             │     Frontend     │
             │     Next.js      │
             └────────┬─────────┘
                      │
                   HTTPS
                      │
                      ▼
             ┌──────────────────┐
             │     FastAPI      │
             │     Backend      │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │    PostgreSQL    │
             │     Database     │
             └──────────────────┘
```

Possible deployment environments include:

- Cloud platforms
- Virtual machines
- Container hosting platforms
- Managed PostgreSQL services

---

# 📈 Project Workflow

```text
                    USER
                      │
                      ▼
                  LOGIN
                      │
                      ▼
                JWT TOKEN
                      │
                      ▼
              ROLE IDENTIFICATION
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
     FARMER        ANALYST        ADMIN
        │             │             │
        ▼             ▼             ▼
    Farm Data      Analytics     Management
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
             MACHINE LEARNING
                      │
                      ▼
              YIELD PREDICTION
                      │
                      ▼
             AGRICULTURAL INSIGHTS
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Weather        Soil          Risk
        │             │             │
        └─────────────┼─────────────┘
                      ▼
              RECOMMENDATIONS
                      │
                      ▼
                ANALYTICS
                      │
                      ▼
                 REPORTS
```

---

# 📊 Project Outcome

The project successfully combines:

```text
Artificial Intelligence
        +
Machine Learning
        +
Data Science
        +
FastAPI
        +
Next.js
        +
PostgreSQL
        +
JWT Authentication
        +
Role-Based Access Control
        +
Docker
```

The resulting system provides an integrated agricultural intelligence platform capable of:

- Predicting crop yield
- Managing farms
- Analyzing agricultural conditions
- Evaluating agricultural risks
- Providing recommendations
- Analyzing productivity
- Comparing farms
- Generating reports
- Managing users
- Supporting role-specific workflows

---

# 🔮 Future Enhancements

Future versions can include:

## 🛰️ Satellite Monitoring

Use satellite imagery to monitor crop growth and agricultural land.

## 📡 IoT Integration

Integrate sensors for:

- Soil moisture
- Temperature
- Humidity
- Soil nutrients
- Water levels

## 🦠 Crop Disease Detection

Use computer vision to identify crop diseases from plant images.

## 💧 Smart Irrigation

Predict irrigation requirements based on:

- Soil moisture
- Weather
- Crop type
- Growth stage

## 💰 Market Prediction

Provide crop price and market trend predictions.

## 📱 Mobile Application

Develop Android/iOS applications for farmers.

## 🤖 Advanced AI Advisor

Provide conversational AI assistance for agricultural queries.

---

# 🖥️ Screenshots

Add project screenshots here after uploading them to the repository.

Example:

```markdown
![Login](screenshots/login.png)

![Farmer Dashboard](screenshots/farmer-dashboard.png)

![Prediction](screenshots/prediction.png)

![Analyst Dashboard](screenshots/analyst-dashboard.png)

![Admin Dashboard](screenshots/admin-dashboard.png)
```

Recommended screenshots:

1. Login page
2. Registration page
3. Farmer dashboard
4. Farm management
5. Yield prediction
6. Weather analysis
7. Soil analysis
8. Analyst dashboard
9. Farm comparison
10. Admin dashboard
11. Alerts
12. Reports

---

# 🎥 Project Demonstration

The project demonstration covers:

```text
1. Authentication
2. Farmer Dashboard
3. Farm Management
4. Crop Data
5. Yield Prediction
6. Weather Analysis
7. Soil Analysis
8. Recommendations
9. Risk Assessment
10. Notifications
11. Analyst Dashboard
12. Agricultural Analytics
13. Farm Comparison
14. Reports
15. Admin Dashboard
16. User Management
17. Model Metrics
18. Docker / Deployment Architecture
```

---

# 📚 Learning Outcomes

Through the development of YieldSense AI, practical experience was gained in:

- Artificial Intelligence
- Machine Learning
- Data Science
- Python
- XGBoost
- FastAPI
- REST API development
- Next.js
- React
- TypeScript
- PostgreSQL
- SQLAlchemy
- JWT authentication
- Role-Based Access Control
- API testing
- Docker
- Git
- GitHub
- Full-stack development
- Production application architecture

---

# 👨‍💻 Developer

## Mrutunjay Jena

**Domain:** Artificial Intelligence & Machine Learning

**Project:** YieldSense AI

**GitHub:**

[https://github.com/mj-180504](https://github.com/mj-180504)

**Repository:**

[https://github.com/mj-180504/Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System](https://github.com/mj-180504/Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System)

---

# 🙏 Acknowledgement

I sincerely express my gratitude to my mentors, instructors, and everyone who provided guidance, support, and valuable feedback throughout the development of this project.

This project provided an excellent opportunity to gain practical experience in Artificial Intelligence, Machine Learning, Data Science, backend development, frontend development, database management, authentication, API development, Docker, testing, and deployment.

---

# ⭐ Conclusion

YieldSense AI demonstrates how Artificial Intelligence and modern full-stack technologies can be combined to build an intelligent agricultural decision-support platform.

The system transforms agricultural data into meaningful predictions, analytics, risk insights, and recommendations.

> 🌾 **YieldSense AI — Turning Agricultural Data into Intelligent Decisions.**

---

# 📜 License

This project is developed for educational, academic, internship, and portfolio purposes.

---

## ⭐ If you found this project interesting, consider giving the repository a star!