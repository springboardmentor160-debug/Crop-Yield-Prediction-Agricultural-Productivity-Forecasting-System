from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class NPKPayload(BaseModel):
    n: float
    p: float
    k: float
    ph: float

@router.post("/recommendations")
async def get_recommendations(payload: NPKPayload):
    recommendations = []
    
    # pH logic
    if payload.ph < 5.5:
        recommendations.append("Soil is highly acidic. Apply agricultural lime.")
    elif payload.ph > 7.5:
        recommendations.append("Soil is highly alkaline. Apply sulfur or organic matter.")
    else:
        recommendations.append("Soil pH is optimal.")
        
    # NPK logic
    if payload.n < 30:
        recommendations.append("Low Nitrogen detected. Apply Urea or NPK (20-10-10) during early growth.")
    if payload.p < 20:
        recommendations.append("Low Phosphorus detected. Apply Triple Superphosphate (TSP) to support root growth.")
    if payload.k < 20:
        recommendations.append("Low Potassium detected. Apply Muriate of Potash (MOP) to improve stress tolerance.")
        
    return {"recommendations": recommendations}

@router.get("/recommendations")
def get_recommendations_summary(farm_id: int = 1):
    from ..recommendation import generate_recommendation, assess_risk, get_farm_data
    data = get_farm_data(farm_id)
    tips = generate_recommendation(
        soil_ph=data.soil_ph,
        predicted_yield=data.predicted_yield,
        avg_yield=data.avg_yield,
        rainfall_deviation=data.rainfall_deviation
    )
    risk_level = assess_risk(
        predicted_yield=data.predicted_yield,
        avg_yield=data.avg_yield,
        rainfall_deviation=data.rainfall_deviation,
        soil_ph=data.soil_ph
    )
    return {
        "recommendations": tips,
        "risk_level": risk_level
    }

