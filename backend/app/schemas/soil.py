"""
YieldSense AI  -  Soil Schemas

Pydantic models for soil analysis request/response.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class SoilAnalysisRequest(BaseModel):
    """Request body for soil analysis."""

    soil_ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH level")
    nitrogen: float = Field(..., ge=0.0, description="Nitrogen content (kg/ha)")
    phosphorus: float = Field(..., ge=0.0, description="Phosphorus content (kg/ha)")
    potassium: float = Field(..., ge=0.0, description="Potassium content (kg/ha)")
    moisture: Optional[float] = Field(None, ge=0.0, le=100.0, description="Soil moisture (%)")
    organic_matter: Optional[float] = Field(None, ge=0.0, le=100.0, description="Organic matter (%)")
    crop: Optional[str] = Field(None, description="Crop type for suitability analysis")


class NutrientRating(BaseModel):
    """Rating for a single nutrient."""

    name: str
    value: float
    unit: str
    status: str  # "Low", "Medium", "High", "Optimal"
    color: str   # "red", "yellow", "green", "blue"


class SoilAnalysisResponse(BaseModel):
    """Response body for soil analysis."""

    health_score: float = Field(..., ge=0, le=100, description="Overall soil health (0-100)")
    health_label: str = Field(..., description="Health label: Poor, Fair, Good, Excellent")
    ph_status: str = Field(..., description="pH classification")
    nutrient_ratings: List[NutrientRating] = Field(default_factory=list)
    suitability_rating: Optional[str] = Field(None, description="Crop suitability rating")
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
