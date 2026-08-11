from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Farmer")  # 'Farmer', 'Admin'

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
