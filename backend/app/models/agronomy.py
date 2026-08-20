from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"))
    crop_name: Mapped[str] = mapped_column(String(80), nullable=False)
    variety: Mapped[str | None] = mapped_column(String(80), nullable=True)
    season: Mapped[str] = mapped_column(String(20), default="Kharif")  # Kharif / Rabi / Zaid
    area_hectares: Mapped[float] = mapped_column(Float, default=0.0)
    planting_date: Mapped[date] = mapped_column(Date, nullable=False)
    expected_harvest_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    irrigation_type: Mapped[str] = mapped_column(String(40), default="Rainfed")
    growth_stage: Mapped[str] = mapped_column(String(40), default="Sown")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    farm = relationship("Farm", back_populates="crops")
    predictions = relationship("YieldPrediction", back_populates="crop", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="crop", cascade="all, delete-orphan")


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"))
    record_date: Mapped[date] = mapped_column(Date, nullable=False)
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    rainfall_mm: Mapped[float] = mapped_column(Float, nullable=False)
    humidity_pct: Mapped[float] = mapped_column(Float, nullable=False)
    wind_speed_kmh: Mapped[float] = mapped_column(Float, default=0.0)
    source: Mapped[str] = mapped_column(String(60), default="Manual Entry")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    farm = relationship("Farm", back_populates="weather_records")


class SoilRecord(Base):
    __tablename__ = "soil_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"))
    record_date: Mapped[date] = mapped_column(Date, nullable=False)
    ph_level: Mapped[float] = mapped_column(Float, nullable=False)
    nitrogen_ppm: Mapped[float] = mapped_column(Float, nullable=False)
    phosphorus_ppm: Mapped[float] = mapped_column(Float, nullable=False)
    potassium_ppm: Mapped[float] = mapped_column(Float, nullable=False)
    organic_matter_pct: Mapped[float] = mapped_column(Float, default=0.0)
    moisture_pct: Mapped[float] = mapped_column(Float, default=0.0)
    soil_texture: Mapped[str] = mapped_column(String(40), default="Loam")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    farm = relationship("Farm", back_populates="soil_records")
