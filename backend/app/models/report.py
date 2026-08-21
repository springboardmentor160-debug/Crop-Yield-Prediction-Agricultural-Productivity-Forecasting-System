"""
YieldSense AI  -  Report Model

Domain model for generated reports stored in Firestore.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from app.utils.helpers import utc_now_iso


@dataclass
class Report:
    """Represents a generated report record in Firestore."""

    user_id: str
    title: str
    report_type: str  # 'prediction', 'farm', 'seasonal', 'custom'
    status: str = "generated"  # 'generating', 'generated', 'failed'
    farm_id: Optional[str] = None
    farm_name: Optional[str] = None
    prediction_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None  # Serialized report payload
    created_at: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> dict:
        """Convert to Firestore-compatible dictionary."""
        return {
            "user_id": self.user_id,
            "title": self.title,
            "report_type": self.report_type,
            "status": self.status,
            "farm_id": self.farm_id,
            "farm_name": self.farm_name,
            "prediction_id": self.prediction_id,
            "data": self.data or {},
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Report":
        """Create from Firestore document dictionary."""
        return cls(
            user_id=data.get("user_id", ""),
            title=data.get("title", ""),
            report_type=data.get("report_type", "prediction"),
            status=data.get("status", "generated"),
            farm_id=data.get("farm_id"),
            farm_name=data.get("farm_name"),
            prediction_id=data.get("prediction_id"),
            data=data.get("data", {}),
            created_at=data.get("created_at", utc_now_iso()),
        )
