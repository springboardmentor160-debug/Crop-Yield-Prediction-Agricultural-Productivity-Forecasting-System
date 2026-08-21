"""
YieldSense AI  -  Risk Assessment Schemas

Pydantic models for the agricultural risk assessment API.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class RiskAssessmentRequest(BaseModel):
    """Input for the risk assessment engine."""

    crop: str = Field(..., description="Target crop")
    temperature: float = Field(..., ge=-50, le=60, description="Temperature in °C")
    annual_rainfall: float = Field(..., ge=0, le=5000, description="Annual rainfall in mm")
    humidity: float = Field(default=60.0, ge=0, le=100, description="Humidity %")
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH")
    nitrogen: float = Field(..., ge=0, description="Nitrogen kg/ha")
    phosphorus: float = Field(..., ge=0, description="Phosphorus kg/ha")
    potassium: float = Field(..., ge=0, description="Potassium kg/ha")
    predicted_yield: Optional[float] = Field(None, ge=0, description="Predicted yield")
    season: str = Field(default="Kharif", description="Growing season")


class RiskItem(BaseModel):
    """A single detected risk with its details."""
    name: str               # e.g., "Low Nitrogen"
    category: str           # "Nutrient", "Climate", "Soil", "Compound"
    severity: str           # "Low", "Medium", "High", "Critical"
    severity_score: float   # 0-100
    reason: str             # Why this is a risk
    mitigation: str         # How to address it
    affected_aspects: List[str] = []  # e.g., ["Yield", "Soil Health"]


class RiskAssessmentResponse(BaseModel):
    """Full risk assessment output."""

    # Overall risk summary
    overall_risk_level: str     # "Low", "Medium", "High", "Critical"
    risk_score: float           # 0-100 composite score
    risk_category: str          # Dominant category: "Nutrient", "Climate", "Soil", "Compound", "Stable"

    # Detected risks
    risks: List[RiskItem] = []

    # Plain-language summaries
    warnings: List[str] = []
    mitigations: List[str] = []

    # Priority
    priority_level: str = "Monitor"   # "Monitor", "Act Soon", "Act Now", "Immediate Action"
    priority_reason: str = ""

    # Crop-specific context
    crop: str = ""
    detected_risk_count: int = 0

    # Color for UI badge
    risk_color: str = "green"  # "green", "yellow", "orange", "red"
