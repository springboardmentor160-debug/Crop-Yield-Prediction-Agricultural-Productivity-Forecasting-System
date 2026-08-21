from pydantic import BaseModel


class SoilMetric(BaseModel):
    average: float
    status: str


class SoilAnalysisSummary(BaseModel):
    nitrogen: SoilMetric
    phosphorus: SoilMetric
    potassium: SoilMetric
    ph: SoilMetric


class SoilRecommendation(BaseModel):
    title: str
    message: str


class SoilAnalysisResponse(BaseModel):
    state: str

    summary: SoilAnalysisSummary

    overall_health: str

    recommendations: list[SoilRecommendation]


class SoilAnalysisOptionsResponse(BaseModel):
    states: list[str]