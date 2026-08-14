from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_conn

import numpy as np
import joblib
import os
from datetime import datetime

from routes.weather import weather_status, get_weather
from routes.soil import soil_status

router = APIRouter()

MODEL_PATH = "yield_model.pkl"
ENCODER_PATH = "crop_encoder.pkl"

model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None
encoder = joblib.load(ENCODER_PATH) if os.path.exists(ENCODER_PATH) else None


class Prediction(BaseModel):
    crop: str
    pesticides: float


@router.post("/predict")
def predict(data: Prediction):

    if model is None:
        raise HTTPException(status_code=500, detail="Model not found")

    if encoder is None:
        raise HTTPException(status_code=500, detail="Crop encoder not found")

    print("Crop received from frontend:", data.crop)
    # Normalize crop name to match the trained encoder
    input_crop = data.crop.strip()

    matching_crop = next(
        (
            crop
            for crop in encoder.classes_
            if crop.lower() == input_crop.lower()
        ),
        None
    )

    if matching_crop is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported crop: {data.crop}"
        )

    crop_value = encoder.transform([matching_crop])[0]

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT crop_type, soil_type, soil_ph, nitrogen,
           phosphorus, potassium, latitude, longitude, season
    FROM farms
    WHERE LOWER(TRIM(crop_type)) = LOWER(TRIM(%s))
       OR LOWER(TRIM(%s)) LIKE LOWER(TRIM(crop_type)) || '%%'
    ORDER BY id DESC
    LIMIT 1
""", (data.crop, data.crop))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row:
        crop_type = row[0]     
        
        soil_type = row[1]
        soil_ph = row[2]
        nitrogen = row[3]
        phosphorus = row[4]
        potassium = row[5]
        latitude = float(row[6])
        longitude = float(row[7])
        season = row[8]
    else:
        crop_type = data.crop
        season="Unknown"
        soil_type = "Unknown"
        soil_ph = 7
        nitrogen = 50
        phosphorus = 40
        potassium = 40
        latitude = 12.2958
        longitude = 76.6394

    weather_data = get_weather(latitude, longitude)

    temperature = weather_data["temperature"]
    humidity = weather_data["humidity"]
    rainfall = weather_data["rainfall"]

    values = np.array([[
        crop_value,
        rainfall,
        data.pesticides,
        temperature
    ]])

    predicted_yield = float(model.predict(values)[0])

    weather = weather_status(
        temperature,
        rainfall
    )

    soil = soil_status(
        soil_type,
        crop_type,
        soil_ph,
        nitrogen,
        phosphorus,
        potassium
    )

    # Better irrigation recommendation using rainfall

    if rainfall < 5:
        soil["irrigation"] = "Increase irrigation"

    elif rainfall < 20:
        soil["irrigation"] = "Moderate irrigation"

    else:
        soil["irrigation"] = "Rainfall is sufficient"

    if predicted_yield >= 5000:
        yield_potential = "High"
    elif predicted_yield >= 3000:
        yield_potential = "Moderate"
    else:
        yield_potential = "Low"

    if weather == "Heat Stress":
        risk = "High"
    elif weather == "Moderate":
        risk = "Medium"
    else:
        risk = "Low"

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO predictions(
        crop, season, estimated_yield, yield_potential,
        risk_level, temperature, rainfall, humidity,
        weather_status, fertilizer, irrigation,
        crop_suitability, recommendation
    )
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
""", (
    crop_type, season, round(predicted_yield, 2),
    yield_potential, risk, temperature, rainfall,
    humidity, weather, soil["fertilizer"],
    soil["irrigation"], soil["crop_suitability"],
    f"{crop_type} Cultivation"
))

    conn.commit()
    cur.close()
    conn.close()

    recommendations = (
    f"Use {soil['fertilizer']} and follow proper soil management. "
    f"{soil['irrigation']}."
)
    return {
        "crop": crop_type,

        "estimated_yield": round(predicted_yield, 2),

        "yield_potential": yield_potential,

        "temperature": temperature,

        "rainfall": rainfall,

        "humidity": humidity,

        "weather_status": weather,

        "risk_level": risk,

        "soil_health": soil["soil_health"],

        "ph_status": soil["ph_status"],

        "nitrogen_status": soil["nitrogen_status"],

        "phosphorus_status": soil["phosphorus_status"],

        "potassium_status": soil["potassium_status"],

        "fertilizer": soil["fertilizer"],

        "irrigation": soil["irrigation"],

        "crop_suitability": soil["crop_suitability"],

        "recommendation": f"{crop_type} Cultivation",
        
        "recommendations": recommendations,

        "prediction_time": datetime.now().strftime("%d-%m-%Y %H:%M")
    }