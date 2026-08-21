"""
YieldSense AI  -  Farm Advisory Schemas

Pydantic response models for the farm-linked advisory API endpoint.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class IdentifiedRisk(BaseModel):
    """A single identified risk with explanation and advice."""

    type: str
    """Risk category: 'Yield Risk', 'Rainfall Risk', 'Soil Risk'."""

    severity: str
    """Human-readable severity: 'Low', 'Medium', 'High'."""

    reason: str
    """Explanation of why this is a risk. Farmer-readable language."""

    advice: str
    """Recommended corrective action for this specific risk."""


class DataSources(BaseModel):
    """Indicates which data was available for the advisory calculation."""

    soil_ph_available: bool
    predicted_yield_available: bool
    avg_yield_available: bool
    rainfall_deviation_available: bool
    prediction_count: int


class MetricsUsed(BaseModel):
    """The actual values used in rule evaluation."""

    soil_ph: Optional[float] = None
    predicted_yield: Optional[float] = None
    avg_yield: Optional[float] = None
    rainfall_deviation: Optional[float] = None
    crop: Optional[str] = None


class FarmAdvisoryResponse(BaseModel):
    """Full farm advisory response - recommendations + risk assessment."""

    # Farm identification
    farm_id: str
    farm_name: str
    crop: str

    # Recommendations
    recommendations: List[str]
    """Plain-English list of actionable recommendations. Never empty."""

    # Risk assessment
    risk_level: str
    """'Low', 'Medium', or 'High'."""

    risk_score: float
    """Numeric risk score (0-5+). Supports the risk_level decision."""

    risk_category: str
    """Dominant risk type: 'Yield Risk', 'Rainfall Risk', 'Soil Risk', 'Stable'."""

    identified_risks: List[IdentifiedRisk]
    """Per-risk explanations - what, why, and what to do."""

    detected_risk_count: int
    """Number of distinct risk factors identified."""

    priority_level: str
    """'Monitor', 'Act Soon', or 'Act Now'."""

    priority_reason: str
    """Human-readable explanation of the priority decision."""

    # Supporting context
    data_sources: DataSources
    """Which data was available for rule evaluation."""

    metrics_used: MetricsUsed
    """Actual metric values used in rule calculations."""

    generated_at: str
    """ISO 8601 timestamp when the advisory was generated."""

    disclaimer: str = (
        "Advisory is based on stored farm data and prediction history. "
        "Thresholds are general agricultural guidelines. "
        "Consult a local agricultural officer for field-specific advice."
    )
