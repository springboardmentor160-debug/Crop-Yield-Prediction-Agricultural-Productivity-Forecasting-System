"""
YieldSense AI  -  Farm Endpoints

Farm CRUD routes with pagination and stats.
"""

import math
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user_id
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse, FarmListResponse
from app.schemas.auth import MessageResponse
from app.services.farm_service import FarmService

router = APIRouter(prefix="/farms", tags=["Farms"])


@router.get("/", response_model=FarmListResponse, summary="List user farms")
async def list_farms(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=10, ge=1, le=100, description="Items per page"),
    user_id: str = Depends(get_current_user_id),
):
    """Get a paginated list of the authenticated user's farms."""
    service = FarmService()
    farms, total = service.get_farms(user_id, page=page, limit=limit)
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return FarmListResponse(
        farms=farms,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.post("/", response_model=FarmResponse, status_code=201, summary="Create a farm")
async def create_farm(
    request: FarmCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new farm for the authenticated user."""
    service = FarmService()
    return service.create_farm(user_id, request.model_dump())


@router.get("/stats", summary="Get farm statistics")
async def get_farm_stats(user_id: str = Depends(get_current_user_id)):
    """Get aggregate statistics about the authenticated user's farms."""
    service = FarmService()
    return service.get_farm_stats(user_id)


@router.get("/{farm_id}", response_model=FarmResponse, summary="Get farm details")
async def get_farm(
    farm_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get details of a specific farm (must be owned by the authenticated user)."""
    service = FarmService()
    return service.get_farm(farm_id, user_id)


@router.put("/{farm_id}", response_model=FarmResponse, summary="Update a farm")
async def update_farm(
    farm_id: str,
    request: FarmUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Update an existing farm (must be owned by the authenticated user)."""
    service = FarmService()
    return service.update_farm(farm_id, user_id, request.model_dump())


@router.delete("/{farm_id}", response_model=MessageResponse, summary="Delete a farm")
async def delete_farm(
    farm_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Soft-delete a farm (must be owned by the authenticated user)."""
    service = FarmService()
    result = service.delete_farm(farm_id, user_id)
    return MessageResponse(message=result["message"], success=True)
