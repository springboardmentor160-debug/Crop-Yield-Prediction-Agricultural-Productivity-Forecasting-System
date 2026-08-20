"""
Runtime inference service.

Loads the persisted RandomForest pipeline once (module-level singleton)
and exposes `predict_for_crop()`, which assembles a feature row from the
most recent weather + soil records for a crop's farm, runs inference,
and derives:

  - productivity_score : 0-100 relative to the crop's benchmark yield
  - confidence_score    : model agreement across the forest's trees,
                           discounted for missing/stale input data
  - risk_level          : Low/Moderate/High from weather & soil stressors
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field

import joblib
import numpy as np
import pandas as pd

from app.core.config import settings
from app.ml.dataset import CROP_BENCHMARK_YIELD
from app.ml.train import CATEGORICAL_FEATURES, NUMERIC_FEATURES, train_and_save

_MODEL = None  # lazy-loaded singleton


def _model_path() -> str:
    return os.path.join(settings.MODEL_ARTIFACT_DIR, settings.YIELD_MODEL_FILENAME)


def _load_model():
    global _MODEL
    if _MODEL is None:
        path = _model_path()
        if not os.path.exists(path):
            # First-run convenience: train automatically if no artifact exists yet.
            train_and_save()
        _MODEL = joblib.load(path)
    return _MODEL


@dataclass
class PredictionInput:
    crop_name: str
    season: str
    area_hectares: float
    irrigation_type: str
    soil_texture: str
    temperature_c: float
    rainfall_mm: float
    humidity_pct: float
    ph_level: float
    nitrogen_ppm: float
    phosphorus_ppm: float
    potassium_ppm: float
    organic_matter_pct: float
    data_completeness: float = 1.0  # fraction of required inputs actually observed (not defaulted)

    def to_frame(self) -> pd.DataFrame:
        row = {f: getattr(self, f) for f in NUMERIC_FEATURES + CATEGORICAL_FEATURES}
        return pd.DataFrame([row])


@dataclass
class PredictionOutput:
    predicted_yield_kg_per_ha: float
    predicted_total_production_kg: float
    productivity_score: float
    confidence_score: float
    risk_level: str
    risk_factors: list[str] = field(default_factory=list)
    model_version: str = "rf-v1"


def _tree_variance_confidence(model, X: pd.DataFrame) -> float:
    """Confidence from agreement across the RandomForest's individual trees."""
    pipeline = model
    preprocess = pipeline.named_steps["preprocess"]
    forest = pipeline.named_steps["model"]
    X_transformed = preprocess.transform(X)
    per_tree_preds = np.array([t.predict(X_transformed) for t in forest.estimators_]).flatten()
    mean_pred = per_tree_preds.mean()
    if mean_pred <= 0:
        return 0.5
    coefficient_of_variation = per_tree_preds.std() / mean_pred
    # Map CoV to a 0-1 confidence score (lower spread => higher confidence)
    confidence = float(np.clip(1.0 - coefficient_of_variation * 2.5, 0.35, 0.98))
    return confidence


def _assess_risk(inp: PredictionInput) -> tuple[str, list[str]]:
    factors: list[str] = []

    if inp.ph_level < 5.5 or inp.ph_level > 7.8:
        factors.append("Soil pH outside the optimal 5.5-7.8 range for most crops")
    if inp.nitrogen_ppm < 20:
        factors.append("Low nitrogen levels may limit vegetative growth")
    if inp.phosphorus_ppm < 15:
        factors.append("Low phosphorus levels may limit root development")
    if inp.potassium_ppm < 20:
        factors.append("Low potassium levels may reduce stress tolerance")
    if inp.organic_matter_pct < 1.0:
        factors.append("Low soil organic matter reduces water and nutrient retention")
    if inp.irrigation_type == "Rainfed" and inp.rainfall_mm < 300:
        factors.append("Low rainfall with no irrigation increases drought risk")
    if inp.temperature_c > 38 or inp.temperature_c < 8:
        factors.append("Temperature is outside the safe growth range")
    if inp.humidity_pct > 88:
        factors.append("High humidity increases fungal disease pressure")

    if len(factors) >= 3:
        return "High", factors
    if len(factors) >= 1:
        return "Moderate", factors
    return "Low", factors


def predict(inp: PredictionInput) -> PredictionOutput:
    model = _load_model()
    X = inp.to_frame()

    predicted_yield = float(model.predict(X)[0])
    predicted_yield = max(predicted_yield, 50.0)

    confidence = _tree_variance_confidence(model, X)
    # Discount confidence when the caller had to fall back to defaults
    confidence = float(np.clip(confidence * (0.6 + 0.4 * inp.data_completeness), 0.2, 0.98))

    benchmark = CROP_BENCHMARK_YIELD.get(inp.crop_name, predicted_yield)
    productivity_score = float(np.clip((predicted_yield / benchmark) * 100, 0, 130))

    risk_level, risk_factors = _assess_risk(inp)

    total_production = predicted_yield * inp.area_hectares

    return PredictionOutput(
        predicted_yield_kg_per_ha=round(predicted_yield, 1),
        predicted_total_production_kg=round(total_production, 1),
        productivity_score=round(productivity_score, 1),
        confidence_score=round(confidence, 3),
        risk_level=risk_level,
        risk_factors=risk_factors,
    )
