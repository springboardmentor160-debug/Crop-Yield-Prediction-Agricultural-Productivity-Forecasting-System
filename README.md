# 🌾 YieldSense AI

## AI-Powered Crop Yield Prediction & Agricultural Productivity Forecasting System

YieldSense AI is a full-stack AI-powered web application that helps farmers, researchers, and agricultural organizations predict crop yield using Machine Learning. The platform combines weather analysis, soil insights, crop recommendations, risk assessment, and interactive analytics to support smart farming decisions.

---

# 🚀 Features

### 🔐 Authentication
- User Registration
- User Login
- JWT Authentication
- Secure Password Hashing

### 🤖 AI & Machine Learning
- Crop Yield Prediction
- AI Crop Recommendation
- Farmer Advisory System
- Productivity Analysis
- Risk Assessment

### 🌦 Weather & Environment
- Live Weather API Integration
- Temperature Analysis
- Soil pH Analysis
- Pesticide Analysis

### 📊 Dashboard
- Interactive Dashboard
- Live Yield Analytics
- Prediction History
- Seasonal Report
- AI Summary

### 📄 Reports
- PDF Report Generation
- CSV Report Export
- PostgreSQL Prediction Storage

---

# 🛠 Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js

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
- Passlib (bcrypt)

---

# 📂 Project Structure

```text
YieldSense-AI
│
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── weather_api.py
│   ├── train_model.py
│   └── main.py
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
├── datasets/
├── models/
├── docs/
├── notebooks/
└── README.md
```

---

# ⚙ Installation

Clone the repository

```bash
git clone <repository-url>
```

Move into the project

```bash
cd YieldSense-AI
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run FastAPI

```bash
uvicorn backend.main:app --reload
```

Open

```
http://127.0.0.1:8000
```

---

# 🧠 Machine Learning Workflow

1. Data Collection
2. Data Cleaning
3. Feature Engineering
4. Model Training
5. Yield Prediction
6. Risk Assessment
7. AI Recommendation
8. Report Generation

---

# 📈 Milestone Progress

## ✅ Milestone 1
- Project Setup
- Database Design
- Authentication
- FastAPI Backend

## ✅ Milestone 2
- Machine Learning Model
- Crop Prediction
- Weather Integration
- Prediction History

## ✅ Milestone 3
- Professional Dashboard
- AI Recommendation Engine
- Risk Analysis
- PDF Export
- CSV Export
- Live Analytics
- PostgreSQL History
- Dashboard Statistics

---


# 👨‍💻 Developer

**Varnit Sharma**

AI | Machine Learning | Full Stack Developer

---

# 📜 License

This project is developed for educational and research purposes.s
## ?? Large ML Model

The trained model file `models/crop_yield_model.pkl` is not included in the GitHub repository because it exceeds GitHub's 100 MB file-size limit. The model is kept locally and can be regenerated using the training script `train_model.py`.

