import json
import os
from dataclasses import dataclass
from typing import Iterable

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FEATURE_COLUMNS = ["avg_temp", "average_rain_fall_mm_per_year", "ph"]
TARGET_COLUMN = "yield_kg_per_ha"
DEFAULT_DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "crop_yield_clean.csv")
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "data", "processed", "crop_yield_model.pkl")
DEFAULT_METRICS_PATH = os.path.join(BASE_DIR, "data", "processed", "model_metrics.json")


@dataclass
class TrainingResult:
    model_path: str
    metrics_path: str
    mae: float
    rmse: float
    r2: float
    training_rows: int
    test_rows: int
    model_type: str


def _first_existing_column(columns: Iterable[str], candidates: list[str]) -> str | None:
    available = set(columns)
    for candidate in candidates:
        if candidate in available:
            return candidate
    return None


def prepare_training_frame(data_path: str) -> pd.DataFrame:
    df = pd.read_csv(data_path)

    column_map = {
        "avg_temp": _first_existing_column(df.columns, ["avg_temp", "Temperature_C", "temperature", "average_temperature"]),
        "average_rain_fall_mm_per_year": _first_existing_column(
            df.columns,
            ["average_rain_fall_mm_per_year", "Rainfall_mm", "rainfall", "rainfall_mm"],
        ),
        "ph": _first_existing_column(df.columns, ["ph", "Soil_pH", "soil_ph", "ph_value"]),
        TARGET_COLUMN: _first_existing_column(df.columns, [TARGET_COLUMN, "hg/ha_yield", "Yield_Tons", "yield_amount"]),
    }

    missing = [canonical for canonical, source in column_map.items() if source is None]
    if missing:
        raise ValueError(f"Dataset is missing required training columns: {', '.join(missing)}")

    prepared = pd.DataFrame({canonical: pd.to_numeric(df[source], errors="coerce") for canonical, source in column_map.items()})
    
    # Apply proper unit conversion if canonical target was converted from a non-kg/ha column
    source_target = column_map[TARGET_COLUMN]
    if source_target == "hg/ha_yield":
        prepared[TARGET_COLUMN] = prepared[TARGET_COLUMN] / 10.0
    elif source_target == "Yield_Tons":
        area_col = _first_existing_column(df.columns, ["Area_Hectares", "area", "area_cultivated"])
        if area_col:
            prepared[TARGET_COLUMN] = (prepared[TARGET_COLUMN] / pd.to_numeric(df[area_col], errors="coerce")) * 1000.0
        else:
            prepared[TARGET_COLUMN] = prepared[TARGET_COLUMN] * 1000.0

    prepared = prepared.replace([np.inf, -np.inf], np.nan).dropna()
    prepared = prepared[(prepared["ph"] >= 0) & (prepared["ph"] <= 14)]
    prepared = prepared[prepared["average_rain_fall_mm_per_year"] >= 0]
    prepared = prepared[prepared[TARGET_COLUMN] >= 0]

    if len(prepared) < 3:
        raise ValueError("Training dataset must contain at least 3 valid rows after cleaning")

    return prepared


def _build_model():
    try:
        from xgboost import XGBRegressor

        return XGBRegressor(
            n_estimators=20,
            learning_rate=0.2,
            max_depth=1,
            subsample=0.8,
            objective="reg:squarederror",
            random_state=42,
        )
    except ImportError:
        from sklearn.ensemble import RandomForestRegressor

        return RandomForestRegressor(n_estimators=30, max_depth=2, random_state=42)


def train_yield_engine(
    data_path: str = DEFAULT_DATA_PATH,
    model_export_path: str = DEFAULT_MODEL_PATH,
    metrics_export_path: str = DEFAULT_METRICS_PATH,
) -> TrainingResult:
    print("Initializing YieldSense AI training sequence...")
    prepared = prepare_training_frame(data_path)

    x = prepared[FEATURE_COLUMNS]
    y = prepared[TARGET_COLUMN]
    test_size = 0.2 if len(prepared) >= 10 else 0.34
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=test_size, random_state=42)

    model = _build_model()
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    mae = float(mean_absolute_error(y_test, predictions))
    rmse = float(np.sqrt(mean_squared_error(y_test, predictions)))
    r2 = float(r2_score(y_test, predictions)) if len(y_test) > 1 else 0.0

    artifact = {
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "model_type": model.__class__.__name__,
        "metrics": {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "training_rows": int(len(x_train)),
            "test_rows": int(len(x_test)),
        },
    }

    os.makedirs(os.path.dirname(model_export_path), exist_ok=True)
    joblib.dump(artifact, model_export_path)

    with open(metrics_export_path, "w", encoding="utf-8") as metrics_file:
        json.dump(artifact["metrics"] | {"model_type": artifact["model_type"]}, metrics_file, indent=2)

    print("Training Complete\n")
    print(f"MAE : {mae:.2f}\n")
    print(f"RMSE : {rmse:.2f}\n")
    print(f"R2   : {r2:.3f}\n")
    print("Model Saved Successfully")

    return TrainingResult(
        model_path=model_export_path,
        metrics_path=metrics_export_path,
        mae=mae,
        rmse=rmse,
        r2=r2,
        training_rows=int(len(x_train)),
        test_rows=int(len(x_test)),
        model_type=artifact["model_type"],
    )


if __name__ == "__main__":
    train_yield_engine()
