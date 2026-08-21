"""
YieldSense AI  -  Auth Service

Business logic for authentication operations.
Interacts with Firebase Auth and Firestore.
"""

import httpx
from firebase_admin import auth

from app.core.config import get_settings
from app.firebase.firestore import get_firestore_client, USERS_COLLECTION
from app.models.user import User
from app.utils.exceptions import BadRequestException, FirebaseAuthException, ConflictException
from app.utils.helpers import utc_now_iso


class AuthService:
    """Handles authentication business logic."""

    def __init__(self):
        self.db = get_firestore_client()
        self.settings = get_settings()

    async def register(self, email: str, password: str, display_name: str, role: str = "farmer") -> dict:
        """
        Register a new user with Firebase Auth and create a Firestore user document.

        Args:
            email: User's email address.
            password: User's password.
            display_name: User's display name.
            role: User's role ('farmer' or 'admin').

        Returns:
            Dictionary with user info and authentication token.
        """
        try:
            # Create Firebase Auth user
            firebase_user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
            )
        except auth.EmailAlreadyExistsError:
            raise ConflictException(detail="An account with this email already exists")
        except Exception as e:
            raise BadRequestException(detail=f"Failed to create account: {str(e)}")

        # Create Firestore user document
        user = User(
            uid=firebase_user.uid,
            email=email,
            display_name=display_name,
            role=role,
        )

        self.db.collection(USERS_COLLECTION).document(firebase_user.uid).set(user.to_dict())

        # Generate custom token for immediate login
        custom_token = auth.create_custom_token(firebase_user.uid)

        # Exchange custom token for ID token via Firebase REST API
        id_token = await self._exchange_custom_token(custom_token.decode("utf-8"))

        return {
            "uid": firebase_user.uid,
            "email": email,
            "display_name": display_name,
            "role": role,
            "token": id_token,
        }

    async def login(self, email: str, password: str) -> dict:
        """
        Authenticate a user via Firebase REST API.

        Args:
            email: User's email address.
            password: User's password.

        Returns:
            Dictionary with user info and authentication token.
        """
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={self.settings.FIREBASE_WEB_API_KEY}"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "email": email,
                    "password": password,
                    "returnSecureToken": True,
                },
            )

        if response.status_code != 200:
            error_message = response.json().get("error", {}).get("message", "Authentication failed")
            if "EMAIL_NOT_FOUND" in error_message:
                raise FirebaseAuthException(detail="No account found with this email")
            elif "INVALID_PASSWORD" in error_message:
                raise FirebaseAuthException(detail="Invalid password")
            elif "USER_DISABLED" in error_message:
                raise FirebaseAuthException(detail="This account has been disabled")
            else:
                raise FirebaseAuthException(detail="Authentication failed. Please check your credentials.")

        data = response.json()
        uid = data["localId"]

        # Get user profile from Firestore
        user_doc = self.db.collection(USERS_COLLECTION).document(uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}

        return {
            "uid": uid,
            "email": data["email"],
            "display_name": user_data.get("display_name", data.get("displayName", "")),
            "role": user_data.get("role", "farmer"),
            "token": data["idToken"],
        }

    async def forgot_password(self, email: str) -> dict:
        """
        Send a password reset email.

        Args:
            email: User's email address.

        Returns:
            Success message.
        """
        try:
            # Verify the user exists
            auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            # Don't reveal whether the email exists for security
            return {"message": "If an account exists with this email, a password reset link has been sent."}

        # Send password reset email via Firebase REST API
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={self.settings.FIREBASE_WEB_API_KEY}"

        async with httpx.AsyncClient() as client:
            await client.post(
                url,
                json={
                    "requestType": "PASSWORD_RESET",
                    "email": email,
                },
            )

        return {"message": "If an account exists with this email, a password reset link has been sent."}

    async def _exchange_custom_token(self, custom_token: str) -> str:
        """Exchange a Firebase custom token for an ID token."""
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={self.settings.FIREBASE_WEB_API_KEY}"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "token": custom_token,
                    "returnSecureToken": True,
                },
            )

        if response.status_code != 200:
            raise FirebaseAuthException(detail="Failed to generate authentication token")

        return response.json()["idToken"]
