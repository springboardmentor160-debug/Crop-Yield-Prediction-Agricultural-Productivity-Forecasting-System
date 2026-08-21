import math
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class YieldPredictionRequest(BaseModel):
    farm_id: int = Field(
        gt=0,
    )

    crop: str = Field(
        min_length=2,
        max_length=120,
        examples=["Rice"],
    )

    crop_year: int = Field(
        ge=1990,
        le=2100,
        examples=[2026],
    )

    season: str = Field(
        min_length=2,
        max_length=50,
        examples=["Kharif"],
    )

    fertilizer: float = Field(
        ge=0,
        examples=[1250.0],
    )

    pesticide: float = Field(
        ge=0,
        examples=[25.0],
    )

    # Optional weather values.
    # When omitted, the service will try to resolve them
    # from the weather-reference table.
    annual_rainfall: float | None = Field(
        default=None,
        ge=0,
        examples=[950.0],
    )

    average_temperature_c: float | None = Field(
        default=None,
        ge=-50,
        le=60,
        examples=[27.5],
    )

    total_rainfall_mm: float | None = Field(
        default=None,
        ge=0,
        examples=[940.0],
    )

    average_humidity_percent: float | None = Field(
        default=None,
        ge=0,
        le=100,
        examples=[72.0],
    )

    @field_validator(
        "crop",
        "season",
        mode="before",
    )
    @classmethod
    def normalize_required_text(
        cls,
        value: str,
    ) -> str:
        if not isinstance(value, str):
            return value

        return " ".join(value.strip().split())
    
    @field_validator(
        "fertilizer",
        "pesticide",
        "annual_rainfall",
        "average_temperature_c",
        "total_rainfall_mm",
        "average_humidity_percent",
        mode="after",
    )
    @classmethod
    def reject_non_finite_numbers(
        cls,
        value: float | None,
    ) -> float | None:
        if value is None:
            return None

        if not math.isfinite(value):
            raise ValueError(
                "Value must be a finite number"
            )

        return value


class YieldPredictionInputSnapshot(BaseModel):
    farm_id: int
    farm_name: str
    state: str
    crop: str
    crop_year: int
    season: str
    area_hectares: float

    annual_rainfall: float
    fertilizer: float
    pesticide: float

    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float

    average_temperature_c: float
    total_rainfall_mm: float
    average_humidity_percent: float


class YieldPredictionResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    user_id: int
    farm_id: int

    farm_name: str
    state: str
    crop: str
    crop_year: int
    season: str
    area_hectares: float

    annual_rainfall: float
    fertilizer: float
    pesticide: float

    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float

    average_temperature_c: float
    total_rainfall_mm: float
    average_humidity_percent: float

    predicted_yield: float
    estimated_production: float
    
    yield_category: str
    yield_category_label: str
    yield_category_description: str

    model_name: str
    model_version: str

    prediction_unit: str
    production_unit: str

    explanation: str | None

    created_at: datetime


class YieldPredictionListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[YieldPredictionResponse]


class YieldPredictionSummaryResponse(BaseModel):
    total_predictions: int
    total_farms: int
    total_crops: int

    average_predicted_yield: float
    maximum_predicted_yield: float
    minimum_predicted_yield: float

    total_estimated_production: float


class ModelInformationResponse(BaseModel):
    project: str
    task: str
    model_name: str
    model_type: str
    model_version: str

    training_rows: int
    training_year_start: int
    training_year_end: int

    feature_count: int
    features: list[str]

    target: str
    target_transformation: str
    prediction_inverse_transformation: str

    random_split_metrics: dict[str, float]
    time_based_metrics: dict[str, float | str]

    production_feature_used: bool