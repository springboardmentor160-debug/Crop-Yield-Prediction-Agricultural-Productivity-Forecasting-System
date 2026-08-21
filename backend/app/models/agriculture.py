from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    UniqueConstraint,
)

from app.db.database import Base


class HistoricalCropYield(Base):
    """
    Imported reference data from Dataset 1.

    Expected CSV columns:
    Crop, Crop_Year, Season, State, Area, Production,
    Annual_Rainfall, Fertilizer, Pesticide, Yield
    """

    __tablename__ = "historical_crop_yields"

    id = Column(Integer, primary_key=True, index=True)

    crop = Column(String(120), nullable=False, index=True)
    crop_year = Column(Integer, nullable=False, index=True)
    season = Column(String(80), nullable=False, index=True)
    state = Column(String(120), nullable=False, index=True)

    area = Column(Float, nullable=False)
    production = Column(Float, nullable=False)

    annual_rainfall = Column(Float, nullable=True)
    fertilizer = Column(Float, nullable=True)
    pesticide = Column(Float, nullable=True)

    yield_value = Column("yield", Float, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "crop",
            "crop_year",
            "season",
            "state",
            "area",
            name="uq_crop_yield_reference_row",
        ),
    )


class StateSoilReference(Base):
    """
    Imported reference data from Dataset 2.

    Expected CSV columns:
    state, N, P, K, pH
    """

    __tablename__ = "state_soil_references"

    id = Column(Integer, primary_key=True, index=True)

    state = Column(
        String(120),
        nullable=False,
        unique=True,
        index=True,
    )

    nitrogen = Column("n", Float, nullable=False)
    phosphorus = Column("p", Float, nullable=False)
    potassium = Column("k", Float, nullable=False)
    ph = Column(Float, nullable=False)

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


class StateWeatherReference(Base):
    """
    Imported reference data from Dataset 3.

    Expected CSV columns:
    state, year, avg_temp_c, total_rainfall_mm,
    avg_humidity_percent
    """

    __tablename__ = "state_weather_references"

    id = Column(Integer, primary_key=True, index=True)

    state = Column(String(120), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)

    avg_temp_c = Column(Float, nullable=False)
    total_rainfall_mm = Column(Float, nullable=False)
    avg_humidity_percent = Column(Float, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "state",
            "year",
            name="uq_state_weather_year",
        ),
    )