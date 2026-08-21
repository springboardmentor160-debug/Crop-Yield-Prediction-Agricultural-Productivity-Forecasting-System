"""
YieldSense AI  -  Risk Assessment API Endpoints
"""

from fastapi import APIRouter, HTTPException

from app.schemas.risk import RiskAssessmentRequest, RiskAssessmentResponse
from app.services.risk_service import assess_risk

router = APIRouter(prefix="/risk", tags=["Risk Assessment"])


@router.post("/assess", response_model=RiskAssessmentResponse, summary="Assess agricultural risk")
async def assess_risk_endpoint(request: RiskAssessmentRequest):
    """
    Assess agricultural risk based on environmental and soil parameters.

    Detects 10 risk categories:
    - Low/High Rainfall, Drought, Flood
    - Heat/Cold Stress
    - Poor Soil pH (Acidic/Alkaline)
    - Low Nitrogen, Phosphorus, Potassium
    - Compound Risk (multiple co-existing risks)

    Returns risk level, score, per-risk mitigations, and priority actions.
    """
    try:
        result = assess_risk(request.model_dump())
        return RiskAssessmentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk assessment error: {str(e)}")
