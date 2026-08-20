"""
Train the YieldSense AI yield-prediction model.

Run with:  python -m app.ml.train

Trains a RandomForestRegressor inside a scikit-learn Pipeline (with a
ColumnTransformer for categorical one-hot encoding), evaluates it with
a held-out test split, and persists the fitted pipeline + metrics to
app/ml/artifacts/. This mirrors the "5. Machine Learning Model" stage
of the architecture diagram (feature engineering -> training ->
evaluation -> confidence estimation).
"""
from __future__ import annotations

import json
import os
import time

import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.core.config import settings
from app.ml.dataset import generate_training_dataframe

NUMERIC_FEATURES = [
    "temperature_c",
    "rainfall_mm",
    "humidity_pct",
    "ph_level",
    "nitrogen_ppm",
    "phosphorus_ppm",
    "potassium_ppm",
    "organic_matter_pct",
    "area_hectares",
]
CATEGORICAL_FEATURES = ["crop_name", "season", "irrigation_type", "soil_texture"]
TARGET = "yield_kg_per_ha"


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=14,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1,
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def train_and_save() -> dict:
    df = generate_training_dataframe(n_samples=6000)
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = build_pipeline()

    start = time.time()
    pipeline.fit(X_train, y_train)
    train_seconds = time.time() - start

    preds = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    r2 = r2_score(y_test, preds)
    mape = float(np.mean(np.abs((y_test - preds) / y_test)) * 100)

    metrics = {
        "mae_kg_per_ha": round(mae, 2),
        "rmse_kg_per_ha": round(rmse, 2),
        "r2_score": round(r2, 4),
        "mape_pct": round(mape, 2),
        "train_seconds": round(train_seconds, 2),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "model_version": "rf-v1",
    }

    artifact_dir = settings.MODEL_ARTIFACT_DIR
    os.makedirs(artifact_dir, exist_ok=True)
    joblib.dump(pipeline, os.path.join(artifact_dir, settings.YIELD_MODEL_FILENAME))
    with open(os.path.join(artifact_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print("Training complete.")
    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    train_and_save()
