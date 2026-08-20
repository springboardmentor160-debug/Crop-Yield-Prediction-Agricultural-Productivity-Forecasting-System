from datetime import datetime

from pydantic import BaseModel

from app.models.prediction import RiskLevel


class PredictionRequest(BaseModel):
    crop_id: int


class PredictionOut(BaseModel):
    id: int
    crop_id: int
    predicted_yield_kg_per_ha: float
    predicted_total_production_kg: float
    productivity_score: float
    confidence_score: float
    risk_level: RiskLevel
    model_version: str
    input_snapshot: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class RecommendationOut(BaseModel):
    id: int
    crop_id: int
    category: str
    priority: str
    title: str
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsSummary(BaseModel):
    total_farms: int
    total_crops: int
    total_area_hectares: float
    average_predicted_yield_kg_per_ha: float
    predictions_last_30_days: int
    risk_distribution: dict[str, int]
    yield_by_crop: dict[str, float]
    yield_trend: list[dict]
