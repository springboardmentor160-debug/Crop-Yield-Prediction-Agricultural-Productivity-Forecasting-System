"""
YieldSense AI  -  API Dependencies

FastAPI dependency injection functions for authentication and database access.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import verify_firebase_token
from app.firebase.firestore import get_firestore_client

# Security scheme for OpenAPI documentation
security_scheme = HTTPBearer(
    scheme_name="Firebase Auth",
    description="Firebase ID token for authentication",
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """
    Dependency to extract and verify the Firebase ID token.

    Returns:
        Decoded token claims dictionary (contains uid, email, etc.).
    """
    token = credentials.credentials
    return verify_firebase_token(token)


async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> str:
    """
    Dependency to extract just the user ID from the token.

    Returns:
        Firebase UID string.
    """
    return current_user["uid"]


def get_db():
    """Dependency to get the Firestore client."""
    return get_firestore_client()
