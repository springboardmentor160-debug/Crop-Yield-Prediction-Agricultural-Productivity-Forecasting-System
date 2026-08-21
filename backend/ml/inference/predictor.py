"""
YieldSense AI — Inference Predictors

Loads trained models and preprocessing artifacts (lazy singletons)
for both crop yield prediction (regression) and crop recommendation (classification),
serving predictions on demand.
"""

import json
import os
import threading
from typing import Any, Dict, Optional

import joblib
import numpy as np
import pandas as pd

from ml.utils.config import (
    CROP_MODEL_FILE,
    CROP_SCALER_FILE,
    CROP_METADATA_FILE,
    YIELD_MODEL_FILE,
    YIELD_SCALER_FILE,
    YIELD_FEATURE_COLUMNS_FILE,
    YIELD_METADATA_FILE,
)


class CropYieldPredictor:
    """
    Production predictor that loads the crop yield regression model
    and serves yield predictions. Thread-safe lazy singleton.
    """

    _instance: Optional["CropYieldPredictor"] = None
    _lock = threading.Lock()

    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.metadata = None
        self._loaded = False

    @classmethod
    def get_instance(cls) -> "CropYieldPredictor":
        """Get or create the singleton predictor instance."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = cls()
                    instance._load_artifacts()
                    cls._instance = instance
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        """Reset the singleton instance."""
        with cls._lock:
            cls._instance = None

    def _load_artifacts(self) -> None:
        """Load all saved model artifacts from disk."""
        required_files = [
            YIELD_MODEL_FILE,
            YIELD_SCALER_FILE,
            YIELD_FEATURE_COLUMNS_FILE,
        ]

        for filepath in required_files:
            if not os.path.exists(filepath):
                raise FileNotFoundError(
                    f"Yield model artifact not found: {filepath}. "
                    "Please run the training pipeline first: python -m ml.train"
                )

        self.model = joblib.load(YIELD_MODEL_FILE)
        self.scaler = joblib.load(YIELD_SCALER_FILE)
        self.feature_columns = joblib.load(YIELD_FEATURE_COLUMNS_FILE)

        if os.path.exists(YIELD_METADATA_FILE):
            with open(YIELD_METADATA_FILE, "r") as f:
                self.metadata = json.load(f)

        self._loaded = True
        print(f"Yield Predictor loaded: {self.metadata.get('best_model', 'Unknown')}")

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict crop yield in tons/hectare.
        """
        if not self._loaded:
            raise RuntimeError("Yield model not loaded. Call get_instance() first.")

        # Domain-specific agricultural viability override rules
        temp = float(input_data.get("temperature", 25.0))
        rainfall = float(input_data.get("annual_rainfall", 1000.0))
        ph = float(input_data.get("soil_ph", 6.5))
        n = float(input_data.get("nitrogen", 50.0))
        p = float(input_data.get("phosphorus", 50.0))
        k = float(input_data.get("potassium", 50.0))

        is_unviable = False
        reason = ""

        if rainfall < 50.0:
            is_unviable = True
            reason = "Extreme Drought"
        elif temp < 5.0 or temp > 48.0:
            is_unviable = True
            reason = "Extreme Temperature"
        elif ph < 4.0 or ph > 9.5:
            is_unviable = True
            reason = "Extreme Soil pH"
        elif n < 5.0 and p < 5.0 and k < 5.0:
            is_unviable = True
            reason = "Severe Nutrient Depletion"

        if is_unviable:
            return {
                "predicted_yield": 0.0,
                "prediction_unit": "tons/hectare",
                "model_used": f"Rule Override ({reason})",
                "model_accuracy": 1.0,
                "confidence": "High",
            }

        # crop normalization mapping to yield_df crop categories
        crop_mapping = {
            "rice": "Rice, paddy",
            "wheat": "Wheat",
            "maize": "Maize",
            "potatoes": "Potatoes",
            "potato": "Potatoes",
            "soybeans": "Soybeans",
            "soybean": "Soybeans",
            "sorghum": "Sorghum",
            "cassava": "Cassava",
            "sweet potatoes": "Sweet potatoes",
            "sweet potato": "Sweet potatoes",
            "yams": "Yams",
            "yam": "Yams",
            "plantains and others": "Plantains and others",
            "plantains": "Plantains and others",
        }

        user_crop = str(input_data.get("crop", "")).strip().lower()
        mapped_crop = crop_mapping.get(user_crop, None)

        # Build feature dict
        features = {}
        
        # 1. Base numeric features
        features["Year"] = 2026
        features["average_rain_fall_mm_per_year"] = float(input_data.get("annual_rainfall", 1000.0))
        features["pesticides_tonnes"] = float(input_data.get("pesticide_usage", 100.0))
        features["avg_temp"] = float(input_data.get("temperature", 25.0))

        # Scale numerical features
        numerical_features = pd.DataFrame([features])
        scaled_nums = self.scaler.transform(numerical_features)
        
        # Write back scaled numerical values
        features["Year"] = scaled_nums[0][0]
        features["average_rain_fall_mm_per_year"] = scaled_nums[0][1]
        features["pesticides_tonnes"] = scaled_nums[0][2]
        features["avg_temp"] = scaled_nums[0][3]

        # 2. Add one-hot encoded categorical columns (Area_* and Item_*)
        for col in self.feature_columns:
            if col in ["Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]:
                continue
            features[col] = 0

        # Default country (Area) to India
        if "Area_India" in features:
            features["Area_India"] = 1

        # Set specific crop item
        if mapped_crop:
            crop_col = f"Item_{mapped_crop}"
            if crop_col in features:
                features[crop_col] = 1

        # Create input array in the correct feature order
        X = np.array([[features[col] for col in self.feature_columns]])

        # Predict hg/ha_yield
        predicted_hg_ha = self.model.predict(X)[0]
        
        # Convert to tons/hectare (1 hg/ha = 0.0001 tons/ha)
        predicted_tons = max(0.0, float(predicted_hg_ha) / 10000.0)

        # Determine confidence based on R2
        r2 = self.metadata["metrics"]["R2"] if self.metadata else 0
        if r2 >= 0.85:
            confidence = "High"
        elif r2 >= 0.65:
            confidence = "Medium"
        else:
            confidence = "Low"

        return {
            "predicted_yield": round(predicted_tons, 3),
            "prediction_unit": "tons/hectare",
            "model_used": self.metadata.get("best_model", "Unknown") if self.metadata else "Unknown",
            "model_accuracy": round(r2, 4) if self.metadata else None,
            "confidence": confidence,
        }

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def get_model_info(self) -> Dict[str, Any]:
        """Return metadata about the loaded yield model."""
        if not self.metadata:
            return {"status": "not_loaded"}
        return {
            "model_name": self.metadata.get("best_model"),
            "test_r2": self.metadata["metrics"].get("R2"),
            "test_mae": self.metadata["metrics"].get("MAE"),
            "test_rmse": self.metadata["metrics"].get("RMSE"),
            "num_features": len(self.feature_columns),
            "feature_names": self.feature_columns,
            "status": "ready"
        }


class CropRecommendationPredictor:
    """
    Production predictor that loads the crop recommendation classification model
    and serves recommendations. Thread-safe lazy singleton.
    """

    _instance: Optional["CropRecommendationPredictor"] = None
    _lock = threading.Lock()

    def __init__(self):
        self.model = None
        self.scaler = None
        self.metadata = None
        self._loaded = False

    @classmethod
    def get_instance(cls) -> "CropRecommendationPredictor":
        """Get or create the singleton predictor instance."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = cls()
                    instance._load_artifacts()
                    cls._instance = instance
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        """Reset the singleton instance."""
        with cls._lock:
            cls._instance = None

    def _load_artifacts(self) -> None:
        """Load all saved model artifacts from disk."""
        required_files = [
            CROP_MODEL_FILE,
            CROP_SCALER_FILE,
            CROP_METADATA_FILE,
        ]

        for filepath in required_files:
            if not os.path.exists(filepath):
                raise FileNotFoundError(
                    f"Crop recommendation model artifact not found: {filepath}. "
                    "Please run the training pipeline first: python -m ml.train"
                )

        self.model = joblib.load(CROP_MODEL_FILE)
        self.scaler = joblib.load(CROP_SCALER_FILE)

        with open(CROP_METADATA_FILE, "r") as f:
            self.metadata = json.load(f)

        self._loaded = True
        print(f"Crop Recommendation Predictor loaded: {self.metadata.get('best_model', 'Unknown')}")

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recommend the optimal crop based on soil and weather properties.
        """
        if not self._loaded:
            raise RuntimeError("Crop recommendation model not loaded. Call get_instance() first.")

        # N, P, K, temperature, humidity, pH, rainfall
        features = [
            float(input_data.get("nitrogen", 50.0)),
            float(input_data.get("phosphorus", 50.0)),
            float(input_data.get("potassium", 50.0)),
            float(input_data.get("temperature", 25.0)),
            float(input_data.get("humidity", 60.0)),
            float(input_data.get("soil_ph", 6.5)),
            float(input_data.get("annual_rainfall", 1000.0)),
        ]

        X = np.array([features])
        X_scaled = self.scaler.transform(X)

        # Predict class index
        class_idx = int(self.model.predict(X_scaled)[0])
        
        # Map class index to string label
        label_map = self.metadata.get("label_map", {})
        # JSON keys are stored as string
        recommended_crop = label_map.get(str(class_idx), label_map.get(class_idx, "Unknown"))

        # Predict probabilities for top 3 recommendations
        probs = self.model.predict_proba(X_scaled)[0]
        top_indices = np.argsort(probs)[::-1][:3]
        
        top_recommendations = []
        for idx in top_indices:
            crop_name = label_map.get(str(idx), label_map.get(idx, "Unknown"))
            prob = float(probs[idx])
            top_recommendations.append({
                "crop": crop_name.capitalize(),
                "confidence": round(prob * 100, 1)
            })

        return {
            "recommended_crop": recommended_crop.capitalize(),
            "top_recommendations": top_recommendations,
            "model_used": self.metadata.get("best_model", "Unknown"),
            "model_accuracy": round(self.metadata["metrics"]["Accuracy"], 4) if self.metadata else None,
        }

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def get_model_info(self) -> Dict[str, Any]:
        """Return metadata about the loaded recommendation model."""
        if not self.metadata:
            return {"status": "not_loaded"}
        return {
            "model_name": self.metadata.get("best_model"),
            "accuracy": self.metadata["metrics"].get("Accuracy"),
            "f1_score": self.metadata["metrics"].get("F1-Score (Weighted)"),
            "feature_names": self.metadata.get("feature_names"),
            "status": "ready"
        }
