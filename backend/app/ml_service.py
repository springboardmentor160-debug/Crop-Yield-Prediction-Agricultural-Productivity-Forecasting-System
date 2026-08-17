import os
from functools import lru_cache

import numpy as np

from app.analytics import analyze_soil, analyze_weather, clamp


BASE_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_MODEL_PATH = os.path.join(BASE_BACKEND_DIR, "data", "processed", "crop_yield_model.pkl")
MODEL_PATH = os.getenv("YIELDSENSE_MODEL_PATH", DEFAULT_MODEL_PATH)
FEATURE_COLUMNS = ["avg_temp", "average_rain_fall_mm_per_year", "ph"]


class ModelUnavailableError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def load_model_artifact() -> dict:
    if not os.path.exists(MODEL_PATH):
        raise ModelUnavailableError(
            f"Model artifact not found at {MODEL_PATH}. Run `python train_model.py` from the backend directory."
        )

    try:
        import joblib
    except ImportError as exc:
        raise ModelUnavailableError("joblib is not installed. Install backend requirements before running inference.") from exc

    artifact = joblib.load(MODEL_PATH)
    if not isinstance(artifact, dict) or "model" not in artifact:
        artifact = {"model": artifact, "feature_columns": FEATURE_COLUMNS, "metrics": {}, "model_type": artifact.__class__.__name__}
    return artifact


def predict_yield(payload) -> dict:
    artifact = load_model_artifact()
    feature_columns = artifact.get("feature_columns", FEATURE_COLUMNS)
    features = {
        "avg_temp": payload.avg_temp,
        "average_rain_fall_mm_per_year": payload.rainfall,
        "ph": payload.soil_ph,
    }
    vector = np.array([[features[column] for column in feature_columns]], dtype=float)
    raw_prediction = float(artifact["model"].predict(vector)[0])
    predicted_yield = round(max(raw_prediction, 0), 2)

    weather = analyze_weather(payload.avg_temp, payload.rainfall)
    soil = analyze_soil(payload.soil_ph, payload.nitrogen, payload.phosphorus, payload.potassium, payload.organic_matter)
    metrics = artifact.get("metrics", {})
    # Confidence is tied to model error rather than a fixed display value.  It is
    # discounted when the requested conditions depart from agronomic bands.
    baseline = 100.0
    if metrics.get("mae") is not None:
        baseline -= min(float(metrics["mae"]) / max(predicted_yield, 1) * 100, 55)
    if metrics.get("r2") is not None:
        baseline *= clamp((float(metrics["r2"]) + 1) / 2, 0.25, 1)
    confidence = round(clamp(baseline * 0.7 + weather["score"] * 0.15 + soil["score"] * 0.15, 0, 100), 1)
    importances = getattr(artifact["model"], "feature_importances_", None)
    contributing_factors = []
    if importances is not None:
        contributing_factors = [
            {"feature": column, "importance": round(float(importance), 4)}
            for column, importance in sorted(zip(feature_columns, importances), key=lambda item: item[1], reverse=True)
        ]

    return {
        "predicted_yield_kg_per_ha": predicted_yield,
        "confidence_score": confidence,
        "crop_name": payload.crop_name,
        "weather_analysis": weather,
        "soil_analysis": soil,
        "model": {
            "type": artifact.get("model_type", artifact["model"].__class__.__name__),
            "feature_columns": feature_columns,
            "metrics": artifact.get("metrics", {}),
        },
        "prediction_interval": {
            "lower_kg_per_ha": round(max(0, predicted_yield - float(metrics.get("mae", 0))), 2),
            "upper_kg_per_ha": round(predicted_yield + float(metrics.get("mae", 0)), 2),
        },
        "contributing_factors": contributing_factors,
    }
