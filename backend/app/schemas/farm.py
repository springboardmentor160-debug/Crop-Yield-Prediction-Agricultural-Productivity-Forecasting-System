"""
YieldSense AI  -  Farm Schemas

Pydantic models for farm CRUD request/response validation.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class FarmCreate(BaseModel):
    """Schema for creating a new farm."""

    name: str = Field(..., min_length=1, max_length=200, description="Farm name")
    location: str = Field(..., min_length=1, max_length=300, description="Farm location")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    area: float = Field(..., gt=0.0, description="Farm area in hectares")
    crop: str = Field(..., min_length=1, max_length=100, description="Primary crop type")
    soil_ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH level")
    nitrogen: float = Field(..., ge=0.0, description="Nitrogen content (kg/ha)")
    phosphorus: float = Field(..., ge=0.0, description="Phosphorus content (kg/ha)")
    potassium: float = Field(..., ge=0.0, description="Potassium content (kg/ha)")


class FarmUpdate(BaseModel):
    """Schema for updating an existing farm. All fields are optional."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=300)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    area: Optional[float] = Field(None, gt=0.0)
    crop: Optional[str] = Field(None, min_length=1, max_length=100)
    soil_ph: Optional[float] = Field(None, ge=0.0, le=14.0)
    nitrogen: Optional[float] = Field(None, ge=0.0)
    phosphorus: Optional[float] = Field(None, ge=0.0)
    potassium: Optional[float] = Field(None, ge=0.0)


class FarmResponse(BaseModel):
    """Schema for farm response."""

    id: str
    user_id: str
    name: str
    location: str
    latitude: float
    longitude: float
    area: float
    crop: str
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    created_at: str
    updated_at: str


class FarmListResponse(BaseModel):
    """Schema for paginated farm list response."""

    farms: List[FarmResponse]
    total: int
    page: int
    limit: int
    total_pages: int
