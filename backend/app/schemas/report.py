"""
YieldSense AI  -  Report & History Schemas

Pydantic models for report generation, history, and export APIs.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ============================================================
# Report Schemas
# ============================================================

class ReportRequest(BaseModel):
    """Request body to generate a new report."""
    prediction_id: str = Field(..., description="Prediction record ID to base the report on")
    farm_id: Optional[str] = Field(None, description="Farm ID (optional)")
    report_type: str = Field(default="prediction", description="Type: prediction, farm, seasonal")
    title: Optional[str] = Field(None, description="Custom report title")


class ReportSummary(BaseModel):
    """Lightweight report summary for list views."""
    id: str
    title: str
    report_type: str
    status: str
    farm_name: Optional[str] = None
    crop: Optional[str] = None
    created_at: str


class ReportResponse(BaseModel):
    """Full report response including embedded data."""
    id: str
    title: str
    report_type: str
    status: str
    farm_id: Optional[str] = None
    farm_name: Optional[str] = None
    prediction_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    created_at: str


class ReportListResponse(BaseModel):
    """Paginated list of report summaries."""
    reports: List[ReportSummary] = []
    total: int = 0


# ============================================================
# Prediction History Schemas
# ============================================================

class PredictionHistoryItem(BaseModel):
    """Single item in the prediction history list."""
    id: str
    crop: str
    season: str
    state: str
    area: float
    predicted_yield: float
    total_production: float
    prediction_unit: str
    model_used: str
    confidence: str
    model_accuracy: Optional[float] = None
    humidity: Optional[float] = None
    temperature: float
    annual_rainfall: float
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    fertilizer_usage: float = 100.0
    pesticide_usage: float = 10.0
    farm_id: Optional[str] = None
    farm_name: Optional[str] = None
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    weather_summary: Optional[Dict[str, Any]] = None
    soil_summary: Optional[Dict[str, Any]] = None
    created_at: str


class PredictionHistoryResponse(BaseModel):
    """Paginated prediction history response."""
    predictions: List[PredictionHistoryItem] = []
    total: int = 0
    page: int = 1
    limit: int = 20
    total_pages: int = 1
