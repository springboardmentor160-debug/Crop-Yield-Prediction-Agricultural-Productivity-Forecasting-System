from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)
    password = Column(String(255))
    role = Column(String(20))


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String(100))

    crop = Column(String(100))

    rainfall = Column(Float)

    pesticides = Column(Float)

    temperature = Column(Float)

    ph = Column(Float)

    estimated_yield = Column(Float)

    risk = Column(String(50))

    recommendation = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)