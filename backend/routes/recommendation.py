from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_conn
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import numpy as np

router = APIRouter()


class RecommendationRequest(BaseModel):
    crop_type: str
    soil_type: str = "Unknown"
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    rainfall: float
    temperature: float


@router.post("/recommendation")
def recommendation(data: RecommendationRequest):

    # -----------------------------------------
    # GET REAL FARM DATA FROM DATABASE
    # -----------------------------------------

    conn = get_conn()

    query = """
        SELECT crop_type, soil_ph, nitrogen,
               phosphorus, potassium
        FROM farms
        WHERE crop_type IS NOT NULL
    """

    df = pd.read_sql(query, conn)
    conn.close()

    if len(df) < 5 or df["crop_type"].nunique() < 2:
        raise HTTPException(
            status_code=400,
            detail="Not enough farm data to generate crop recommendations."
        )

    # -----------------------------------------
    # TRAIN RECOMMENDATION MODEL
    # -----------------------------------------

    X = df[
        [
            "soil_ph",
            "nitrogen",
            "phosphorus",
            "potassium"
        ]
    ].astype(float)

    y = df["crop_type"].str.strip()

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X, y)

    # -----------------------------------------
    # PREDICT RECOMMENDED CROP
    # -----------------------------------------

    input_data = np.array([[
        data.soil_ph,
        data.nitrogen,
        data.phosphorus,
        data.potassium
    ]])

    probabilities = model.predict_proba(input_data)[0]

    classes = model.classes_

    ranked = np.argsort(probabilities)[::-1]

    recommended_crop = classes[ranked[0]]

    # -----------------------------------------
    # CROP ROTATION
    # -----------------------------------------

    next_crop = recommended_crop

    for index in ranked:
        if classes[index].lower() != data.crop_type.lower():
            next_crop = classes[index]
            break

    # -----------------------------------------
    # SOIL ADVICE
    # -----------------------------------------

    soil_advice = []

    if data.nitrogen < df["nitrogen"].mean():
        soil_advice.append("Nitrogen is below the farm-data average.")

    if data.phosphorus < df["phosphorus"].mean():
        soil_advice.append("Phosphorus is below the farm-data average.")

    if data.potassium < df["potassium"].mean():
        soil_advice.append("Potassium is below the farm-data average.")

    if not soil_advice:
        soil_advice.append(
            "Soil nutrients are within the observed farm-data range."
        )

    # -----------------------------------------
    # FERTILIZER
    # -----------------------------------------

    fertilizer = "Balanced NPK fertilizer"

    if data.nitrogen < df["nitrogen"].mean():
        fertilizer = "Nitrogen-rich fertilizer"

    elif data.phosphorus < df["phosphorus"].mean():
        fertilizer = "Phosphorus-rich fertilizer"

    elif data.potassium < df["potassium"].mean():
        fertilizer = "Potassium-rich fertilizer"

    # -----------------------------------------
    # RISK ASSESSMENT
    # -----------------------------------------

    risks = []

    if data.temperature > 35:
        risks.append("Heat Stress")

    if data.rainfall < 300:
        risks.append("Low Rainfall")

    if data.rainfall > 1200:
        risks.append("High Rainfall")

    if data.soil_ph < 6:
        risks.append("Acidic Soil")

    if data.nitrogen < df["nitrogen"].mean():
        risks.append("Low Nitrogen")

    if data.phosphorus < df["phosphorus"].mean():
        risks.append("Low Phosphorus")

    if data.potassium < df["potassium"].mean():
        risks.append("Low Potassium")

    if len(risks) >= 4:
        risk_level = "High"

    elif len(risks) >= 2:
        risk_level = "Medium"

    else:
        risk_level = "Low"

    # -----------------------------------------
    # IRRIGATION
    # -----------------------------------------

    if data.rainfall < 300:
        irrigation = "Increase irrigation and monitor soil moisture."

    elif data.rainfall > 1200:
        irrigation = "Reduce irrigation and monitor waterlogging."

    else:
        irrigation = "Maintain normal irrigation schedule."

    # -----------------------------------------
    # ACTION
    # -----------------------------------------

    if risk_level == "High":
        today_action = "Inspect the field and address the detected risks."

    elif risk_level == "Medium":
        today_action = "Monitor crop and soil conditions regularly."

    else:
        today_action = "Continue normal farming practices."

    weekly_action = (
        "Monitor soil moisture, nutrients and weather conditions weekly."
    )

    # -----------------------------------------
    # BEST PRACTICES
    # -----------------------------------------

    best_practices = [
        "Monitor soil conditions regularly.",
        "Follow weather forecasts.",
        "Maintain soil organic matter.",
        "Perform periodic soil testing."
    ]

    # -----------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------

    return {
        "current_crop": data.crop_type,
        "recommended_crop": recommended_crop,
        "next_crop": next_crop,

        "soil_advice": " ".join(soil_advice),

        "recommended_fertilizer": fertilizer,

        "recommendations": [
            fertilizer,
            irrigation,
            "Monitor soil nutrient levels regularly."
        ],

        "risk_level": risk_level,

        "identified_risks": risks,

        "today_action": today_action,

        "irrigation": irrigation,

        "weekly_action": weekly_action,

        "best_practices": best_practices
    }