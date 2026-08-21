"""
YieldSense AI - Soil Analysis Router
Module 5: Soil quality, nutrients, fertility assessment
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.core.deps import get_current_user
from app.core.permissions import require_permission, check_farm_ownership
from typing import Optional, List

router = APIRouter(prefix="/api/v1/soil", tags=["Soil Analysis"])

class SoilInput(BaseModel):
    farm_id: int
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    humidity: Optional[float] = 60.0
    temperature: Optional[float] = 25.0
    rainfall: Optional[float] = 1000.0

@router.post("/analyze")
def analyze_soil(
    soil: SoilInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("edit_own_farms"))
):
    # Verify the farm belongs to this user (or current_user is Admin) before saving anything
    farm = db.query(models.Farm).filter(models.Farm.id == soil.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    check_farm_ownership(farm, current_user)

    # Fertility scoring
    n_score = min(100, (soil.nitrogen / 140) * 100)
    p_score = min(100, (soil.phosphorus / 80) * 100)
    k_score = min(100, (soil.potassium / 200) * 100)

    if 6.0 <= soil.ph <= 7.0:
        ph_score = 100
    elif 5.5 <= soil.ph < 6.0 or 7.0 < soil.ph <= 7.5:
        ph_score = 75
    elif 5.0 <= soil.ph < 5.5 or 7.5 < soil.ph <= 8.0:
        ph_score = 50
    else:
        ph_score = 25

    fertility_score = (n_score * 0.3 + p_score * 0.25 + k_score * 0.25 + ph_score * 0.2)

    if fertility_score >= 80:
        fertility_index = "Excellent"
        fertility_color = "green"
    elif fertility_score >= 60:
        fertility_index = "Good"
        fertility_color = "yellow"
    elif fertility_score >= 40:
        fertility_index = "Fair"
        fertility_color = "orange"
    else:
        fertility_index = "Poor"
        fertility_color = "red"

    # Crop recommendations based on soil
    suitable_crops = _get_suitable_crops(soil.nitrogen, soil.phosphorus, soil.potassium, soil.ph)

    # Deficiency analysis
    deficiencies = []
    if soil.nitrogen < 40:
        deficiencies.append({"nutrient": "Nitrogen (N)", "level": "Low", "recommendation": "Apply urea @ 50 kg/ha or ammonium sulfate"})
    elif soil.nitrogen > 140:
        deficiencies.append({"nutrient": "Nitrogen (N)", "level": "Excess", "recommendation": "Reduce N fertilizer, risk of leaching"})

    if soil.phosphorus < 20:
        deficiencies.append({"nutrient": "Phosphorus (P)", "level": "Low", "recommendation": "Apply DAP @ 25 kg/ha or SSP @ 125 kg/ha"})

    if soil.potassium < 50:
        deficiencies.append({"nutrient": "Potassium (K)", "level": "Low", "recommendation": "Apply MOP @ 30 kg/ha or SOP @ 50 kg/ha"})

    if soil.ph < 5.5:
        deficiencies.append({"nutrient": "pH Balance", "level": "Too Acidic", "recommendation": "Apply agricultural lime @ 2-3 ton/ha"})
    elif soil.ph > 7.8:
        deficiencies.append({"nutrient": "pH Balance", "level": "Too Alkaline", "recommendation": "Apply gypsum or sulfur @ 500 kg/ha"})

    ph_category = _get_ph_category(soil.ph)
    soil_health_tips = _get_health_tips(fertility_score, soil.ph)

    # ── Persist the analysis ──
    record = models.SoilAnalysis(
        farm_id=soil.farm_id,
        nitrogen=soil.nitrogen,
        phosphorus=soil.phosphorus,
        potassium=soil.potassium,
        ph=soil.ph,
        humidity=soil.humidity,
        temperature=soil.temperature,
        rainfall=soil.rainfall,
        ph_category=ph_category,
        fertility_score=round(fertility_score, 1),
        fertility_index=fertility_index,
        fertility_color=fertility_color,
        deficiencies=deficiencies,
        suitable_crops=suitable_crops,
        soil_health_tips=soil_health_tips,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "soil_ph": soil.ph,
        "ph_category": ph_category,
        "nutrients": {
            "nitrogen": {"value": soil.nitrogen, "unit": "kg/ha", "status": _status(soil.nitrogen, 40, 100, 140)},
            "phosphorus": {"value": soil.phosphorus, "unit": "kg/ha", "status": _status(soil.phosphorus, 20, 50, 80)},
            "potassium": {"value": soil.potassium, "unit": "kg/ha", "status": _status(soil.potassium, 50, 120, 200)},
        },
        "fertility_score": round(fertility_score, 1),
        "fertility_index": fertility_index,
        "fertility_color": fertility_color,
        "deficiencies": deficiencies,
        "suitable_crops": suitable_crops,
        "soil_health_tips": soil_health_tips,
    }

@router.get("/types")
def get_soil_types(current_user: models.User = Depends(get_current_user)):
    return {
        "soil_types": [
            {"type": "Alluvial", "ph_range": "6.5-8.0", "suitable_crops": ["Rice", "Wheat", "Sugarcane"], "states": ["UP", "Punjab", "Bihar"]},
            {"type": "Black (Regur)", "ph_range": "6.0-8.0", "suitable_crops": ["Cotton", "Soybean", "Wheat"], "states": ["Maharashtra", "MP", "Gujarat"]},
            {"type": "Red & Yellow", "ph_range": "5.5-7.5", "suitable_crops": ["Groundnut", "Rice", "Millets"], "states": ["Odisha", "AP", "Tamil Nadu"]},
            {"type": "Laterite", "ph_range": "4.5-6.0", "suitable_crops": ["Tea", "Coffee", "Cashew"], "states": ["Kerala", "Karnataka"]},
            {"type": "Arid & Desert", "ph_range": "7.5-9.0", "suitable_crops": ["Bajra", "Moth Bean"], "states": ["Rajasthan"]},
            {"type": "Forest & Hill", "ph_range": "5.0-7.0", "suitable_crops": ["Apple", "Tea", "Spices"], "states": ["HP", "Uttarakhand"]},
        ]
    }

@router.get("/fertility-guide")
def get_fertility_guide(current_user: models.User = Depends(get_current_user)):
    return {
        "nitrogen_guide": {"low": "< 40 kg/ha", "medium": "40-100 kg/ha", "high": "> 100 kg/ha"},
        "phosphorus_guide": {"low": "< 20 kg/ha", "medium": "20-50 kg/ha", "high": "> 50 kg/ha"},
        "potassium_guide": {"low": "< 50 kg/ha", "medium": "50-120 kg/ha", "high": "> 120 kg/ha"},
        "ph_guide": {
            "very_acidic": "< 5.0",
            "acidic": "5.0-6.0",
            "slightly_acidic": "6.0-6.5",
            "neutral": "6.5-7.0",
            "slightly_alkaline": "7.0-7.5",
            "alkaline": "7.5-8.5",
            "very_alkaline": "> 8.5",
            "optimal_range": "6.0-7.0",
        },
    }

@router.post("/crop-recommendation")
def recommend_crops(
    soil: SoilInput,
    current_user: models.User = Depends(get_current_user)
):
    crops = _get_suitable_crops(soil.nitrogen, soil.phosphorus, soil.potassium, soil.ph)
    return {
        "recommended_crops": crops,
        "soil_summary": {
            "ph": soil.ph,
            "nitrogen": soil.nitrogen,
            "phosphorus": soil.phosphorus,
            "potassium": soil.potassium,
        },
        "planting_advice": "Plant during optimal season for best results.",
    }


@router.get("/history", response_model=List[schemas.SoilAnalysisOut])
def get_soil_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("view_own_farms"))
):
    query = db.query(models.SoilAnalysis).join(models.Farm)
    if current_user.role != "Admin":
        query = query.filter(models.Farm.user_id == current_user.id)
    return query.order_by(models.SoilAnalysis.created_at.desc()).all()


@router.get("/history/{farm_id}", response_model=List[schemas.SoilAnalysisOut])
def get_farm_soil_history(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("view_own_farms"))
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    check_farm_ownership(farm, current_user)

    return (
        db.query(models.SoilAnalysis)
        .filter(models.SoilAnalysis.farm_id == farm_id)
        .order_by(models.SoilAnalysis.created_at.desc())
        .all()
    )


# ── NEW: friendly soil health score, with trend vs previous analysis ──
@router.get("/health-score/{farm_id}")
def get_soil_health_score(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_permission("view_own_farms")),
):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    check_farm_ownership(farm, current_user)

    analyses = (
        db.query(models.SoilAnalysis)
        .filter(models.SoilAnalysis.farm_id == farm_id)
        .order_by(models.SoilAnalysis.created_at.desc())
        .limit(2)
        .all()
    )

    if not analyses:
        return {"farm_id": farm_id, "score": None, "note": "No soil analysis yet for this farm"}

    latest = analyses[0]
    previous = analyses[1] if len(analyses) > 1 else None

    trend = None
    if previous is not None and latest.fertility_score is not None and previous.fertility_score is not None:
        diff = round(latest.fertility_score - previous.fertility_score, 2)
        trend = {"direction": "up" if diff > 0 else "down" if diff < 0 else "flat", "change": diff}

    return {
        "farm_id": farm_id,
        "score": latest.fertility_score,
        "index": latest.fertility_index,
        "color": latest.fertility_color,
        "ph_category": latest.ph_category,
        "deficiencies": latest.deficiencies,
        "tips": latest.soil_health_tips,
        "as_of": latest.created_at.isoformat(),
        "trend": trend,
    }


def _status(val, low, med, high):
    if val < low: return "Low"
    elif val <= med: return "Optimal"
    elif val <= high: return "High"
    else: return "Excess"

def _get_ph_category(ph):
    if ph < 5.0: return "Very Acidic"
    elif ph < 6.0: return "Acidic"
    elif ph < 6.5: return "Slightly Acidic"
    elif ph <= 7.0: return "Neutral"
    elif ph <= 7.5: return "Slightly Alkaline"
    elif ph <= 8.5: return "Alkaline"
    else: return "Very Alkaline"

def _get_suitable_crops(n, p, k, ph):
    crops = []
    if 6.0 <= ph <= 7.5 and n > 40:
        crops.extend(["Wheat", "Rice", "Maize"])
    if ph <= 6.5 and k > 80:
        crops.extend(["Tea", "Coffee", "Potato"])
    if 6.5 <= ph <= 8.0 and p > 30:
        crops.extend(["Cotton", "Soybean", "Groundnut"])
    if not crops:
        crops = ["Millets", "Sorghum", "Bajra"]
    return list(set(crops))[:6]

def _get_health_tips(score, ph):
    tips = []
    if score < 60:
        tips.append("Add organic compost or vermicompost to improve soil structure")
        tips.append("Practice crop rotation to restore nutrient balance")
    if ph < 6.0:
        tips.append("Apply lime to correct soil acidity")
    if ph > 7.5:
        tips.append("Add organic matter to buffer alkalinity")
    tips.append("Test soil every season for accurate nutrient management")
    tips.append("Use green manure crops to enhance nitrogen fixation")
    return tips