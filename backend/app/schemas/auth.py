"""
YieldSense AI  -  Auth Schemas

Pydantic models for authentication request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128, description="User password (min 6 chars)")
    display_name: str = Field(..., min_length=1, max_length=100, description="User display name")
    role: str = Field(default="farmer", pattern=r"^(farmer|admin)$", description="User role")


class LoginRequest(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str = Field(..., min_length=1, description="User password")


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""

    email: EmailStr


class AuthResponse(BaseModel):
    """Schema for authentication response."""

    uid: str
    email: str
    display_name: str
    role: str
    token: str


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str
    success: bool = True
