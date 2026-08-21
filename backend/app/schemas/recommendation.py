"""
YieldSense AI  -  Recommendation Engine Schemas

Pydantic models for the recommendation engine API.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class RecommendationEngineRequest(BaseModel):
    """Input for the recommendation engine."""

    crop: str = Field(..., description="Current or target crop")
    temperature: float = Field(..., ge=-50, le=60, description="Temperature in °C")
    annual_rainfall: float = Field(..., ge=0, le=5000, description="Annual rainfall in mm")
    humidity: float = Field(default=60.0, ge=0, le=100, description="Humidity %")
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH")
    nitrogen: float = Field(..., ge=0, description="Nitrogen kg/ha")
    phosphorus: float = Field(..., ge=0, description="Phosphorus kg/ha")
    potassium: float = Field(..., ge=0, description="Potassium kg/ha")
    predicted_yield: Optional[float] = Field(None, ge=0, description="Predicted yield tons/ha")
    season: str = Field(default="Kharif", description="Growing season")
    area: Optional[float] = Field(None, gt=0, description="Farm area in hectares")
    state: Optional[str] = Field(None, description="State / region")
    weather_summary: Optional[Dict[str, Any]] = Field(None, description="Weather summary from prediction")


class RecommendationItem(BaseModel):
    """A single crop recommendation with reason."""
    crop: str
    suitability: str  # "Excellent", "Good", "Fair"
    reason: str


class FertilizerRecommendation(BaseModel):
    """Fertilizer recommendation with explanation."""
    nutrient: str
    current_level: float
    target_level: float
    recommendation: str
    reason: str
    application_rate: str


class RecommendationEngineResponse(BaseModel):
    """Full recommendation engine output."""

    # Alternative crop recommendations
    crop_recommendations: List[RecommendationItem] = []

    # Fertilizer and nutrient recommendations
    fertilizer_recommendations: List[FertilizerRecommendation] = []

    # Irrigation advice
    irrigation_advice: str = ""
    irrigation_frequency: str = ""
    irrigation_reason: str = ""

    # Harvest suggestions
    harvest_suggestions: List[str] = []

    # Season planning
    season_planning: str = ""
    optimal_sowing_window: str = ""
    expected_harvest_window: str = ""

    # Best practices
    best_practices: List[str] = []

    # Yield improvement
    yield_improvement_tips: List[str] = []
    estimated_yield_improvement: str = ""

    # Explanation context
    reasons: List[str] = []
    confidence: str = "High"  # "High", "Medium", "Low"
    disclaimer: str = "Recommendations are based on agronomic rule-based analysis. Consult a local agricultural officer for field-specific advice."
