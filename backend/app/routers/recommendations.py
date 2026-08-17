from fastapi import APIRouter, Depends
from app.models import FarmAnalyticsRequest
from app.auth_handler import get_current_user

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics & Recommendations"])

@router.post("/recommendations")
def generate_farm_insights(payload: FarmAnalyticsRequest, current_user: dict = Depends(get_current_user)):
    recommendations = []
    risks = []
    
    # Recommendations are intentionally rule-based and traceable; thresholds are
    # exposed by the response rather than represented as model output.
    if payload.soil_ph < 6.0:
        recommendations.append("Apply agricultural lime to raise soil pH to optimal range (6.0 - 7.0).")
    elif payload.soil_ph > 7.5:
        recommendations.append("Apply elemental sulfur to lower soil pH.")
    else:
        recommendations.append("Soil pH is optimal. Maintain current organic matter levels.")

    if payload.nitrogen < 50:
        recommendations.append("Low Nitrogen detected: Apply Urea or NPK (20-10-10) fertilizer during early growth.")
    if payload.phosphorus < 25:
        recommendations.append("Phosphorus is below the target range; use a soil-test-guided phosphorus application near the root zone.")
    if payload.potassium < 25:
        recommendations.append("Potassium is low; apply a soil-test-guided potash source to support water regulation and grain filling.")

    # 2. Risk Assessment Logic
    risk_score = "Low"
    if payload.rainfall < 200:
        risks.append({"type": "Drought Stress", "severity": "High", "advice": "Critical drought level! Initiate drip irrigation immediately and check water reserves."})
    elif payload.rainfall < 500:
        risks.append({"type": "Drought Stress", "severity": "Medium", "advice": "Schedule irrigation from measured soil moisture and reduce evaporation with mulch where suitable."})
        
    if payload.rainfall > 1200:
        risks.append({"type": "Flood/Root Rot", "severity": "Medium", "advice": "Ensure field drainage paths are clear."})

    if payload.avg_temp > 35:
        risks.append({"type": "Heat Stress", "severity": "High", "advice": "Consider shade netting or early-morning irrigation."})
    elif payload.avg_temp < 18:
        risks.append({"type": "Cold Stress", "severity": "Medium", "advice": "Avoid excess irrigation and use locally appropriate cold-protection measures."})

    if payload.soil_ph < 5.8 or payload.soil_ph > 7.8:
        risks.append({"type": "Soil pH Imbalance", "severity": "Medium", "advice": "Correct pH gradually using a soil-test-guided amendment plan."})

    if not risks:
        risks.append({"type": "No acute environmental stress", "severity": "Low", "advice": "Continue field scouting and record conditions weekly."})

    if any(r["severity"] == "High" for r in risks):
        risk_score = "High"
    elif any(r["severity"] == "Medium" for r in risks):
        risk_score = "Medium"

    return {
        "crop": payload.crop_type,
        "overall_risk_level": risk_score,
        "identified_risks": risks,
        "actionable_recommendations": recommendations,
        "best_practice_tips": [
            "Rotate crops seasonally to support nutrient balance and pest management.",
            "Monitor weather and soil moisture weekly, especially before irrigation or fertilizer applications.",
        ],
        "assessment_basis": {"rainfall_mm": payload.rainfall, "temperature_c": payload.avg_temp, "soil_ph": payload.soil_ph}
    }
