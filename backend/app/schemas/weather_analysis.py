
from pydantic import BaseModel, Field, model_validator


class WeatherAnalysisRecord(BaseModel):
    year: int

    avg_temp_c: float
    total_rainfall_mm: float
    avg_humidity_percent: float


class WeatherMetricSummary(BaseModel):
    average: float
    minimum: float
    maximum: float


class WeatherAnalysisSummary(BaseModel):
    temperature: WeatherMetricSummary
    rainfall: WeatherMetricSummary
    humidity: WeatherMetricSummary


class WeatherTrend(BaseModel):
    start_year: int
    end_year: int

    temperature_change_c: float
    rainfall_change_mm: float
    rainfall_change_percent: float
    humidity_change_percent: float

    temperature_direction: str
    rainfall_direction: str
    humidity_direction: str


class WeatherMetricAssessment(BaseModel):
    status: str
    risk_level: str
    message: str


class WeatherRiskAssessment(BaseModel):
    temperature: WeatherMetricAssessment
    rainfall: WeatherMetricAssessment
    humidity: WeatherMetricAssessment

    overall_risk_level: str
    overall_status: str
    overall_message: str


class WeatherAnalysisResponse(BaseModel):
    state: str
    start_year: int
    end_year: int
    total_records: int

    summary: WeatherAnalysisSummary
    trend: WeatherTrend
    assessment: WeatherRiskAssessment

    records: list[WeatherAnalysisRecord]


class WeatherAnalysisFilters(BaseModel):
    state: str = Field(
        min_length=2,
        max_length=120,
    )

    start_year: int = Field(
        ge=1900,
        le=2100,
    )

    end_year: int = Field(
        ge=1900,
        le=2100,
    )

    @model_validator(mode="after")
    def validate_year_range(
        self,
    ) -> "WeatherAnalysisFilters":
        if self.start_year > self.end_year:
            raise ValueError(
                "start_year must be less than or equal to end_year"
            )

        return self


class WeatherAnalysisOptionsResponse(BaseModel):
    states: list[str]
    years: list[int]

    minimum_year: int | None = None
    maximum_year: int | None = None