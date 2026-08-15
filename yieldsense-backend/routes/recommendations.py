from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics & Recommendations"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class FarmAnalyticsRequest(BaseModel):
    crop_type: str
    avg_temp: float
    rainfall: float
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float

    # Week 6 PDF requirements
    predicted_yield: float = 0
    avg_yield: float = 0
    rainfall_deviation: float = 0


# =========================================================
# WEEK 6 PDF - RECOMMENDATION ENGINE
# =========================================================

def generate_recommendation(
    soil_ph,
    predicted_yield,
    avg_yield,
    rainfall_deviation
):
    tips = []

    # Soil check
    if soil_ph < 5.5:
        tips.append(
            "Soil is acidic - consider applying lime to raise pH."
        )

    elif soil_ph > 7.5:
        tips.append(
            "Soil is alkaline - consider adding organic compost."
        )

    # Yield check
    if avg_yield > 0:

        if predicted_yield < avg_yield * 0.8:
            tips.append(
                "Predicted yield is below average - review irrigation and fertilizer schedule."
            )

        elif predicted_yield > avg_yield * 1.1:
            tips.append(
                "Predicted yield is above average - maintain current practices."
            )

    # Weather check
    if rainfall_deviation < -20:
        tips.append(
            "Rainfall is significantly below normal - increase irrigation frequency."
        )

    elif rainfall_deviation > 20:
        tips.append(
            "Rainfall is significantly above normal - monitor drainage and waterlogging."
        )

    # Fallback
    if not tips:
        tips.append(
            "All indicators look normal - continue current farming practices."
        )

    return tips


# =========================================================
# WEEK 6 PDF - RISK ASSESSMENT
# =========================================================

def assess_risk(
    predicted_yield,
    avg_yield,
    rainfall_deviation,
    soil_ph
):
    risk_score = 0

    # Yield risk
    if avg_yield > 0:

        if predicted_yield < avg_yield * 0.7:
            risk_score += 2

        elif predicted_yield < avg_yield * 0.9:
            risk_score += 1

    # Rainfall risk
    if abs(rainfall_deviation) > 30:
        risk_score += 2

    elif abs(rainfall_deviation) > 15:
        risk_score += 1

    # Soil pH risk
    if soil_ph < 5.0 or soil_ph > 8.0:
        risk_score += 1

    # Final risk level
    if risk_score >= 4:
        return "High"

    elif risk_score >= 2:
        return "Medium"

    else:
        return "Low"


# =========================================================
# API ENDPOINT
# =========================================================

@router.post("/recommendations")
def generate_farm_insights(payload: FarmAnalyticsRequest):

    # -----------------------------------------------------
    # PDF-REQUIRED RECOMMENDATIONS
    # -----------------------------------------------------

    recommendations = generate_recommendation(
        soil_ph=payload.soil_ph,
        predicted_yield=payload.predicted_yield,
        avg_yield=payload.avg_yield,
        rainfall_deviation=payload.rainfall_deviation
    )

    # -----------------------------------------------------
    # PDF-REQUIRED RISK ASSESSMENT
    # -----------------------------------------------------

    risk_level = assess_risk(
        predicted_yield=payload.predicted_yield,
        avg_yield=payload.avg_yield,
        rainfall_deviation=payload.rainfall_deviation,
        soil_ph=payload.soil_ph
    )

    # -----------------------------------------------------
    # YOUR EXISTING FERTILIZER LOGIC
    # -----------------------------------------------------

    if payload.nitrogen < 50:
        recommendations.append(
            "Low Nitrogen detected. Apply Urea fertilizer."
        )

    if payload.phosphorus < 40:
        recommendations.append(
            "Apply Phosphorus fertilizer."
        )

    if payload.potassium < 40:
        recommendations.append(
            "Apply Potassium fertilizer."
        )

    # -----------------------------------------------------
    # YOUR EXISTING IRRIGATION LOGIC
    # -----------------------------------------------------

    if payload.rainfall < 300:
        recommendations.append(
            "Increase irrigation and provide regular watering due to low rainfall."
        )

    elif payload.rainfall > 1200:
        recommendations.append(
            "Reduce irrigation and ensure proper field drainage due to high rainfall."
        )

    # -----------------------------------------------------
    # YOUR EXISTING TEMPERATURE RISK
    # -----------------------------------------------------

    risks = []

    if payload.rainfall < 300:
        risks.append({
            "type": "Drought Risk",
            "severity": "High",
            "advice": "Increase irrigation immediately."
        })

    elif payload.rainfall > 1200:
        risks.append({
            "type": "Flood Risk",
            "severity": "Medium",
            "advice": "Ensure proper field drainage."
        })

    if payload.avg_temp > 35:
        risks.append({
            "type": "Heat Stress",
            "severity": "High",
            "advice": "Water crops during morning or evening."
        })

    # -----------------------------------------------------
    # CROP-SPECIFIC RECOMMENDATIONS
    # -----------------------------------------------------

    crop = payload.crop_type.lower()

    if crop == "rice":
        recommendations.append(
            "Maintain adequate standing water during critical rice growth stages."
        )

    elif crop == "wheat":
        recommendations.append(
            "Monitor soil moisture carefully during wheat grain development."
        )

    elif crop == "maize":
        recommendations.append(
            "Provide adequate irrigation during maize flowering and grain filling."
        )

    elif crop == "cotton":
        recommendations.append(
            "Avoid excessive irrigation and monitor cotton root-zone moisture."
        )

    # -----------------------------------------------------
    # BEST PRACTICES
    # -----------------------------------------------------

    best_practice_tips = [
        "Rotate crops every season.",
        "Use organic manure regularly.",
        "Monitor weather updates weekly.",
        "Maintain proper soil moisture.",
        "Monitor soil nutrient levels regularly."
    ]

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "crop": payload.crop_type,

        "overall_risk_level": risk_level,

        "identified_risks": risks,

        "actionable_recommendations": recommendations,

        "best_practice_tips": best_practice_tips
    }