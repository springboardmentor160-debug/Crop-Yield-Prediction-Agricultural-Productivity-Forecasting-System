# 🌾 Crop Yield Prediction & Agricultural Productivity Forecasting System

An AI-powered web application that predicts crop yield using agricultural, soil, weather, and environmental data. The system provides data-driven insights through an interactive dashboard to support better crop planning and agricultural decision-making.

## 🎯 Project Objective

The objective of this project is to develop an intelligent agricultural system that uses **Machine Learning and modern web technologies** to predict crop yield and provide useful agricultural insights for better planning and decision-making.

## ✨ Features

- 🌾 Crop yield prediction using **XGBoost**
- 🌱 Agricultural and soil data analysis
- 🌦️ Weather and environmental insights
- 📊 Interactive analytics dashboard
- 💡 Crop recommendations and insights
- 🔐 User registration and authentication
- 📄 Prediction and report generation
- 🐘 PostgreSQL database integration

## 🛠️ Tech Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS

**Backend:** Python, FastAPI, REST APIs

**Machine Learning:** XGBoost, Pandas, Scikit-learn, Joblib

**Database:** PostgreSQL

## 🤖 Machine Learning

The system uses an **XGBoost Regression model** to predict crop yield based on relevant agricultural and environmental features.

### Prediction Workflow

**User Input → Data Validation & Preprocessing → Feature Processing → XGBoost Model → Predicted Yield → Dashboard & Insights**

## 🏗️ System Architecture

**User → Next.js Frontend → FastAPI Backend → XGBoost ML Model → Crop Yield Prediction → Dashboard & Insights → PostgreSQL Database**

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

## 🚀 Getting Started

### Backend

Create and activate a virtual environment:
```bash
python -m venv venv
```

For Windows:

```bash
venv\Scripts\activate
```
Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend using the project's configured startup command.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start in development mode.

## 📊 Dashboard

The application provides an interactive dashboard to view:

- Predicted crop yield
- Weather conditions
- Yield trends
- Seasonal performance
- Farm statistics
- Crop and farm information

## 🔮 Future Enhancements

- Improved prediction accuracy with larger datasets
- Advanced agricultural recommendations
- Cloud deployment
- Real-time monitoring and notifications
