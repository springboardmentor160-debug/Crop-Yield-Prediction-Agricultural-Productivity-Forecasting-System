# 🌾 YieldSense AI

YieldSense AI is an AI-powered smart agriculture application designed to predict crop yield using agricultural and environmental data.

The project combines a modern React-based frontend with a Python Flask backend to process agricultural information and provide intelligent crop-yield predictions.

---

## 📌 Problem Statement

Agriculture is highly dependent on factors such as soil conditions, temperature, rainfall, humidity, crop type, and other environmental parameters.

Accurately estimating crop yield can be difficult because these factors continuously change.

YieldSense AI aims to provide a technology-based solution that uses Artificial Intelligence and Machine Learning to analyze agricultural data and predict crop yield.

---

## 🎯 Objectives

- Predict crop yield using agricultural and environmental data.
- Provide an easy-to-use web interface.
- Process prediction requests through a Flask backend.
- Apply Artificial Intelligence and Machine Learning techniques to agriculture.
- Help users make data-driven agricultural decisions.
- Provide a foundation for future smart-farming applications.

---

## ✨ Features

- 🌱 Crop yield prediction
- 🤖 AI/ML-based prediction
- 🌦️ Environmental and agricultural data processing
- 📊 Interactive dashboard
- ⚡ Fast prediction processing
- 🔗 Frontend and backend integration
- 🖥️ User-friendly interface
- 🔍 Backend health-check API

---

## 🏗️ System Architecture

```text
                 User
                   │
                   ▼
          React + Vite Frontend
                   │
                   │ API Request
                   ▼
             Flask Backend
                   │
                   ▼
          AI / ML Processing
                   │
                   ▼
           Yield Prediction
                   │
                   ▼
          Frontend Dashboard
                   │
                   ▼
             User Result

---

## 🛠️ Technologies Used

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

### Backend
- Python
- Flask
- Flask-CORS
- Flask-SQLAlchemy
- Python-dotenv

### AI / Machine Learning
- Artificial Intelligence
- Machine Learning
- Data Processing
- Predictive Analysis

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm
- Python

---

## 📂 Project Structure

```text
yieldsense-ai/
│
├── backend/
│   ├── app.py
│   ├── models/
│   └── ...
│
├── src/
│   └── ...
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── README.md
---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/macharlamaheshbabu01-hue/yieldsense-ai.git
cd yieldsense-ai
🚀 How to Run
Frontend

Open a terminal in the project root:

npm install

Start the frontend:

npm run dev

The frontend will be available at:

http://localhost:5173/
Backend

Open a new terminal:

cd backend

Install the required dependencies:

pip install flask
pip install flask-cors
pip install flask-sqlalchemy
pip install python-dotenv

Start the Flask backend:

python app.py

The backend will be available at:

http://127.0.0.1:5000
🔍 Backend API
Health Check

The backend provides a health-check endpoint to verify that the Flask server is running.

Endpoint:

GET /api/health

URL:

http://127.0.0.1:5000/api/health

Successful Response:

{
  "message": "YieldSense AI backend is running",
  "success": true
}
📊 Project Workflow
User
  │
  ▼
Open YieldSense AI Dashboard
  │
  ▼
Enter Agricultural Data
  │
  ▼
React + Vite Frontend
  │
  ▼
API Request
  │
  ▼
Flask Backend
  │
  ▼
Data Processing
  │
  ▼
AI / ML Prediction
  │
  ▼
Prediction Result
  │
  ▼
Display Result on Dashboard
🌱 Applications

YieldSense AI can be used as a foundation for:

Smart agriculture systems
Crop yield estimation
Agricultural decision support
Data-driven farming
Precision agriculture
Smart farming applications
Future IoT-based agriculture systems