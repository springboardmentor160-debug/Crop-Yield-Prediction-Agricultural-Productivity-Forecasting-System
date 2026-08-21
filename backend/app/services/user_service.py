"""
YieldSense AI  -  User Service

Business logic for user profile operations.
"""

from app.firebase.firestore import get_firestore_client, USERS_COLLECTION
from app.utils.exceptions import NotFoundException
from app.utils.helpers import utc_now_iso


class UserService:
    """Handles user profile business logic."""

    def __init__(self):
        self.db = get_firestore_client()

    def get_profile(self, user_id: str) -> dict:
        """
        Get a user's profile from Firestore.

        Args:
            user_id: Firebase UID.

        Returns:
            User profile dictionary.
        """
        doc = self.db.collection(USERS_COLLECTION).document(user_id).get()

        from app.models.user import User

        if not doc.exists:
            # Self-healing: auto-create user document if it exists in Firebase Auth
            try:
                import firebase_admin.auth as firebase_auth
                
                # Fetch user details from Firebase Auth
                fb_user = firebase_auth.get_user(user_id)
                display_name = fb_user.display_name or fb_user.email.split('@')[0]
                
                # Create profile using User domain model
                user = User(
                    uid=user_id,
                    email=fb_user.email,
                    display_name=display_name,
                    role="farmer"
                )
                profile_data = user.to_dict()
                
                # Save to Firestore
                self.db.collection(USERS_COLLECTION).document(user_id).set(profile_data)
                return profile_data
            except Exception:
                raise NotFoundException(resource="User", resource_id=user_id)

        # Document exists, load and pass through User domain model to ensure schema defaults
        data = doc.to_dict()
        data["uid"] = user_id
        return User.from_dict(data).to_dict()

    def update_profile(self, user_id: str, update_data: dict) -> dict:
        """
        Update a user's profile in Firestore.

        Args:
            user_id: Firebase UID.
            update_data: Dictionary of fields to update.

        Returns:
            Updated user profile dictionary.
        """
        doc_ref = self.db.collection(USERS_COLLECTION).document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise NotFoundException(resource="User", resource_id=user_id)

        # Filter out None values and add timestamp
        filtered_data = {k: v for k, v in update_data.items() if v is not None}
        filtered_data["updated_at"] = utc_now_iso()

        doc_ref.update(filtered_data)

        # Return updated profile
        return self.get_profile(user_id)
