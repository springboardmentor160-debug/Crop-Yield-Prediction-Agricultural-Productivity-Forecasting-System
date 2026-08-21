"""
YieldSense AI  -  User Model

Domain model for user data stored in Firestore.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from app.utils.helpers import utc_now


@dataclass
class User:
    """Represents a user in the system."""

    uid: str
    email: str
    display_name: str
    role: str = "farmer"  # 'farmer' or 'admin'
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    is_active: bool = True

    def to_dict(self) -> dict:
        """Convert to Firestore-compatible dictionary."""
        return {
            "uid": self.uid,
            "email": self.email,
            "display_name": self.display_name,
            "role": self.role,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_active": self.is_active,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        """Create a User from a Firestore document dictionary."""
        return cls(
            uid=data.get("uid", ""),
            email=data.get("email", ""),
            display_name=data.get("display_name", ""),
            role=data.get("role", "farmer"),
            phone=data.get("phone"),
            avatar_url=data.get("avatar_url"),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else utc_now(),
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else utc_now(),
            is_active=data.get("is_active", True),
        )
