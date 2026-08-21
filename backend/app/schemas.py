from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ── Auth ──────────────────────────────────────────
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "Farmer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ── Farms ─────────────────────────────────────────
class FarmCreate(BaseModel):
    farm_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_ph: Optional[float] = None
    area_hectares: Optional[float] = None
    soil_type: Optional[str] = None
    location: Optional[str] = None

class FarmOut(BaseModel):
    id: int
    farm_name: str
    latitude: Optional[float]
    longitude: Optional[float]
    soil_ph: Optional[float]
    area_hectares: Optional[float]
    soil_type: Optional[str]
    location: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    location: Optional[str] = None
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    area_hectares: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# ── Crops ─────────────────────────────────────────
class CropCreate(BaseModel):
    crop_name: str
    hectares_planted: Optional[float] = None
    season: Optional[str] = None
    year: Optional[int] = None

class CropOut(BaseModel):
    id: int
    crop_name: str
    hectares_planted: Optional[float]
    season: Optional[str]
    year: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True

# ── Predictions ────────────────────────────────────
class PredictionRequest(BaseModel):
    farm_id: int
    crop_type: str
    rainfall_mm: float
    temperature_c: float
    humidity_percent: float = 60.0
    soil_ph: float
    nitrogen: float = 0.0
    phosphorus: float = 0.0
    potassium: float = 0.0

class RecommendationItem(BaseModel):
    category: str
    message: str
    priority: str

class PredictionOut(BaseModel):
    id: int
    crop_type: str
    predicted_yield_tons_per_ha: float
    confidence_score: float
    risk_level: str
    recommendations: List[RecommendationItem]
    created_at: datetime
    class Config:
        from_attributes = True

class PredictionHistoryOut(BaseModel):
    id: int
    crop_type: str
    rainfall_mm: float
    temperature_c: float
    soil_ph: float
    predicted_yield_tons_per_ha: float
    confidence_score: float
    risk_level: str
    created_at: datetime
    class Config:
        from_attributes = True


# ── Soil ────────────────────────────────────

class DeficiencyItem(BaseModel):
    nutrient: str
    level: str
    recommendation: str

class SoilAnalysisOut(BaseModel):
    id: int
    farm_id: int
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    humidity: Optional[float]
    temperature: Optional[float]
    rainfall: Optional[float]
    ph_category: Optional[str]
    fertility_score: Optional[float]
    fertility_index: Optional[str]
    fertility_color: Optional[str]
    deficiencies: Optional[List[DeficiencyItem]]
    suitable_crops: Optional[List[str]]
    soil_health_tips: Optional[List[str]]
    created_at: datetime
    class Config:
        from_attributes = True

# ── Notifications ──────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ==========================================================
# Analytics Schemas
# ==========================================================

class DashboardAnalyticsResponse(BaseModel):
    total_users: int
    total_farms: int
    active_farms: int
    total_predictions: int
    total_area_hectares: float
    average_yield: float
    highest_yield: float
    lowest_yield: float
    average_confidence: float
    average_soil_ph: float
    average_fertility: float
    best_crop: Optional[str]
    high_risk: int
    medium_risk: int
    low_risk: int
    model_accuracy: float
    mae: float
    rmse: float
    training_samples: int
    n_crops: int


class YieldTrendItem(BaseModel):
    month: str
    average_yield: float
    maximum_yield: float
    minimum_yield: float
    prediction_count: int


class YieldTrendResponse(BaseModel):
    yield_trend: List[YieldTrendItem]
    total_predictions: int
    average_yield: float
    best_yield: float
    worst_yield: float


class CropPerformanceItem(BaseModel):
    crop: str
    prediction_count: int
    average_yield: float
    highest_yield: float
    lowest_yield: float
    average_confidence: float
    risk_level: str
    latest_prediction: datetime
    latest_yield: float


class CropPerformanceResponse(BaseModel):
    crop_performance: List[CropPerformanceItem]
    total_crop_types: int
    best_crop: Optional[str]
    highest_average_yield: float


class FarmComparisonItem(BaseModel):
    rank: int
    farm_id: int
    farm_name: str
    location: Optional[str]
    area_hectares: Optional[float]
    soil_ph: Optional[float]
    soil_type: Optional[str]
    prediction_count: int
    average_yield: float
    highest_yield: float
    lowest_yield: float
    average_confidence: float
    productivity_score: float
    crops: List[str]


class FarmComparisonResponse(BaseModel):
    total_farms: int
    farm_comparison: List[FarmComparisonItem]


class ProductivityResponse(BaseModel):
    total_area_hectares: float
    average_yield_tons_per_ha: float
    estimated_production_tons: float
    estimated_revenue_inr: float
    productivity_score: float
    performance_rating: str
    excellent_farms: int
    good_farms: int
    average_farms: int
    poor_farms: int


class RiskDistributionResponse(BaseModel):
    total_predictions: int
    low: int
    medium: int
    high: int
    low_percent: float
    medium_percent: float
    high_percent: float


class SoilHealthResponse(BaseModel):
    total_analyses: int
    average_ph: float
    average_fertility: float
    healthy_soils: int
    acidic_soils: int
    alkaline_soils: int


class WeatherImpactResponse(BaseModel):
    average_temperature: float
    average_rainfall: float
    average_humidity: float
    average_yield: float


class RecentPredictionItem(BaseModel):
    id: int
    farm_id: int
    crop_type: str
    yield_: float = Field(alias="yield")
    confidence: float
    risk: str
    temperature: float
    rainfall: float
    humidity: float
    created_at: datetime

    class Config:
        populate_by_name = True


class ModelPerformanceResponse(BaseModel):
    accuracy: float
    mae: float
    rmse: float
    training_samples: int
    number_of_crops: int
    algorithm: str
    status: str