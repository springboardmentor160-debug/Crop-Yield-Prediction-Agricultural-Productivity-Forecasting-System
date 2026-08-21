from __future__ import annotations

import json
from pathlib import Path
from time import perf_counter

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import (
    RandomizedSearchCV,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


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


def to_original_scale(
    log_predictions: np.ndarray,
) -> np.ndarray:
    predictions = np.expm1(log_predictions)

    return np.clip(
        predictions,
        a_min=0,
        a_max=None,
    )


def calculate_metrics(
    actual: pd.Series,
    predicted: np.ndarray,
) -> dict[str, float]:
    return {
        "mae": float(
            mean_absolute_error(actual, predicted)
        ),
        "rmse": float(
            mean_squared_error(actual, predicted) ** 0.5
        ),
        "r2": float(
            r2_score(actual, predicted)
        ),
    }


def main() -> None:
    print("=" * 60)
    print("YieldSense AI - Random Forest Training")
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
    print("Target Transform : log1p(Yield)")

    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(),
            ),
            (
                "model",
                RandomForestRegressor(
                    random_state=RANDOM_STATE,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    parameter_distributions = {
        "model__n_estimators": [
            100,
            200,
            300,
            500,
        ],
        "model__max_depth": [
            None,
            10,
            20,
            30,
            40,
        ],
        "model__min_samples_split": [
            2,
            5,
            10,
        ],
        "model__min_samples_leaf": [
            1,
            2,
            4,
        ],
        "model__max_features": [
            "sqrt",
            0.5,
            0.8,
            1.0,
        ],
        "model__bootstrap": [
            True,
        ],
    }

    print()
    print("Running randomized hyperparameter search...")
    print("Random combinations : 30")
    print("Cross-validation    : 3 folds")
    print("Total fits          : 90")
    print()
    print(
        "This may take several minutes depending on "
        "your computer."
    )

    search = RandomizedSearchCV(
        estimator=pipeline,
        param_distributions=parameter_distributions,
        n_iter=30,
        scoring="neg_mean_absolute_error",
        cv=3,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbose=1,
        refit=True,
        return_train_score=True,
    )

    started_at = perf_counter()

    search.fit(
        X_train,
        y_train_log,
    )

    training_seconds = perf_counter() - started_at

    best_pipeline = search.best_estimator_

    train_log_predictions = best_pipeline.predict(X_train)
    test_log_predictions = best_pipeline.predict(X_test)

    train_predictions = to_original_scale(
        train_log_predictions
    )

    test_predictions = to_original_scale(
        test_log_predictions
    )

    train_metrics = calculate_metrics(
        y_train_original,
        train_predictions,
    )

    test_metrics = calculate_metrics(
        y_test_original,
        test_predictions,
    )

    log_train_mae = mean_absolute_error(
        y_train_log,
        train_log_predictions,
    )

    log_test_mae = mean_absolute_error(
        y_test_log,
        test_log_predictions,
    )

    log_train_rmse = (
        mean_squared_error(
            y_train_log,
            train_log_predictions,
        )
        ** 0.5
    )

    log_test_rmse = (
        mean_squared_error(
            y_test_log,
            test_log_predictions,
        )
        ** 0.5
    )

    result = {
        "model": "Random Forest Regressor",
        "best_parameters": search.best_params_,
        "best_cv_log_mae": round(
            float(-search.best_score_),
            6,
        ),
        "training_seconds": round(
            training_seconds,
            4,
        ),
        "train_mae": round(
            train_metrics["mae"],
            6,
        ),
        "test_mae": round(
            test_metrics["mae"],
            6,
        ),
        "train_rmse": round(
            train_metrics["rmse"],
            6,
        ),
        "test_rmse": round(
            test_metrics["rmse"],
            6,
        ),
        "train_r2": round(
            train_metrics["r2"],
            6,
        ),
        "test_r2": round(
            test_metrics["r2"],
            6,
        ),
        "log_train_mae": round(
            float(log_train_mae),
            6,
        ),
        "log_test_mae": round(
            float(log_test_mae),
            6,
        ),
        "log_train_rmse": round(
            float(log_train_rmse),
            6,
        ),
        "log_test_rmse": round(
            float(log_test_rmse),
            6,
        ),
    }

    artifact_path = (
        ARTIFACTS_DIR
        / "random_forest_pipeline.joblib"
    )

    report_path = (
        REPORTS_DIR
        / "random_forest_results.json"
    )

    cv_results_path = (
        REPORTS_DIR
        / "random_forest_cv_results.csv"
    )

    joblib.dump(
        best_pipeline,
        artifact_path,
    )

    report_path.write_text(
        json.dumps(
            result,
            indent=2,
        ),
        encoding="utf-8",
    )

    cv_results = pd.DataFrame(
        search.cv_results_
    ).sort_values(
        by="rank_test_score"
    )

    cv_results.to_csv(
        cv_results_path,
        index=False,
    )

    print()
    print("=" * 60)
    print("Random Forest Result")
    print("=" * 60)

    print()
    print("Best Parameters")
    print("-" * 60)

    for key, value in search.best_params_.items():
        print(f"{key}: {value}")

    print()
    print(
        f"Training Time   : "
        f"{training_seconds:.4f} seconds"
    )
    print(
        f"Best CV Log MAE : "
        f"{-search.best_score_:.6f}"
    )

    print()
    print("Original Yield Scale")
    print("-" * 60)
    print(f"Train MAE       : {train_metrics['mae']:.6f}")
    print(f"Test MAE        : {test_metrics['mae']:.6f}")
    print(f"Train RMSE      : {train_metrics['rmse']:.6f}")
    print(f"Test RMSE       : {test_metrics['rmse']:.6f}")
    print(f"Train R²        : {train_metrics['r2']:.6f}")
    print(f"Test R²         : {test_metrics['r2']:.6f}")

    print()
    print("Log Yield Scale")
    print("-" * 60)
    print(f"Train MAE       : {log_train_mae:.6f}")
    print(f"Test MAE        : {log_test_mae:.6f}")
    print(f"Train RMSE      : {log_train_rmse:.6f}")
    print(f"Test RMSE       : {log_test_rmse:.6f}")

    train_test_r2_gap = (
        train_metrics["r2"]
        - test_metrics["r2"]
    )

    print()
    print("Overfitting Check")
    print("-" * 60)
    print(
        f"Train-Test R² Gap: "
        f"{train_test_r2_gap:.6f}"
    )

    if train_test_r2_gap > 0.10:
        print(
            "Warning: Some overfitting may be present."
        )
    elif test_metrics["r2"] < 0:
        print(
            "Warning: The model performs worse than "
            "a constant prediction."
        )
    else:
        print(
            "No severe overfitting detected from the R² gap."
        )

    print()
    print("Decision Tree Benchmark")
    print("-" * 60)
    print("Decision Tree Test MAE  : 6.427810")
    print("Decision Tree Test RMSE : 113.187188")
    print("Decision Tree Test R²   : 0.976948")

    print()
    print("Saved files:")
    print(artifact_path)
    print(report_path)
    print(cv_results_path)


if __name__ == "__main__":
    main()