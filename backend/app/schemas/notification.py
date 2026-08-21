"""
YieldSense AI  -  Notification Schemas

Pydantic models for notification response validation.
"""

from typing import List, Optional

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    """Schema for a single notification."""

    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: str


class NotificationListResponse(BaseModel):
    """Schema for notification list response."""

    notifications: List[NotificationResponse]
    unread_count: int
