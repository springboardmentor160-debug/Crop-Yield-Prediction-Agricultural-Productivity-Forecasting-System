from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Boolean,
    JSON,
)

from sqlalchemy.orm import relationship

from app.database import Base


# ==========================================================
# User Model
# ==========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Farmer", nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    farms = relationship(
        "Farm",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User {self.id}: {self.email}>"


# ==========================================================
# Farm Model
# ==========================================================

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    farm_name = Column(String(100), nullable=False)

    latitude = Column(Float)
    longitude = Column(Float)

    soil_ph = Column(Float)
    area_hectares = Column(Float)

    soil_type = Column(String(50))
    location = Column(String(150))

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    owner = relationship("User", back_populates="farms")

    crops = relationship(
        "Crop",
        back_populates="farm",
        cascade="all, delete-orphan",
    )

    predictions = relationship(
        "Prediction",
        back_populates="farm",
        cascade="all, delete-orphan",
    )

    soil_analyses = relationship(
        "SoilAnalysis",
        back_populates="farm",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Farm {self.id}: {self.farm_name}>"


# ==========================================================
# Crop Model
# ==========================================================

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)

    farm_id = Column(
        Integer,
        ForeignKey("farms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    crop_name = Column(String(100), nullable=False)

    hectares_planted = Column(Float)
    season = Column(String(50))
    year = Column(Integer)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    farm = relationship("Farm", back_populates="crops")

    def __repr__(self):
        return f"<Crop {self.id}: {self.crop_name}>"


# ==========================================================
# Prediction Model
# ==========================================================

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    farm_id = Column(
        Integer,
        ForeignKey("farms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    crop_type = Column(
        String(50),
        nullable=False,
        index=True,
    )

    rainfall_mm = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=False)

    soil_ph = Column(Float, nullable=False)

    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)

    predicted_yield_tons_per_ha = Column(Float, nullable=False)

    confidence_score = Column(Float, nullable=False)

    risk_level = Column(
        String(20),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    farm = relationship("Farm", back_populates="predictions")

    def __repr__(self):
        return f"<Prediction {self.id}: {self.crop_type}>"


# ==========================================================
# Soil Analysis Model
# ==========================================================

class SoilAnalysis(Base):
    __tablename__ = "soil_analyses"

    id = Column(Integer, primary_key=True, index=True)

    farm_id = Column(
        Integer,
        ForeignKey("farms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)

    ph = Column(Float, nullable=False)

    humidity = Column(Float)
    temperature = Column(Float)
    rainfall = Column(Float)

    ph_category = Column(String(30))

    fertility_score = Column(Float)

    fertility_index = Column(String(20))

    fertility_color = Column(String(20))

    deficiencies = Column(JSON)

    suitable_crops = Column(JSON)

    soil_health_tips = Column(JSON)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    farm = relationship(
        "Farm",
        back_populates="soil_analyses",
    )

    def __repr__(self):
        return f"<SoilAnalysis {self.id}>"


# ==========================================================
# Notification Model
# ==========================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(200), nullable=False)

    message = Column(String(1000), nullable=False)

    is_read = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    user = relationship(
        "User",
        back_populates="notifications",
    )

    def __repr__(self):
        return f"<Notification {self.id}>"