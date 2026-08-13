"""
YieldSense AI - Recommendations Router
Module 7: AI-powered farming recommendations
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app import models
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/recommendations", tags=["Recommendations"])

class RecommendationRequest(BaseModel):
    crop_type: str
    rainfall_mm: float
    temperature_c: float
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    farm_area_hectares: Optional[float] = 1.0

@router.get("/")
def get_recommendations(current_user: models.User = Depends(get_current_user)):
    return {
        "recommendations": [
            {
                "id": 1, "category": "Crop Selection",
                "title": "Best Crop for Current Season",
                "message": "Based on current weather and soil conditions, Wheat is recommended for maximum yield.",
                "priority": "high", "confidence": 92, "expected_benefit": "+15% yield increase",
                "action": "Plant Wheat in next 2 weeks"
            },
            {
                "id": 2, "category": "Fertilization",
                "title": "Nitrogen Application Required",
                "message": "Soil nitrogen levels are below optimal. Apply urea @ 50kg/ha before next irrigation.",
                "priority": "high", "confidence": 88, "expected_benefit": "+20% yield",
                "action": "Apply Urea 50kg/ha"
            },
            {
                "id": 3, "category": "Irrigation",
                "title": "Delay Irrigation 2 Days",
                "message": "Rain forecast in 48 hours. Delay scheduled irrigation to save water.",
                "priority": "medium", "confidence": 78, "expected_benefit": "Save 30% water",
                "action": "Reschedule irrigation"
            },
            {
                "id": 4, "category": "Crop Rotation",
                "title": "Plan Crop Rotation",
                "message": "After current season, rotate to legumes to restore soil nitrogen naturally.",
                "priority": "low", "confidence": 85, "expected_benefit": "Improved soil health",
                "action": "Plan next season crops"
            },
            {
                "id": 5, "category": "Pest Management",
                "title": "Disease Risk: Low",
                "message": "Current conditions have low disease risk. Continue regular monitoring.",
                "priority": "low", "confidence": 90, "expected_benefit": "Prevent crop loss",
                "action": "Monitor weekly"
            }
        ]
    }

@router.post("/generate")
def generate_recommendations(
    req: RecommendationRequest,
    current_user: models.User = Depends(get_current_user)
):
    recs = []

    # Crop recommendations
    if req.soil_ph < 5.5:
        recs.append({"category": "Soil", "title": "Apply Lime", "message": "Soil is too acidic. Apply agricultural lime 2-3 tons/ha to raise pH.", "priority": "high"})
    elif req.soil_ph > 7.5:
        recs.append({"category": "Soil", "title": "Apply Sulfur", "message": "Soil is alkaline. Apply gypsum or sulfur to lower pH.", "priority": "medium"})

    if req.rainfall_mm < 500:
        recs.append({"category": "Irrigation", "title": "Increase Irrigation", "message": f"Low rainfall ({req.rainfall_mm}mm). Supplement with drip irrigation.", "priority": "high"})

    if req.temperature_c > 35:
        recs.append({"category": "Heat", "title": "Heat Stress Risk", "message": "High temperature may stress crops. Use shade nets or heat-resistant varieties.", "priority": "high"})

    if req.nitrogen < 40:
        recs.append({"category": "Fertilizer", "title": "Apply Nitrogen", "message": "Low nitrogen. Apply urea @ 50kg/ha or ammonium nitrate.", "priority": "high"})

    if req.phosphorus < 20:
        recs.append({"category": "Fertilizer", "title": "Apply Phosphorus", "message": "Low phosphorus. Apply DAP @ 25kg/ha.", "priority": "medium"})

    if req.potassium < 50:
        recs.append({"category": "Fertilizer", "title": "Apply Potassium", "message": "Low potassium. Apply MOP @ 30kg/ha.", "priority": "medium"})

    # Profit estimation
    avg_price_per_ton = {"wheat": 2200, "rice": 2500, "maize": 1950, "soybean": 3800, "cotton": 6000}
    price = avg_price_per_ton.get(req.crop_type.lower(), 2500)
    estimated_yield = 3.5
    estimated_profit = round(estimated_yield * (req.farm_area_hectares or 1) * price, 2)

    if not recs:
        recs.append({"category": "General", "title": "Conditions Optimal", "message": "Current conditions are favorable. Maintain current practices.", "priority": "low"})

    return {
        "recommendations": recs,
        "crop_type": req.crop_type,
        "profit_estimate": {
            "estimated_yield_tons": estimated_yield,
            "price_per_ton_inr": price,
            "estimated_revenue_inr": estimated_profit,
            "area_hectares": req.farm_area_hectares,
        }
    }

@router.get("/crop")
def get_crop_recommendations(
    soil_ph: float = 6.5,
    nitrogen: float = 80,
    rainfall: float = 850,
    temperature: float = 25,
    current_user: models.User = Depends(get_current_user)
):
    crops = []
    if 6.0 <= soil_ph <= 7.5 and rainfall > 600 and 15 <= temperature <= 25:
        crops.append({"crop": "Wheat", "suitability": "Excellent", "expected_yield": "4-6 t/ha", "profit_potential": "High"})
    if rainfall > 1200 and temperature > 22:
        crops.append({"crop": "Rice", "suitability": "Excellent", "expected_yield": "3-5 t/ha", "profit_potential": "High"})
    if 5.8 <= soil_ph <= 7.0 and rainfall > 500:
        crops.append({"crop": "Maize", "suitability": "Good", "expected_yield": "4-6 t/ha", "profit_potential": "Medium"})
    if soil_ph >= 6.0 and temperature > 20:
        crops.append({"crop": "Soybean", "suitability": "Good", "expected_yield": "2-3 t/ha", "profit_potential": "High"})
    if not crops:
        crops.append({"crop": "Millets", "suitability": "Fair", "expected_yield": "1-2 t/ha", "profit_potential": "Medium"})
    return {"recommended_crops": crops}

@router.get("/irrigation")
def get_irrigation_plan(
    crop_type: str = "wheat",
    temperature_c: float = 25,
    rainfall_mm: float = 850,
    area_hectares: float = 1.0,
    current_user: models.User = Depends(get_current_user)
):
    daily_water_req = {"wheat": 5, "rice": 10, "maize": 6, "soybean": 5, "cotton": 7}
    base_req = daily_water_req.get(crop_type.lower(), 6)
    heat_factor = 1.2 if temperature_c > 30 else 1.0
    rain_offset = min(rainfall_mm / 365, base_req * 0.5)
    daily_req = max(0, round((base_req * heat_factor - rain_offset) * area_hectares, 1))

    schedule = [
        {"day": "Monday", "water_liters": daily_req * 1000, "time": "6:00 AM", "duration_minutes": 30},
        {"day": "Wednesday", "water_liters": daily_req * 1000, "time": "6:00 AM", "duration_minutes": 30},
        {"day": "Friday", "water_liters": daily_req * 1000, "time": "6:00 AM", "duration_minutes": 30},
    ]
    return {
        "crop_type": crop_type,
        "daily_water_requirement_mm": daily_req,
        "weekly_water_liters": daily_req * 7 * 1000 * area_hectares,
        "irrigation_schedule": schedule,
        "water_saving_tips": [
            "Use drip irrigation to save 40% water",
            "Irrigate during early morning to reduce evaporation",
            "Mulching reduces soil moisture loss by 30%",
        ]
    }

@router.get("/fertilizer")
def get_fertilizer_plan(
    crop_type: str = "wheat",
    nitrogen: float = 80,
    phosphorus: float = 40,
    potassium: float = 60,
    area_hectares: float = 1.0,
    current_user: models.User = Depends(get_current_user)
):
    plan = []
    if nitrogen < 40:
        plan.append({"nutrient": "Nitrogen", "fertilizer": "Urea (46-0-0)", "quantity_kg": round(50 * area_hectares, 1), "timing": "Before sowing", "method": "Broadcast"})
    if phosphorus < 20:
        plan.append({"nutrient": "Phosphorus", "fertilizer": "DAP (18-46-0)", "quantity_kg": round(25 * area_hectares, 1), "timing": "At sowing", "method": "Furrow placement"})
    if potassium < 50:
        plan.append({"nutrient": "Potassium", "fertilizer": "MOP (0-0-60)", "quantity_kg": round(30 * area_hectares, 1), "timing": "Before sowing", "method": "Broadcast"})
    if not plan:
        plan.append({"nutrient": "Maintenance", "fertilizer": "NPK 20-20-20", "quantity_kg": round(25 * area_hectares, 1), "timing": "Mid season", "method": "Foliar spray"})
    return {
        "crop_type": crop_type,
        "area_hectares": area_hectares,
        "fertilizer_plan": plan,
        "total_cost_estimate_inr": round(sum(p["quantity_kg"] * 15 for p in plan), 0),
    }
