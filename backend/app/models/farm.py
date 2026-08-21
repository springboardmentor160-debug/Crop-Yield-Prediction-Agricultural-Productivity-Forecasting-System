"""
YieldSense AI  -  Farm Model

Domain model for farm data stored in Firestore.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from app.utils.helpers import utc_now


@dataclass
class Farm:
    """Represents a farm in the system."""

    id: str = ""
    user_id: str = ""
    name: str = ""
    location: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    area: float = 0.0
    crop: str = ""
    soil_ph: float = 7.0
    nitrogen: float = 0.0
    phosphorus: float = 0.0
    potassium: float = 0.0
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    is_deleted: bool = False

    def to_dict(self) -> dict:
        """Convert to Firestore-compatible dictionary."""
        return {
            "user_id": self.user_id,
            "name": self.name,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "area": self.area,
            "crop": self.crop,
            "soil_ph": self.soil_ph,
            "nitrogen": self.nitrogen,
            "phosphorus": self.phosphorus,
            "potassium": self.potassium,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_deleted": self.is_deleted,
        }

    @classmethod
    def from_dict(cls, data: dict, doc_id: str = "") -> "Farm":
        """Create a Farm from a Firestore document dictionary."""
        return cls(
            id=doc_id or data.get("id", ""),
            user_id=data.get("user_id", ""),
            name=data.get("name", ""),
            location=data.get("location", ""),
            latitude=data.get("latitude", 0.0),
            longitude=data.get("longitude", 0.0),
            area=data.get("area", 0.0),
            crop=data.get("crop", ""),
            soil_ph=data.get("soil_ph", 7.0),
            nitrogen=data.get("nitrogen", 0.0),
            phosphorus=data.get("phosphorus", 0.0),
            potassium=data.get("potassium", 0.0),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else utc_now(),
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else utc_now(),
            is_deleted=data.get("is_deleted", False),
        )
