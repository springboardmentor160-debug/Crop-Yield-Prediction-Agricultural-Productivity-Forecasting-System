from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    farm_name = Column(String(120), nullable=False, index=True)

    state = Column(String(120), nullable=False, index=True)
    district = Column(String(120), nullable=False, index=True)
    village = Column(String(120), nullable=True, index=True)

    area_hectares = Column(Float, nullable=False)

    soil_type = Column(String(100), nullable=True)
    primary_crop = Column(String(100), nullable=True, index=True)
    irrigation_type = Column(String(100), nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False, index=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="farms",
    )

    yield_predictions = relationship(
        "YieldPrediction",
        back_populates="farm",
        cascade="all, delete-orphan",
    )

    crop_recommendations = relationship(
        "CropRecommendation",
        back_populates="farm",
        cascade="all, delete-orphan",
    )