from datetime import datetime

from pydantic import BaseModel, Field


class FarmCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    location: str
    region: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    total_area_hectares: float = Field(gt=0)
    soil_type: str | None = None
    irrigation_available: bool = False


class FarmUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    region: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    total_area_hectares: float | None = None
    soil_type: str | None = None
    irrigation_available: bool | None = None


class FarmOut(BaseModel):
    id: int
    owner_id: int
    name: str
    location: str
    region: str | None
    latitude: float | None
    longitude: float | None
    total_area_hectares: float
    soil_type: str | None
    irrigation_available: bool
    created_at: datetime

    model_config = {"from_attributes": True}
