from sqlalchemy import Column, Integer, String, Float
from database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    area = Column(String(100))
    item = Column(String(100))
    year = Column(Integer)
    rainfall = Column(Float)
    pesticides = Column(Float)
    temperature = Column(Float)
    predicted_yield = Column(Float)