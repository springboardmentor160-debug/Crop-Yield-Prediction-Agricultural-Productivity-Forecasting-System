"""
YieldSense AI - Risk Assessment Router
Module 8: Weather, disease, yield, profit risk analysis
"""
from fastapi import APIRouter, Depends
from app import models
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/risk", tags=["Risk Assessment"])

@router.get("/assessment")
def get_risk_assessment(
    rainfall_mm: float = 850,
    temperature_c: float = 25,
    crop_type: str = "wheat",
    soil_ph: float = 6.5,
    current_user: models.User = Depends(get_current_user)
):
    risks = []
    overall_score = 100

    # Weather risks
    if rainfall_mm < 400:
        risks.append({"type": "Drought", "level": "High", "score": 80, "description": "Severe water deficit risk", "mitigation": "Implement drip irrigation immediately"})
        overall_score -= 30
    elif rainfall_mm > 2500:
        risks.append({"type": "Flood", "level": "High", "score": 75, "description": "Waterlogging risk detected", "mitigation": "Improve drainage system"})
        overall_score -= 25
    else:
        risks.append({"type": "Drought", "level": "Low", "score": 15, "description": "Adequate rainfall", "mitigation": "Continue monitoring"})

    if temperature_c > 38:
        risks.append({"type": "Heat Stress", "level": "Critical", "score": 90, "description": "Extreme heat may damage crops", "mitigation": "Use shade nets and heat-resistant varieties"})
        overall_score -= 35
    elif temperature_c > 33:
        risks.append({"type": "Heat Stress", "level": "Medium", "score": 45, "description": "Moderate heat stress possible", "mitigation": "Increase irrigation frequency"})
        overall_score -= 15
    else:
        risks.append({"type": "Heat Stress", "level": "Low", "score": 10, "description": "Temperature is optimal", "mitigation": "No action needed"})

    if soil_ph < 5.5 or soil_ph > 8.0:
        risks.append({"type": "Soil pH", "level": "High", "score": 70, "description": "pH out of optimal range affects nutrient availability", "mitigation": "Apply lime or sulfur to correct pH"})
        overall_score -= 20

    # Disease risks
    if rainfall_mm > 1500 and temperature_c > 25:
        risks.append({"type": "Fungal Disease", "level": "Medium", "score": 55, "description": "High humidity increases fungal disease risk", "mitigation": "Apply preventive fungicide"})
        overall_score -= 15
    else:
        risks.append({"type": "Disease", "level": "Low", "score": 15, "description": "Low disease risk in current conditions", "mitigation": "Regular crop monitoring"})

    risks.append({"type": "Market", "level": "Low", "score": 20, "description": "Stable market prices for major crops", "mitigation": "Monitor market regularly"})

    overall_score = max(0, overall_score)
    if overall_score >= 80:
        overall_level = "Low"
    elif overall_score >= 60:
        overall_level = "Medium"
    elif overall_score >= 40:
        overall_level = "High"
    else:
        overall_level = "Critical"

    return {
        "overall_risk_score": overall_score,
        "overall_risk_level": overall_level,
        "crop_type": crop_type,
        "risks": risks,
        "summary": f"Your {crop_type} crop has {overall_level.lower()} overall risk. {len([r for r in risks if r['level'] in ['High', 'Critical']])} critical factors need attention.",
    }

@router.get("/disease")
def get_disease_risk(
    crop_type: str = "wheat",
    rainfall_mm: float = 850,
    temperature_c: float = 25,
    humidity: float = 65,
    current_user: models.User = Depends(get_current_user)
):
    diseases = {
        "wheat": [
            {"disease": "Rust", "probability": 35 if humidity > 70 else 15, "severity": "High", "prevention": "Apply fungicide, use resistant varieties"},
            {"disease": "Powdery Mildew", "probability": 40 if temperature_c > 20 else 20, "severity": "Medium", "prevention": "Improve air circulation, sulfur spray"},
            {"disease": "Leaf Blight", "probability": 25 if rainfall_mm > 1000 else 10, "severity": "Medium", "prevention": "Crop rotation, seed treatment"},
        ],
        "rice": [
            {"disease": "Blast", "probability": 50 if humidity > 80 else 25, "severity": "High", "prevention": "Fungicide spray, resistant varieties"},
            {"disease": "Brown Spot", "probability": 30 if temperature_c > 28 else 15, "severity": "Medium", "prevention": "Balanced fertilization"},
        ],
    }
    crop_diseases = diseases.get(crop_type.lower(), diseases["wheat"])
    overall_risk = sum(d["probability"] for d in crop_diseases) / len(crop_diseases)

    return {
        "crop_type": crop_type,
        "overall_disease_risk_percent": round(overall_risk, 1),
        "risk_level": "High" if overall_risk > 40 else "Medium" if overall_risk > 20 else "Low",
        "diseases": crop_diseases,
        "general_advice": "Regular scouting is recommended. Apply preventive measures before disease onset."
    }

@router.get("/profit")
def get_profit_risk(
    crop_type: str = "wheat",
    area_hectares: float = 1.0,
    expected_yield_tons: float = 3.5,
    current_user: models.User = Depends(get_current_user)
):
    prices = {"wheat": 2200, "rice": 2500, "maize": 1950, "soybean": 3800, "cotton": 6000}
    costs = {"wheat": 15000, "rice": 20000, "maize": 12000, "soybean": 18000, "cotton": 25000}

    price = prices.get(crop_type.lower(), 2500)
    cost_per_ha = costs.get(crop_type.lower(), 15000)
    total_cost = cost_per_ha * area_hectares
    revenue = expected_yield_tons * area_hectares * price
    profit = revenue - total_cost
    roi = round((profit / total_cost) * 100, 1) if total_cost > 0 else 0

    return {
        "crop_type": crop_type,
        "area_hectares": area_hectares,
        "expected_yield_tons": expected_yield_tons,
        "price_per_ton_inr": price,
        "total_cost_inr": total_cost,
        "expected_revenue_inr": revenue,
        "expected_profit_inr": profit,
        "roi_percent": roi,
        "profit_risk_level": "Low" if roi > 30 else "Medium" if roi > 10 else "High",
        "break_even_yield_tons": round(total_cost / (price * area_hectares), 2),
    }
