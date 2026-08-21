from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[str | None] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_area_hectares: Mapped[float] = mapped_column(Float, default=0.0)
    soil_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    irrigation_available: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="farms")
    crops = relationship("Crop", back_populates="farm", cascade="all, delete-orphan")
    weather_records = relationship("WeatherRecord", back_populates="farm", cascade="all, delete-orphan")
    soil_records = relationship("SoilRecord", back_populates="farm", cascade="all, delete-orphan")
