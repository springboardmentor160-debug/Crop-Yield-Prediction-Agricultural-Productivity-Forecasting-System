from __future__ import annotations

import json
from pathlib import Path
from time import perf_counter

import joblib
import numpy as np
import pandas as pd

from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


ML_ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "yieldsense_ml_dataset.csv"
)

ARTIFACTS_DIR = ML_ROOT / "artifacts"
REPORTS_DIR = ML_ROOT / "reports"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

TARGET_COLUMN = "Yield"

CATEGORICAL_FEATURES = [
    "Crop",
    "Season",
    "State",
]

NUMERIC_FEATURES = [
    "Crop_Year",
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide",
    "N",
    "P",
    "K",
    "pH",
    "avg_temp_c",
    "total_rainfall_mm",
    "avg_humidity_percent",
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

TEST_SIZE = 0.20
RANDOM_STATE = 42


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="median"),
            ),
            (
                "scaler",
                StandardScaler(),
            ),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="most_frequent"),
            ),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore",
                ),
            ),
        ]
    )

    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                numeric_pipeline,
                NUMERIC_FEATURES,
            ),
            (
                "categorical",
                categorical_pipeline,
                CATEGORICAL_FEATURES,
            ),
        ]
    )


def convert_predictions_to_original_scale(
    log_predictions: np.ndarray,
) -> np.ndarray:
    """
    Convert log1p predictions back to the original Yield scale.

    Negative yield predictions are clipped to zero because agricultural
    yield cannot be negative.
    """
    predictions = np.expm1(log_predictions)

    return np.clip(predictions, a_min=0, a_max=None)


def evaluate_model(
    model_name: str,
    model: Pipeline,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train_log: pd.Series,
    y_test_log: pd.Series,
    y_train_original: pd.Series,
    y_test_original: pd.Series,
) -> dict:
    started_at = perf_counter()

    model.fit(X_train, y_train_log)

    training_seconds = perf_counter() - started_at

    train_log_predictions = model.predict(X_train)
    test_log_predictions = model.predict(X_test)

    train_predictions = convert_predictions_to_original_scale(
        train_log_predictions
    )
    test_predictions = convert_predictions_to_original_scale(
        test_log_predictions
    )

    train_mae = mean_absolute_error(
        y_train_original,
        train_predictions,
    )

    test_mae = mean_absolute_error(
        y_test_original,
        test_predictions,
    )

    train_rmse = mean_squared_error(
        y_train_original,
        train_predictions,
    ) ** 0.5

    test_rmse = mean_squared_error(
        y_test_original,
        test_predictions,
    ) ** 0.5

    train_r2 = r2_score(
        y_train_original,
        train_predictions,
    )

    test_r2 = r2_score(
        y_test_original,
        test_predictions,
    )

    log_test_mae = mean_absolute_error(
        y_test_log,
        test_log_predictions,
    )

    log_test_rmse = mean_squared_error(
        y_test_log,
        test_log_predictions,
    ) ** 0.5

    result = {
        "model": model_name,
        "training_seconds": round(training_seconds, 4),
        "train_mae": round(float(train_mae), 6),
        "test_mae": round(float(test_mae), 6),
        "train_rmse": round(float(train_rmse), 6),
        "test_rmse": round(float(test_rmse), 6),
        "train_r2": round(float(train_r2), 6),
        "test_r2": round(float(test_r2), 6),
        "log_test_mae": round(float(log_test_mae), 6),
        "log_test_rmse": round(float(log_test_rmse), 6),
    }

    return result


def print_result(result: dict) -> None:
    print()
    print(result["model"])
    print("-" * 60)
    print(
        f"Training Time : {result['training_seconds']:.4f} seconds"
    )
    print(f"Train MAE     : {result['train_mae']:.6f}")
    print(f"Test MAE      : {result['test_mae']:.6f}")
    print(f"Train RMSE    : {result['train_rmse']:.6f}")
    print(f"Test RMSE     : {result['test_rmse']:.6f}")
    print(f"Train R²      : {result['train_r2']:.6f}")
    print(f"Test R²       : {result['test_r2']:.6f}")
    print(f"Log Test MAE  : {result['log_test_mae']:.6f}")
    print(f"Log Test RMSE : {result['log_test_rmse']:.6f}")


def main() -> None:
    print("=" * 60)
    print("YieldSense AI - Baseline Model Training")
    print("=" * 60)

    dataframe = pd.read_csv(DATASET_PATH)

    missing_columns = [
        column
        for column in ALL_FEATURES + [TARGET_COLUMN]
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Dataset is missing columns: {missing_columns}"
        )

    X = dataframe[ALL_FEATURES].copy()
    y_original = dataframe[TARGET_COLUMN].astype(float)
    y_log = np.log1p(y_original)

    (
        X_train,
        X_test,
        y_train_log,
        y_test_log,
        y_train_original,
        y_test_original,
    ) = train_test_split(
        X,
        y_log,
        y_original,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
    )

    print()
    print(f"Total Samples    : {len(dataframe)}")
    print(f"Training Samples : {len(X_train)}")
    print(f"Testing Samples  : {len(X_test)}")
    print(f"Target Transform : log1p(Yield)")

    preprocessor = build_preprocessor()

    models = {
        "Median Baseline": Pipeline(
            steps=[
                (
                    "preprocessor",
                    clone(preprocessor),
                ),
                (
                    "model",
                    DummyRegressor(strategy="median"),
                ),
            ]
        ),
        "Linear Regression": Pipeline(
            steps=[
                (
                    "preprocessor",
                    clone(preprocessor),
                ),
                (
                    "model",
                    LinearRegression(),
                ),
            ]
        ),
    }

    results = []

    for model_name, model in models.items():
        print()
        print(f"Training {model_name}...")

        result = evaluate_model(
            model_name=model_name,
            model=model,
            X_train=X_train,
            X_test=X_test,
            y_train_log=y_train_log,
            y_test_log=y_test_log,
            y_train_original=y_train_original,
            y_test_original=y_test_original,
        )

        results.append(result)
        print_result(result)

        artifact_name = (
            model_name.lower()
            .replace(" ", "_")
            .replace("-", "_")
        )

        joblib.dump(
            model,
            ARTIFACTS_DIR / f"{artifact_name}_pipeline.joblib",
        )

    results_dataframe = pd.DataFrame(results).sort_values(
        by="test_mae"
    )

    csv_report_path = (
        REPORTS_DIR / "baseline_model_comparison.csv"
    )

    json_report_path = (
        REPORTS_DIR / "baseline_model_comparison.json"
    )

    results_dataframe.to_csv(
        csv_report_path,
        index=False,
    )

    json_report_path.write_text(
        json.dumps(
            results,
            indent=2,
        ),
        encoding="utf-8",
    )

    print()
    print("=" * 60)
    print("Baseline Model Comparison")
    print("=" * 60)

    print(
        results_dataframe[
            [
                "model",
                "test_mae",
                "test_rmse",
                "test_r2",
                "log_test_mae",
            ]
        ].to_string(index=False)
    )

    print()
    print("Reports saved:")
    print(csv_report_path)
    print(json_report_path)

    print()
    print("Model pipelines saved:")
    print(
        ARTIFACTS_DIR / "median_baseline_pipeline.joblib"
    )
    print(
        ARTIFACTS_DIR / "linear_regression_pipeline.joblib"
    )


if __name__ == "__main__":
    main()