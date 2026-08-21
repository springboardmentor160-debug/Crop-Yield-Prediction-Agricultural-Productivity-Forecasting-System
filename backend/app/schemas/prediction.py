"""
YieldSense AI  -  Prediction Schemas

Pydantic models for the yield prediction API.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Request body for crop yield prediction."""

    # Core crop information
    crop: str = Field(..., min_length=1, max_length=100, description="Crop type (e.g., Rice, Wheat)")
    season: str = Field(default="Kharif", description="Growing season (Kharif, Rabi, Annual)")
    state: str = Field(default="Unknown", description="State/region name")

    # Farm dimensions
    area: float = Field(..., gt=0, description="Farm area in hectares")

    # Environmental conditions
    temperature: float = Field(..., ge=-50, le=60, description="Average temperature in °C")
    annual_rainfall: float = Field(..., ge=0, le=5000, description="Annual rainfall in mm")
    humidity: Optional[float] = Field(None, ge=0, le=100, description="Humidity percentage")

    # Soil parameters
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH level")
    nitrogen: float = Field(..., ge=0, description="Nitrogen content (kg/ha)")
    phosphorus: float = Field(..., ge=0, description="Phosphorus content (kg/ha)")
    potassium: float = Field(..., ge=0, description="Potassium content (kg/ha)")

    # Agricultural inputs
    fertilizer_usage: float = Field(default=100.0, ge=0, description="Fertilizer usage (kg/ha)")
    pesticide_usage: float = Field(default=10.0, ge=0, description="Pesticide usage (kg/ha)")
    production: float = Field(default=0.0, ge=0, description="Historical production (tons)")

    # Location (for weather lookup)
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude")


class WeatherSummaryResponse(BaseModel):
    """Weather summary included in prediction response."""

    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    description: str
    source: str = "Open-Meteo"


class SoilSummaryResponse(BaseModel):
    """Soil summary included in prediction response."""

    health_score: float
    health_label: str
    ph_status: str
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)


class PredictionResponse(BaseModel):
    """Response body for crop yield prediction."""

    # Prediction output
    predicted_yield: float = Field(..., description="Predicted crop yield")
    prediction_unit: str = Field(default="tons/hectare", description="Yield unit")
    total_production: float = Field(..., description="Estimated total production (yield × area)")

    # Input echo
    crop: str
    area: float
    season: str

    # Model information
    model_used: str = Field(..., description="Name of the ML model used")
    model_accuracy: Optional[float] = Field(None, description="Model R² score")
    confidence: str = Field(..., description="Prediction confidence: High, Medium, Low")

    # Contextual data
    weather_summary: Optional[WeatherSummaryResponse] = None
    soil_summary: Optional[SoilSummaryResponse] = None

    # Additional structured response fields
    risk_assessment: Optional[Dict] = Field(None, description="Risk assessment results")
    recommendations: Optional[Dict] = Field(None, description="Agricultural recommendations")
    prediction_id: Optional[str] = Field(None, description="Firestore record ID (if saved)")

    # Metadata
    prediction_timestamp: str = Field(..., description="ISO 8601 timestamp")


class ModelInfoResponse(BaseModel):
    """Response for model information endpoint."""

    model_name: Optional[str] = None
    test_r2: Optional[float] = None
    test_mae: Optional[float] = None
    test_rmse: Optional[float] = None
    cv_mean_r2: Optional[float] = None
    num_features: Optional[int] = None
    feature_names: Optional[List[str]] = None
    all_models_r2: Optional[Dict[str, float]] = None
    status: str = "ready"


class RecommendationRequest(BaseModel):
    """Request body for crop recommendation classification."""
    nitrogen: float = Field(..., ge=0, description="Nitrogen content (kg/ha)")
    phosphorus: float = Field(..., ge=0, description="Phosphorus content (kg/ha)")
    potassium: float = Field(..., ge=0, description="Potassium content (kg/ha)")
    temperature: float = Field(..., ge=-50, le=60, description="Average temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH level")
    annual_rainfall: float = Field(..., ge=0, le=5000, description="Annual rainfall in mm")


class RecommendationDetail(BaseModel):
    """Detailed crop recommendation item."""
    crop: str
    confidence: float


class RecommendationResponse(BaseModel):
    """Response body for crop recommendation classification."""
    recommended_crop: str
    top_recommendations: List[RecommendationDetail]
    model_used: str
    model_accuracy: float

