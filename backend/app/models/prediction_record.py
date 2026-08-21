"""
YieldSense AI  -  Prediction Record Model

Domain model for full prediction history records stored in Firestore.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from app.utils.helpers import utc_now_iso


@dataclass
class PredictionRecord:
    """Represents a saved prediction in the history collection."""

    user_id: str
    crop: str
    season: str
    state: str
    area: float
    temperature: float
    annual_rainfall: float
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    predicted_yield: float
    total_production: float
    prediction_unit: str
    model_used: str
    confidence: str
    model_accuracy: Optional[float] = None
    humidity: Optional[float] = None
    fertilizer_usage: float = 100.0
    pesticide_usage: float = 10.0
    farm_id: Optional[str] = None
    farm_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    weather_summary: Optional[Dict[str, Any]] = None
    soil_summary: Optional[Dict[str, Any]] = None
    created_at: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> dict:
        """Convert to Firestore-compatible dictionary."""
        return {
            "user_id": self.user_id,
            "farm_id": self.farm_id,
            "farm_name": self.farm_name,
            "crop": self.crop,
            "season": self.season,
            "state": self.state,
            "area": self.area,
            "temperature": self.temperature,
            "annual_rainfall": self.annual_rainfall,
            "humidity": self.humidity,
            "soil_ph": self.soil_ph,
            "nitrogen": self.nitrogen,
            "phosphorus": self.phosphorus,
            "potassium": self.potassium,
            "fertilizer_usage": self.fertilizer_usage,
            "pesticide_usage": self.pesticide_usage,
            "predicted_yield": self.predicted_yield,
            "total_production": self.total_production,
            "prediction_unit": self.prediction_unit,
            "model_used": self.model_used,
            "confidence": self.confidence,
            "model_accuracy": self.model_accuracy,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "risk_level": self.risk_level,
            "risk_score": self.risk_score,
            "weather_summary": self.weather_summary,
            "soil_summary": self.soil_summary,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "PredictionRecord":
        """Create from Firestore document dictionary."""
        return cls(
            user_id=data.get("user_id", ""),
            farm_id=data.get("farm_id"),
            farm_name=data.get("farm_name"),
            crop=data.get("crop", ""),
            season=data.get("season", "Kharif"),
            state=data.get("state", "Unknown"),
            area=data.get("area", 0.0),
            temperature=data.get("temperature", 0.0),
            annual_rainfall=data.get("annual_rainfall", 0.0),
            humidity=data.get("humidity"),
            soil_ph=data.get("soil_ph", 7.0),
            nitrogen=data.get("nitrogen", 0.0),
            phosphorus=data.get("phosphorus", 0.0),
            potassium=data.get("potassium", 0.0),
            fertilizer_usage=data.get("fertilizer_usage", 100.0),
            pesticide_usage=data.get("pesticide_usage", 10.0),
            predicted_yield=data.get("predicted_yield", 0.0),
            total_production=data.get("total_production", 0.0),
            prediction_unit=data.get("prediction_unit", "tons/hectare"),
            model_used=data.get("model_used", ""),
            confidence=data.get("confidence", ""),
            model_accuracy=data.get("model_accuracy"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            risk_level=data.get("risk_level"),
            risk_score=data.get("risk_score"),
            weather_summary=data.get("weather_summary"),
            soil_summary=data.get("soil_summary"),
            created_at=data.get("created_at", utc_now_iso()),
        )
