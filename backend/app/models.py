import datetime
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), default="Precision Farmer")
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Farmer")  # 'Farmer', 'Admin'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    farm_name = Column(String(100))
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    soil_ph = Column(Numeric(3, 2))

    user = relationship("User", back_populates="farms")
    crops = relationship("Crop", back_populates="farm", cascade="all, delete-orphan")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"))
    crop_name = Column(String(100))
    hectares_planted = Column(Numeric(10, 2))

    farm = relationship("Farm", back_populates="crops")

class CropYieldRecord(Base):
    __tablename__ = "crop_yield_records"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100))
    date = Column(String(50))
    crop_type = Column(String(50))
    avg_temp = Column(Numeric(5, 2))
    precipitation = Column(Numeric(6, 2))
    soil_moisture = Column(Numeric(5, 2))
    yield_amount = Column(Numeric(8, 2))
    farm_id = Column(Integer, default=1)

