"""
YieldSense AI  -  Auth Endpoints

Authentication routes: register, login, logout, forgot-password.
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, summary="Register a new user")
async def register(request: RegisterRequest):
    """
    Register a new user account.

    Creates a Firebase Auth user and a corresponding Firestore user document.
    Returns authentication token for immediate login.
    """
    service = AuthService()
    result = await service.register(
        email=request.email,
        password=request.password,
        display_name=request.display_name,
        role=request.role,
    )
    return result


@router.post("/login", response_model=AuthResponse, summary="Login")
async def login(request: LoginRequest):
    """
    Authenticate a user with email and password.

    Returns authentication token for subsequent API calls.
    """
    service = AuthService()
    result = await service.login(email=request.email, password=request.password)
    return result


@router.post("/logout", response_model=MessageResponse, summary="Logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout the current user.

    The actual token invalidation happens client-side.
    This endpoint acknowledges the logout and can be extended for server-side cleanup.
    """
    return MessageResponse(message="Logged out successfully", success=True)


@router.post("/forgot-password", response_model=MessageResponse, summary="Forgot password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Send a password reset email.

    For security, always returns success regardless of whether the email exists.
    """
    service = AuthService()
    result = await service.forgot_password(email=request.email)
    return MessageResponse(message=result["message"], success=True)
