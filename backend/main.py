from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import json
from backend.weather_api import get_live_weather
from fastapi.responses import FileResponse
import os
from backend.database import SessionLocal, engine, Base
from backend.models import User, Prediction
from backend.schemas import (
    UserCreate,
    UserLogin,
    PredictionInput,
    PredictionCreate
)
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token
)

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:63342",
        "http://127.0.0.1:63342",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML Model
model = joblib.load("models/crop_yield_model.pkl")
area_encoder= joblib.load("models/area_encoder.pkl")
item_encoder = joblib.load("models/item_encoder.pkl")

# Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(authorization: str = Header(...)):
    print("\n========== AUTH DEBUG ==========")
    print("Authorization Header:", authorization)

    token = authorization.replace("Bearer ", "")
    print("Extracted Token:", token)

    payload = verify_access_token(token)
    print("Decoded Payload:", payload)

    print("================================\n")

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    return payload

# Home Route
@app.get("/")
def home():
    return {
        "message": "YieldSense AI Running Successfully"
    }


# Register
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


# Login
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }


# Crop Yield Prediction
@app.post("/api/v1/predict-yield")
def predict_yield(
    data: PredictionInput,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # --- NEW WEATHER API LOGIC ---
    if data.avg_temp == 0 or data.average_rain_fall_mm_per_year == 0:
        print(f"Fetching live weather for: {data.area}")
        weather_data = get_live_weather(data.area)

        if weather_data.get("success"):
            data.avg_temp = weather_data["avg_temp"]
            data.average_rain_fall_mm_per_year = weather_data["current_rainfall_mm"]
            print(f"Weather updated! Temp: {data.avg_temp}, Rain: {data.average_rain_fall_mm_per_year}")
        else:
            print("Weather API failed, using default values.")
    # -----------------------------

    # Crop Advisory
    crop = data.crop_type.lower()
    if crop == "wheat":
        crop_message = "Wheat grows best in fertile soil and moderate temperatures."
    elif crop == "rice":
        crop_message = "Rice requires abundant water and high rainfall."
    elif crop == "maize":
        crop_message = "Maize performs best under warm weather conditions."
    elif crop == "cotton":
        crop_message = "Cotton requires warm temperatures and well-drained soil."
    elif crop == "sugarcane":
        crop_message = "Sugarcane requires high rainfall and nutrient-rich soil."
    elif crop == "barley":
        crop_message = "Barley can tolerate cooler climates and moderate rainfall."
    else:
        crop_message = f"Custom crop selected: {data.crop_type}. Monitor local weather and soil conditions carefully."
    # ---------- AI Crop Recommendation ----------

    recommended_crop = data.crop_type
    confidence = 90
    reason = []
    farmer_advice = []

    if data.ph >= 6.0 and data.ph <= 7.5:
        confidence += 2
        reason.append("Ideal soil pH for crop growth.")
    else:
        reason.append("Soil pH should be adjusted for better yield.")
        farmer_advice.append("Maintain soil pH between 6.0 and 7.5.")

    if data.avg_temp >= 20 and data.avg_temp <= 32:
        confidence += 2
        reason.append("Temperature is suitable.")
    else:
        reason.append("Temperature is outside the ideal range.")

    if data.average_rain_fall_mm_per_year >= 50:
        confidence += 2
        reason.append("Adequate rainfall available.")
    else:
        reason.append("Low rainfall detected.")
        farmer_advice.append("Provide supplemental irrigation.")

    if data.pesticides_tonnes > 0:
        reason.append("Crop protection measures detected.")
    else:
        farmer_advice.append("Apply appropriate pest management practices.")

    farmer_advice.append("Monitor crop growth every week.")
    farmer_advice.append("Use balanced fertilizers based on soil health.")

    confidence = min(confidence, 99)
    # Encode Area & Crop

    if data.area in area_encoder.classes_:
        area_value = area_encoder.transform([data.area])[0]
    else:
        area_value = area_encoder.transform([area_encoder.classes_[0]])[0]

    # Safe Encode Crop (Fallback if crop is unknown to model)
    if data.crop_type in item_encoder.classes_:
        crop_value = item_encoder.transform([data.crop_type])[0]
    else:
        crop_value = item_encoder.transform([item_encoder.classes_[0]])[0]



    # Model Input
    input_data = pd.DataFrame({
        "Area": [area_value],
        "Item": [crop_value],
        "Year": [data.year],
        "average_rain_fall_mm_per_year": [data.average_rain_fall_mm_per_year],
        "pesticides_tonnes": [data.pesticides_tonnes],
        "avg_temp": [data.avg_temp]
    })

    prediction = model.predict(input_data)
    final_yield = round(float(prediction[0]), 2)

    # --- MILESTONE 3: RISK ASSESSMENT & RECOMMENDATION ENGINE ---
    risk_alerts = []
    recommendations = []
    highest_risk_level = "Low Risk" # Default baseline for DB

    # 1. Environmental Risk: Rainfall
    if data.average_rain_fall_mm_per_year < 200:
        risk_alerts.append({"type": "Drought Risk", "level": "High", "color": "red"})
        recommendations.append("Critical: Implement drip irrigation immediately. Consider drought-resistant crop varieties.")
        highest_risk_level = "High Risk"
    elif data.average_rain_fall_mm_per_year > 1500:
        risk_alerts.append({"type": "Flood Risk", "level": "Warning", "color": "yellow"})
        recommendations.append("Warning: Ensure proper field drainage to prevent root rot.")
        if highest_risk_level != "High Risk": highest_risk_level = "Medium Risk"
    else:
        risk_alerts.append({"type": "Rainfall", "level": "Optimal", "color": "green"})
        recommendations.append("Rainfall levels are optimal for standard irrigation schedules.")

    # 2. Environmental Risk: Temperature
    if data.avg_temp > 35:
        risk_alerts.append({"type": "Heat Stress", "level": "High", "color": "red"})
        recommendations.append("Critical: Increase watering frequency to combat heat stress.")
        highest_risk_level = "High Risk"
    elif 20 <= data.avg_temp <= 30:
        risk_alerts.append({"type": "Temperature", "level": "Optimal", "color": "green"})
    else:
        risk_alerts.append({"type": "Temperature Anomaly", "level": "Warning", "color": "yellow"})
        recommendations.append("Warning: Monitor crop growth closely due to suboptimal temperatures.")
        if highest_risk_level != "High Risk": highest_risk_level = "Medium Risk"

    # 3. Soil Health Analysis
    if data.ph < 5.5:
        risk_alerts.append({"type": "High Acidity", "level": "Warning", "color": "yellow"})
        recommendations.append("Action: Apply agricultural lime to raise soil pH.")
        if highest_risk_level != "High Risk": highest_risk_level = "Medium Risk"
    elif data.ph > 7.5:
        risk_alerts.append({"type": "High Alkalinity", "level": "Warning", "color": "yellow"})
        recommendations.append("Action: Apply elemental sulfur to lower soil pH.")
        if highest_risk_level != "High Risk": highest_risk_level = "Medium Risk"
    else:
        risk_alerts.append({"type": "Soil pH", "level": "Optimal", "color": "green"})

    # Save to Database
    # Convert lists to strings to safely store in the DB text columns
    prediction_record = Prediction(
        user_email=current_user["sub"],
        crop=data.crop_type,
        rainfall=data.average_rain_fall_mm_per_year,
        pesticides=data.pesticides_tonnes,
        temperature=data.avg_temp,
        ph=data.ph,
        estimated_yield=final_yield,
        risk=highest_risk_level,
        recommendation=json.dumps(recommendations) # Safely store array as string
    )

    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    # --- FINAL API RESPONSE (MILESTONE 3 FORMAT) ---
    weather_response = {
        "city": weather_data.get("city") if weather_data else data.area,
        "temperature": data.avg_temp,
        "rainfall": data.average_rain_fall_mm_per_year,
        "humidity": weather_data.get("humidity") if weather_data else None,
        "weather_condition": weather_data.get("weather") if weather_data else None,
        "wind_speed": weather_data.get("wind_speed") if weather_data else None
    }
    return {
        "success": True,
        "estimated_yield_kg_per_ha": final_yield,
        "crop_message": crop_message,

        "weather": weather_response,
        "ai_recommendation": {
            "recommended_crop": recommended_crop,
            "confidence": confidence,
            "reason": reason,
            "farmer_advice": farmer_advice
        },
        "analytics": {
            "overall_risk": highest_risk_level,
            "risk_alerts": risk_alerts,
            "recommendations": recommendations
        }
    }

@app.get("/api/v1/predictions")
def get_predictions(db: Session = Depends(get_db)):
    predictions = db.query(Prediction).order_by(Prediction.id.desc()).all()

    return [
        {
            "id": p.id,
            "user_email": p.user_email,
            "crop": p.crop,
            "rainfall": p.rainfall,
            "pesticides": p.pesticides,
            "temperature": p.temperature,
            "ph": p.ph,
            "estimated_yield": p.estimated_yield,
            "risk": p.risk,
            "recommendation": p.recommendation,
            "created_at": p.created_at,
        }
        for p in predictions
    ]

@app.get("/api/v1/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db)):
    predictions = db.query(Prediction).all()

    if len(predictions) == 0:
        return {
            "total_predictions": 0,
            "average_yield": 0,
            "best_crop": "--",
            "current_risk": "--"
        }

    total_predictions = len(predictions)

    average_yield = round(
        sum(p.estimated_yield for p in predictions) / total_predictions,
        2
    )

    crop_count = {}

    for p in predictions:
        crop_count[p.crop] = crop_count.get(p.crop, 0) + 1

    best_crop = max(
        crop_count,
        key=crop_count.get
    )

    current_risk = predictions[-1].risk

    return {
        "total_predictions": total_predictions,
        "average_yield": average_yield,
        "best_crop": best_crop,
        "current_risk": current_risk
    }
@app.get("/api/v1/reports/export-csv")
def export_csv(
    db: Session = Depends(get_db)
):
    predictions = db.query(Prediction).all()

    rows = []

    for p in predictions:
        rows.append({
            "User Email": p.user_email,
            "Crop": p.crop,
            "Temperature (°C)": p.temperature,
            "Rainfall (mm)": p.rainfall,
            "Pesticides (tonnes)": p.pesticides,
            "Soil pH": p.ph,
            "Predicted Yield (kg/ha)": p.estimated_yield,
            "Risk Level": p.risk,
            "Recommendation": p.recommendation,
            "Prediction Date": p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else ""
        })

    df = pd.DataFrame(rows)

    filename = "YieldSense_Report.csv"

    df.to_csv(filename, index=False)

    return FileResponse(
        path=filename,
        media_type="text/csv",
        filename=filename
    )