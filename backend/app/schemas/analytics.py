"""
YieldSense AI  -  Analytics Schemas

Pydantic response models for dashboard summary and analytics data.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class RecentPredictionItem(BaseModel):
    """A single item in the recent predictions list."""
    id: str
    crop: str
    season: str
    area: float
    predicted_yield: float
    total_production: float
    confidence: str
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    farm_name: Optional[str] = None
    created_at: str


class RecentFarmItem(BaseModel):
    """A single item in the recent farms list."""
    id: str
    name: str
    location: str
    crop: str
    area: float
    created_at: str


class DashboardSummaryResponse(BaseModel):
    """Response for the live dashboard summary endpoint."""
    # Farm stats
    total_farms: int = 0
    total_area: float = 0.0
    unique_crops: int = 0
    crop_list: List[str] = []

    # Prediction stats
    total_predictions: int = 0
    avg_predicted_yield: Optional[float] = None
    latest_prediction: Optional[RecentPredictionItem] = None

    # Risk overview
    latest_risk_level: Optional[str] = None
    latest_risk_score: Optional[float] = None
    high_risk_count: int = 0

    # Recent activity
    recent_predictions: List[RecentPredictionItem] = []
    recent_farms: List[RecentFarmItem] = []

    # Model info
    model_name: Optional[str] = None
    model_accuracy: Optional[float] = None
    model_status: str = "not_trained"


class YieldTrendPoint(BaseModel):
    """A single data point for yield trend charts."""
    date: str
    predicted_yield: float
    crop: str
    season: str
    area: float


class CropYieldPoint(BaseModel):
    """Average yield per crop for comparison charts."""
    crop: str
    avg_yield: float
    count: int
    total_production: float


class SeasonYieldPoint(BaseModel):
    """Average yield per season for comparison charts."""
    season: str
    avg_yield: float
    count: int


class RainfallYieldPoint(BaseModel):
    """Rainfall vs Yield scatter point."""
    rainfall: float
    yield_value: float
    crop: str
    temperature: float


class FarmYieldPoint(BaseModel):
    """Average yield per farm for farm comparison charts."""
    farm_name: str
    avg_yield: float
    count: int
    total_production: float

class AnalyticsResponse(BaseModel):
    """Full analytics data response for the analytics dashboard page."""
    # Chart data
    yield_trend: List[YieldTrendPoint] = []
    crop_comparison: List[CropYieldPoint] = []
    season_comparison: List[SeasonYieldPoint] = []
    rainfall_vs_yield: List[RainfallYieldPoint] = []
    farm_comparison: List[FarmYieldPoint] = []

    # Summary metrics
    total_predictions: int = 0
    avg_yield: Optional[float] = None
    best_crop: Optional[str] = None
    best_season: Optional[str] = None
    productivity_score: Optional[float] = None

    # Metadata
    data_range_days: int = 30
