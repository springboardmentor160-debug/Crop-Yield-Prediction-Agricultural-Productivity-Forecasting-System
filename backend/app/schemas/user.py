"""
YieldSense AI  -  User Schemas

Pydantic models for user profile request/response validation.
"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    """Schema for user profile response."""

    uid: str
    email: str
    display_name: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: str
    updated_at: str
    is_active: bool


class UserUpdate(BaseModel):
    """Schema for user profile update."""

    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = Field(None, max_length=500)
