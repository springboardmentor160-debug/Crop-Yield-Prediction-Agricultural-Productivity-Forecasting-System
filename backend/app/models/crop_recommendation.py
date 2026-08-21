from datetime import UTC, datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    farm_id = Column(
        Integer,
        ForeignKey(
            "farms.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # Farm snapshot
    farm_name = Column(
        String(120),
        nullable=False,
    )

    state = Column(
        String(120),
        nullable=False,
        index=True,
    )

    area_hectares = Column(
        Float,
        nullable=False,
    )

    # Recommendation inputs
    crop_year = Column(
        Integer,
        nullable=False,
        index=True,
    )

    season = Column(
        String(50),
        nullable=False,
        index=True,
    )

    # Soil snapshot
    nitrogen = Column(
        Float,
        nullable=False,
    )

    phosphorus = Column(
        Float,
        nullable=False,
    )

    potassium = Column(
        Float,
        nullable=False,
    )

    ph = Column(
        Float,
        nullable=False,
    )

    # Weather snapshot
    average_temperature_c = Column(
        Float,
        nullable=False,
    )

    total_rainfall_mm = Column(
        Float,
        nullable=False,
    )

    average_humidity_percent = Column(
        Float,
        nullable=False,
    )

    # Best recommendation
    recommended_crop = Column(
        String(120),
        nullable=False,
        index=True,
    )

    recommendation_score = Column(
        Float,
        nullable=False,
    )

    recommendation_strength = Column(
        String(30),
        nullable=False,
        index=True,
    )

    predicted_yield = Column(
        Float,
        nullable=False,
    )

    estimated_production = Column(
        Float,
        nullable=False,
    )

    historical_average_yield = Column(
        Float,
        nullable=False,
    )

    historical_record_count = Column(
        Integer,
        nullable=False,
    )

    # JSON-formatted text
    alternatives_json = Column(
        Text,
        nullable=False,
    )

    reasons_json = Column(
        Text,
        nullable=False,
    )

    # ML artifact information
    model_name = Column(
        String(120),
        nullable=False,
    )

    model_version = Column(
        String(50),
        nullable=False,
    )

    prediction_unit = Column(
        String(80),
        default="metric tons per hectare",
        nullable=False,
    )

    production_unit = Column(
        String(50),
        default="metric tons",
        nullable=False,
    )

    explanation = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
        index=True,
    )

    user = relationship(
        "User",
        back_populates="crop_recommendations",
    )

    farm = relationship(
        "Farm",
        back_populates="crop_recommendations",
    )