"""
YieldSense AI  -  Recommendations API Endpoints

Provides endpoints for:
  POST /recommendations/        -  generate agronomy recommendations from manual input
  GET  /recommendations/farm/{farm_id}  -  farm-linked advisory (auth-gated, ownership-validated)
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user_id, get_db
from app.schemas.recommendation import RecommendationEngineRequest, RecommendationEngineResponse
from app.schemas.farm_advisory import FarmAdvisoryResponse
from app.services.recommendation_service import generate_recommendations
from app.services.farm_advisory_service import get_farm_advisory
from app.utils.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


# ============================================================
# Manual Input Recommendation Endpoint
# ============================================================

@router.post(
    "/",
    response_model=RecommendationEngineResponse,
    summary="Generate agricultural recommendations (manual input)",
)
async def post_recommendations(request: RecommendationEngineRequest):
    """
    Generate comprehensive agricultural recommendations based on crop,
    environmental conditions, and soil parameters.

    Returns:
    - Crop alternatives with suitability ratings
    - Fertilizer corrections (NPK) with application rates
    - Irrigation advice
    - Harvest suggestions
    - Season planning
    - Best farming practices
    - Yield improvement tips
    """
    try:
        result = generate_recommendations(request.model_dump())
        return RecommendationEngineResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


# ============================================================
# Farm-linked Advisory Endpoint
# ============================================================

@router.get(
    "/farm/{farm_id}",
    response_model=FarmAdvisoryResponse,
    summary="Get farm advisory  -  recommendations + risk assessment",
)
async def get_farm_advisory_endpoint(
    farm_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    """
    Generate a farm-specific recommendation and risk advisory.

    Reads from the farmer's stored data:
    - Farm soil pH, crop type (from farm document)
    - Predicted yield, historical average yield (from prediction history)
    - Annual rainfall deviation from crop baseline (from prediction history)

    Returns:
    - Plain-English recommendations (individually, not as a paragraph)
    - Risk level: Low / Medium / High
    - Risk score and explanation
    - Identified risks with type, severity, reason, and advice
    - Data source transparency (which data was available)

    Security:
    - Requires valid Firebase ID token.
    - Farm ownership is validated  -  users cannot access other users' farms.
    """
    try:
        result = get_farm_advisory(farm_id=farm_id, user_id=user_id, db=db)
        return FarmAdvisoryResponse(**result)
    except (NotFoundException, ForbiddenException):
        raise  # Already correct HTTP exceptions with proper status codes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Advisory generation failed: {str(e)}",
        )
