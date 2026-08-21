"""
YieldSense AI  -  Admin API Endpoints

System administration endpoints for system metrics, user management, and system-wide audit.
"""

from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user_id
from app.services.admin_service import AdminService
from app.utils.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/admin", tags=["Admin"])


class RoleUpdateRequest(BaseModel):
    role: str


@router.get("/stats", summary="Get system administration metrics")
async def get_admin_stats(user_id: str = Depends(get_current_user_id)):
    """Get system-wide metrics for the Admin Control Center."""
    try:
        svc = AdminService()
        return svc.get_system_stats(user_id)
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin stats error: {str(e)}")


@router.get("/users", summary="List all platform users")
async def list_users(user_id: str = Depends(get_current_user_id)):
    """List all registered users in the platform."""
    try:
        svc = AdminService()
        return svc.list_all_users(user_id)
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing users: {str(e)}")


@router.get("/predictions", summary="List system-wide prediction activity")
async def list_system_predictions(user_id: str = Depends(get_current_user_id)):
    """Get recent prediction history across all users."""
    try:
        svc = AdminService()
        return svc.list_system_predictions(user_id)
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing predictions: {str(e)}")


@router.put("/users/{target_uid}/role", summary="Update user role")
async def update_user_role(
    target_uid: str,
    request: RoleUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update a user's role (farmer or admin)."""
    try:
        svc = AdminService()
        return svc.update_user_role(user_id, target_uid, request.role)
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating role: {str(e)}")
