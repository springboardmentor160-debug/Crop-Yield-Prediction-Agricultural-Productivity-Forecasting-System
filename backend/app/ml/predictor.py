"""
YieldSense AI - ML Predictor
Loads trained model and runs yield predictions
"""
import joblib
import numpy as np
import os
from typing import Optional

MODEL_PATH = "app/ml/model.pkl"
ENCODER_PATH = "app/ml/label_encoder.pkl"
FEATURES_PATH = "app/ml/features.pkl"
METRICS_PATH = "app/ml/metrics.pkl"

# Load model at startup
_model = None
_encoder = None
_features = None
_metrics = None

def load_model():
    global _model, _encoder, _features, _metrics
    if not os.path.exists(MODEL_PATH):
        print("WARNING: model.pkl not found. Run train_model.py first.")
        return False
    try:
        _model = joblib.load(MODEL_PATH)
        _encoder = joblib.load(ENCODER_PATH) if os.path.exists(ENCODER_PATH) else None
        _features = joblib.load(FEATURES_PATH) if os.path.exists(FEATURES_PATH) else []
        _metrics = joblib.load(METRICS_PATH) if os.path.exists(METRICS_PATH) else {}
        print(f"Model loaded successfully. Features: {_features}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def get_risk_level(yield_val: float, crop_type: str) -> str:
    baselines = {
        "wheat": 3.2, "rice": 4.0, "maize": 5.5,
        "soybean": 2.8, "cotton": 2.0,
        "default": 3.5
    }
    baseline = baselines.get(crop_type.lower(), baselines["default"])
    ratio = yield_val / baseline
    if ratio >= 0.9: return "Low"
    elif ratio >= 0.7: return "Medium"
    else: return "High"

def get_confidence(yield_val: float) -> float:
    if _metrics:
        r2 = _metrics.get("r2", 0.85)
        return round(min(r2 * 100, 99.0), 1)
    return 85.0

def get_recommendations(
    yield_val: float,
    crop_type: str,
    rainfall: float,
    temperature: float,
    soil_ph: float,
    nitrogen: float = 0,
    phosphorus: float = 0,
    potassium: float = 0,
) -> list:
    recs = []
    risk = get_risk_level(yield_val, crop_type)

    if risk == "High":
        recs.append({
            "category": "Yield Alert",
            "message": f"Predicted yield is below optimal for {crop_type}. Consider reviewing soil nutrients and irrigation.",
            "priority": "high"
        })

    if rainfall < 500:
        recs.append({
            "category": "Irrigation",
            "message": "Low rainfall detected. Supplement with drip irrigation to maintain crop moisture.",
            "priority": "high"
        })
    elif rainfall > 2000:
        recs.append({
            "category": "Drainage",
            "message": "Excessive rainfall may cause waterlogging. Ensure proper field drainage.",
            "priority": "medium"
        })

    if temperature > 35:
        recs.append({
            "category": "Heat Stress",
            "message": "High temperature may stress crops. Consider shade nets or heat-tolerant varieties.",
            "priority": "high"
        })
    elif temperature < 10:
        recs.append({
            "category": "Cold Protection",
            "message": "Low temperature may affect germination. Use frost protection measures.",
            "priority": "medium"
        })

    if soil_ph < 5.5:
        recs.append({
            "category": "Soil pH",
            "message": "Soil is too acidic. Apply agricultural lime to raise pH to optimal range (6.0-7.0).",
            "priority": "high"
        })
    elif soil_ph > 7.5:
        recs.append({
            "category": "Soil pH",
            "message": "Soil is too alkaline. Apply sulfur or organic matter to lower pH.",
            "priority": "medium"
        })

    if nitrogen > 0 and nitrogen < 40:
        recs.append({
            "category": "Fertilization",
            "message": "Low nitrogen levels. Apply urea or ammonium nitrate to boost crop growth.",
            "priority": "medium"
        })

    if not recs:
        recs.append({
            "category": "Optimal Conditions",
            "message": f"Conditions are favorable for {crop_type} cultivation. Maintain current practices.",
            "priority": "low"
        })

    return recs

def predict(
    crop_type: str,
    rainfall: float,
    temperature: float,
    humidity: float = 60.0,
    soil_ph: float = 6.5,
    nitrogen: float = 0,
    phosphorus: float = 0,
    potassium: float = 0,
    pesticides: float = 0,
    year: int = 2026,
) -> dict:
    # Fallback if model not loaded
    if _model is None:
        if not load_model():
            # Return mock prediction
            mock_yield = {"wheat": 3.2, "rice": 4.0, "maize": 5.5, "soybean": 2.8, "cotton": 2.0}.get(crop_type.lower(), 3.5)
            return {
                "predicted_yield_tons_per_ha": round(mock_yield * (0.8 + rainfall/5000), 2),
                "confidence_score": 75.0,
                "risk_level": "Medium",
                "recommendations": get_recommendations(mock_yield, crop_type, rainfall, temperature, soil_ph, nitrogen, phosphorus, potassium),
                "model_used": "fallback",
            }

    # Encode crop type
    crop_encoded = 0
    if _encoder:
        try:
            crop_encoded = int(_encoder.transform([crop_type])[0])
        except ValueError:
            crop_encoded = 0

    # Build feature vector
    feature_map = {
        "crop_encoded": crop_encoded,
        "rainfall": rainfall,
        "temperature": temperature,
        "humidity": humidity,
        "soil_ph": soil_ph,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "pesticides": pesticides,
        "year": year,
    }

    X = np.array([[feature_map.get(f, 0) for f in (_features or list(feature_map.keys()))]])
    yield_pred = float(_model.predict(X)[0])
    yield_pred = max(0.1, round(yield_pred, 2))

    risk = get_risk_level(yield_pred, crop_type)
    confidence = get_confidence(yield_pred)
    recommendations = get_recommendations(
        yield_pred, crop_type, rainfall, temperature,
        soil_ph, nitrogen, phosphorus, potassium
    )

    return {
        "predicted_yield_tons_per_ha": yield_pred,
        "confidence_score": confidence,
        "risk_level": risk,
        "recommendations": recommendations,
        "model_used": "xgboost",
    }

def get_model_metrics() -> dict:
    if _metrics:
        return _metrics
    return {"status": "Model not trained yet"}

def get_available_crops() -> list:
    if _encoder:
        return list(_encoder.classes_)
    return ["wheat", "rice", "maize", "soybean", "cotton"]

# Load model when module is imported
load_model()
