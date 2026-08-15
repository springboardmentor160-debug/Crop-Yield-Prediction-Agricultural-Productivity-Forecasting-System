from sqlalchemy import Column, Integer, String
from database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String)
    village = Column(String)
    district = Column(String)
    state = Column(String)
    farm_size = Column(String)
    crop = Column(String)