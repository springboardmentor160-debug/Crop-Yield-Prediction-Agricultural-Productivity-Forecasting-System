"""
YieldSense AI  -  Prediction History API Endpoints
"""

import math

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_current_user_id
from app.schemas.report import PredictionHistoryItem, PredictionHistoryResponse
from app.schemas.auth import MessageResponse
from app.services.history_service import HistoryService
from app.utils.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/history", tags=["Prediction History"])


@router.get("/", response_model=PredictionHistoryResponse, summary="List prediction history")
async def list_history(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    user_id: str = Depends(get_current_user_id),
):
    """Get paginated prediction history for the authenticated user (most recent first)."""
    svc = HistoryService()
    records, total = svc.get_history(user_id, page=page, limit=limit)
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PredictionHistoryResponse(
        predictions=records,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get("/{prediction_id}", response_model=PredictionHistoryItem, summary="Get single prediction")
async def get_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single prediction history record by ID."""
    try:
        svc = HistoryService()
        record = svc.get_prediction(prediction_id, user_id)
        return PredictionHistoryItem(**record)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching prediction: {str(e)}")


@router.delete("/{prediction_id}", response_model=MessageResponse, summary="Delete prediction record")
async def delete_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a prediction history record."""
    try:
        svc = HistoryService()
        result = svc.delete_prediction(prediction_id, user_id)
        return MessageResponse(message=result["message"], success=True)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting prediction: {str(e)}")
