from datetime import date, datetime

from pydantic import BaseModel, Field


class CropCreate(BaseModel):
    farm_id: int
    crop_name: str
    variety: str | None = None
    season: str = "Kharif"
    area_hectares: float = Field(gt=0)
    planting_date: date
    expected_harvest_date: date | None = None
    irrigation_type: str = "Rainfed"
    growth_stage: str = "Sown"


class CropUpdate(BaseModel):
    variety: str | None = None
    season: str | None = None
    area_hectares: float | None = None
    expected_harvest_date: date | None = None
    irrigation_type: str | None = None
    growth_stage: str | None = None


class CropOut(BaseModel):
    id: int
    farm_id: int
    crop_name: str
    variety: str | None
    season: str
    area_hectares: float
    planting_date: date
    expected_harvest_date: date | None
    irrigation_type: str
    growth_stage: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WeatherCreate(BaseModel):
    farm_id: int
    record_date: date
    temperature_c: float
    rainfall_mm: float = Field(ge=0)
    humidity_pct: float = Field(ge=0, le=100)
    wind_speed_kmh: float = Field(ge=0, default=0)
    source: str = "Manual Entry"


class WeatherOut(BaseModel):
    id: int
    farm_id: int
    record_date: date
    temperature_c: float
    rainfall_mm: float
    humidity_pct: float
    wind_speed_kmh: float
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SoilCreate(BaseModel):
    farm_id: int
    record_date: date
    ph_level: float = Field(ge=0, le=14)
    nitrogen_ppm: float = Field(ge=0)
    phosphorus_ppm: float = Field(ge=0)
    potassium_ppm: float = Field(ge=0)
    organic_matter_pct: float = Field(ge=0, default=0)
    moisture_pct: float = Field(ge=0, le=100, default=0)
    soil_texture: str = "Loam"


class SoilOut(BaseModel):
    id: int
    farm_id: int
    record_date: date
    ph_level: float
    nitrogen_ppm: float
    phosphorus_ppm: float
    potassium_ppm: float
    organic_matter_pct: float
    moisture_pct: float
    soil_texture: str
    created_at: datetime

    model_config = {"from_attributes": True}
