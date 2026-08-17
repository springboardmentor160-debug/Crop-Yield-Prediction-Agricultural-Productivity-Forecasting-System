from fastapi import APIRouter, Depends
from app.models import SoilAnalysisRequest
from app.services.prediction_service import get_soil_analysis
from app.auth_handler import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Soil Analysis"])

@router.post("/soil-analysis")
@router.post("/soil/analyze")
def post_soil_analysis(payload: SoilAnalysisRequest, current_user: dict = Depends(get_current_user)):
    ph = payload.get_ph()
    return get_soil_analysis(ph, payload.nitrogen, payload.phosphorus, payload.potassium, payload.organic_matter)
