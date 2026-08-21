"""
YieldSense AI  -  Notification Endpoints

Notification routes: list and mark as read.
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.notification import NotificationListResponse
from app.schemas.auth import MessageResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=NotificationListResponse, summary="List notifications")
async def list_notifications(user_id: str = Depends(get_current_user_id)):
    """Get all notifications for the authenticated user."""
    service = NotificationService()
    notifications, unread_count = service.get_notifications(user_id)
    return NotificationListResponse(
        notifications=notifications,
        unread_count=unread_count,
    )


@router.put("/{notification_id}/read", response_model=MessageResponse, summary="Mark as read")
async def mark_notification_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Mark a specific notification as read."""
    service = NotificationService()
    service.mark_as_read(notification_id, user_id)
    return MessageResponse(message="Notification marked as read", success=True)
