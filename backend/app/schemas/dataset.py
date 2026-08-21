from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class DatasetImportError(BaseModel):
    row_number: int
    message: str


class DatasetImportResponse(BaseModel):
    dataset: str
    total_rows: int
    inserted_rows: int
    updated_rows: int = 0
    skipped_rows: int
    invalid_rows: int
    errors: list[DatasetImportError]


class HistoricalCropYieldResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    crop: str
    crop_year: int
    season: str
    state: str
    area: float
    production: float
    annual_rainfall: float | None
    fertilizer: float | None
    pesticide: float | None
    yield_value: float


class StateSoilResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    state: str
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float


class StateWeatherResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    state: str
    year: int
    avg_temp_c: float
    total_rainfall_mm: float
    avg_humidity_percent: float

class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[T]


class HistoricalYieldSummaryResponse(BaseModel):
    total_records: int
    total_crops: int
    total_states: int
    minimum_year: int | None
    maximum_year: int | None
    average_yield: float | None
    total_area: float | None
    total_production: float | None


class SoilSummaryResponse(BaseModel):
    total_states: int
    average_nitrogen: float | None
    average_phosphorus: float | None
    average_potassium: float | None
    average_ph: float | None


class WeatherSummaryResponse(BaseModel):
    total_records: int
    total_states: int
    minimum_year: int | None
    maximum_year: int | None
    average_temperature_c: float | None
    average_rainfall_mm: float | None
    average_humidity_percent: float | None

class DatasetOptionResponse(BaseModel):
    value: str
    label: str


class FarmReferenceOptionsResponse(BaseModel):
    states: list[DatasetOptionResponse]
    crops: list[DatasetOptionResponse]
    seasons: list[DatasetOptionResponse]
    irrigation_types: list[DatasetOptionResponse]