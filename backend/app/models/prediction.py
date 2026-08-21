import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"


class YieldPrediction(Base):
    __tablename__ = "yield_predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id", ondelete="CASCADE"))
    predicted_yield_kg_per_ha: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_total_production_kg: Mapped[float] = mapped_column(Float, nullable=False)
    productivity_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)    # 0-1
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.MODERATE)
    model_version: Mapped[str] = mapped_column(String(40), default="rf-v1")
    input_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    crop = relationship("Crop", back_populates="predictions")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String(40), nullable=False)  # fertilizer/irrigation/pest/planting/general
    priority: Mapped[str] = mapped_column(String(20), default="Medium")  # Low/Medium/High
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    crop = relationship("Crop", back_populates="recommendations")
