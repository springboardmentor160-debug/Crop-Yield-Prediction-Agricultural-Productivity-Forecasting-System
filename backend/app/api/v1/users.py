"""
YieldSense AI  -  User Endpoints

User profile routes: get and update profile.
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse, summary="Get current user profile")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    """Get the authenticated user's profile."""
    service = UserService()
    return service.get_profile(user_id)


@router.put("/profile", response_model=UserResponse, summary="Update current user profile")
async def update_profile(
    request: UserUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Update the authenticated user's profile fields."""
    service = UserService()
    return service.update_profile(user_id, request.model_dump())
