# 🌾 YieldSense AI

### Crop Yield Prediction & Agricultural Productivity Forecasting System

YieldSense AI is an AI-powered agricultural application that predicts crop yield using farm, soil, crop, and weather information. It also provides weather insights, analytics, soil analysis, and agricultural recommendations.

## 🎯 Objective

To develop an intelligent system that helps farmers make better agricultural decisions using machine learning and environmental data.

## ✨ Features

- 🌱 Farm profile and soil information
- 🤖 AI-based crop yield prediction
- 🌦️ Real-time weather information
- 📊 Analytics and prediction history
- 🌾 Soil health analysis
- 💡 Agricultural recommendations
- 🔐 User registration and login
- 🐘 PostgreSQL database

## 🛠️ Tech Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS  
**Backend:** Python, FastAPI, REST APIs
**Machine Learning:** XGBoost 
**Database:** PostgreSQL  
**Weather API:** Open-Meteo  
**Deployment:** Docker & Docker Compose

## 🔄 Workflow

```text
Register / Login
       ↓
    Dashboard
       ↓
Farm & Soil Information
       ↓
Weather Data
       ↓
Crop Yield Prediction
       ↓
Analytics & History
       ↓
Agricultural Recommendations
```

## 📂 Project Structure

```text
Crop-Yield-Prediction-Agricultural-Productivity-Forecasting-System/
├── backend/
├── frontend/
├── dataset/
├── docs/
├── .gitignore
├── docker-compose.yml
├── LICENSE
├── README.md
└── requirements.txt
```

## 🚀 Run the Project

Using Docker

```bash
docker compose build
docker compose up
```

### Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs


## 📊 Application Dashboard

The dashboard provides an overview of:

- Predicted crop yield
- Current weather conditions
- Yield trends
- Seasonal performance
- Farm statistics
- Crop and farm information

The application also includes dedicated sections for weather, analytics, soil information, prediction history, and recommendations.

## 🔮 Future Enhancements

- Improve prediction accuracy using larger datasets
- Enhance agricultural recommendations
- Add cloud deployment
- Introduce real-time monitoring and notifications