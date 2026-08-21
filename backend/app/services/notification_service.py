"""
YieldSense AI  -  Notification Service

Business logic for notification operations.
"""

from typing import List, Tuple

from app.firebase.firestore import get_firestore_client, NOTIFICATIONS_COLLECTION
from app.models.notification import Notification
from app.utils.helpers import utc_now_iso


class NotificationService:
    """Handles notification business logic."""

    def __init__(self):
        self.db = get_firestore_client()

    def get_notifications(self, user_id: str) -> Tuple[List[dict], int]:
        """
        Get all notifications for a user, ordered by most recent first.

        Args:
            user_id: Firebase UID.

        Returns:
            Tuple of (list of notification dicts, unread count).
        """
        query = self.db.collection(NOTIFICATIONS_COLLECTION).where("user_id", "==", user_id)

        docs = list(query.stream())
        all_notifs = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            all_notifs.append(data)

        all_notifs.sort(key=lambda n: n.get("created_at", ""), reverse=True)

        notifications = []
        unread_count = 0

        for data in all_notifs[:50]:
            notifications.append(data)
            if not data.get("is_read", False):
                unread_count += 1

        return notifications, unread_count


    def mark_as_read(self, notification_id: str, user_id: str) -> dict:
        """
        Mark a notification as read.

        Args:
            notification_id: Notification document ID.
            user_id: Firebase UID (for ownership check).

        Returns:
            Updated notification.
        """
        doc_ref = self.db.collection(NOTIFICATIONS_COLLECTION).document(notification_id)
        doc = doc_ref.get()

        if doc.exists and doc.to_dict().get("user_id") == user_id:
            doc_ref.update({"is_read": True})

        return {"message": "Notification marked as read"}

    def create_notification(self, user_id: str, title: str, message: str,
                          notification_type: str = "info", link: str = None) -> dict:
        """
        Create a new notification for a user.

        Args:
            user_id: Target user's Firebase UID.
            title: Notification title.
            message: Notification message.
            notification_type: Type ('info', 'success', 'warning', 'error').
            link: Optional link for the notification.

        Returns:
            Created notification dictionary.
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            link=link,
        )

        doc_ref = self.db.collection(NOTIFICATIONS_COLLECTION).add(notification.to_dict())
        result = notification.to_dict()
        result["id"] = doc_ref[1].id
        return result
