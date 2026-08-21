"""
YieldSense AI  -  Notification Model

Domain model for notifications stored in Firestore.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from app.utils.helpers import utc_now


@dataclass
class Notification:
    """Represents a notification in the system."""

    id: str = ""
    user_id: str = ""
    title: str = ""
    message: str = ""
    type: str = "info"  # 'info', 'success', 'warning', 'error'
    is_read: bool = False
    link: Optional[str] = None
    created_at: datetime = field(default_factory=utc_now)

    def to_dict(self) -> dict:
        """Convert to Firestore-compatible dictionary."""
        return {
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "link": self.link,
            "created_at": self.created_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict, doc_id: str = "") -> "Notification":
        """Create a Notification from a Firestore document dictionary."""
        return cls(
            id=doc_id or data.get("id", ""),
            user_id=data.get("user_id", ""),
            title=data.get("title", ""),
            message=data.get("message", ""),
            type=data.get("type", "info"),
            is_read=data.get("is_read", False),
            link=data.get("link"),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else utc_now(),
        )
