"""
YieldSense AI  -  Soil Analysis Endpoints

Soil health analysis routes.
"""

from fastapi import APIRouter

from app.schemas.soil import SoilAnalysisRequest, SoilAnalysisResponse
from app.services.soil_service import analyze_soil

router = APIRouter(prefix="/soil", tags=["Soil Analysis"])


@router.post("/analyze", response_model=SoilAnalysisResponse, summary="Analyze soil health")
async def analyze_soil_endpoint(request: SoilAnalysisRequest):
    """
    Analyze soil health based on pH, NPK values, and optional crop type.

    Returns:
        Health score (0-100), nutrient ratings, suitability,
        warnings, and improvement suggestions.
    """
    result = analyze_soil(
        soil_ph=request.soil_ph,
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
        moisture=request.moisture,
        organic_matter=request.organic_matter,
        crop=request.crop,
    )
    return SoilAnalysisResponse(**result)
