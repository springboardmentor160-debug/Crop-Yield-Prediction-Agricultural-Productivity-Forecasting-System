from __future__ import annotations

import json
from pathlib import Path
from time import perf_counter

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    HistGradientBoostingRegressor,
    RandomForestRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    OrdinalEncoder,
    StandardScaler,
)
from sklearn.tree import DecisionTreeRegressor


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
YEAR_COLUMN = "Crop_Year"

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

TRAIN_END_YEAR = 2016
VALIDATION_START_YEAR = 2017
VALIDATION_END_YEAR = 2018
TEST_START_YEAR = 2019
TEST_END_YEAR = 2020

RANDOM_STATE = 42


def build_one_hot_preprocessor(
    scale_numeric: bool,
) -> ColumnTransformer:
    numeric_steps = [
        (
            "imputer",
            SimpleImputer(strategy="median"),
        ),
    ]

    if scale_numeric:
        numeric_steps.append(
            (
                "scaler",
                StandardScaler(),
            )
        )

    numeric_pipeline = Pipeline(
        steps=numeric_steps
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(
                    strategy="most_frequent"
                ),
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


def build_ordinal_preprocessor() -> ColumnTransformer:
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
                SimpleImputer(
                    strategy="most_frequent"
                ),
            ),
            (
                "encoder",
                OrdinalEncoder(
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
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
        ],
        verbose_feature_names_out=False,
    )


def build_models() -> dict[str, Pipeline]:
    return {
        "Linear Regression": Pipeline(
            steps=[
                (
                    "preprocessor",
                    build_one_hot_preprocessor(
                        scale_numeric=True
                    ),
                ),
                (
                    "model",
                    LinearRegression(),
                ),
            ]
        ),

        "Decision Tree": Pipeline(
            steps=[
                (
                    "preprocessor",
                    build_one_hot_preprocessor(
                        scale_numeric=False
                    ),
                ),
                (
                    "model",
                    DecisionTreeRegressor(
                        max_depth=None,
                        min_samples_leaf=1,
                        min_samples_split=10,
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),

        "Random Forest": Pipeline(
            steps=[
                (
                    "preprocessor",
                    build_one_hot_preprocessor(
                        scale_numeric=False
                    ),
                ),
                (
                    "model",
                    RandomForestRegressor(
                        n_estimators=500,
                        max_depth=None,
                        min_samples_split=2,
                        min_samples_leaf=1,
                        max_features=0.5,
                        bootstrap=True,
                        random_state=RANDOM_STATE,
                        n_jobs=-1,
                    ),
                ),
            ]
        ),

        "Gradient Boosting": Pipeline(
            steps=[
                (
                    "preprocessor",
                    build_ordinal_preprocessor(),
                ),
                (
                    "model",
                    HistGradientBoostingRegressor(
                        min_samples_leaf=10,
                        max_leaf_nodes=63,
                        max_iter=250,
                        max_depth=12,
                        learning_rate=0.08,
                        l2_regularization=1.0,
                        random_state=RANDOM_STATE,
                        early_stopping=True,
                        validation_fraction=0.10,
                    ),
                ),
            ]
        ),
    }


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
    actual_original: pd.Series,
    predicted_original: np.ndarray,
    actual_log: pd.Series,
    predicted_log: np.ndarray,
) -> dict[str, float]:
    return {
        "mae": float(
            mean_absolute_error(
                actual_original,
                predicted_original,
            )
        ),
        "rmse": float(
            mean_squared_error(
                actual_original,
                predicted_original,
            )
            ** 0.5
        ),
        "r2": float(
            r2_score(
                actual_original,
                predicted_original,
            )
        ),
        "log_mae": float(
            mean_absolute_error(
                actual_log,
                predicted_log,
            )
        ),
        "log_rmse": float(
            mean_squared_error(
                actual_log,
                predicted_log,
            )
            ** 0.5
        ),
    }


def evaluate_split(
    pipeline: Pipeline,
    X: pd.DataFrame,
    y_original: pd.Series,
    y_log: pd.Series,
) -> tuple[dict[str, float], np.ndarray]:
    log_predictions = pipeline.predict(X)

    original_predictions = to_original_scale(
        log_predictions
    )

    metrics = calculate_metrics(
        actual_original=y_original,
        predicted_original=original_predictions,
        actual_log=y_log,
        predicted_log=log_predictions,
    )

    return metrics, original_predictions


def main() -> None:
    print("=" * 70)
    print("YieldSense AI - Time-Based Model Validation")
    print("=" * 70)

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

    if (dataframe[TARGET_COLUMN] < 0).any():
        raise ValueError(
            "Yield contains negative values."
        )

    train_df = dataframe[
        dataframe[YEAR_COLUMN] <= TRAIN_END_YEAR
    ].copy()

    validation_df = dataframe[
        dataframe[YEAR_COLUMN].between(
            VALIDATION_START_YEAR,
            VALIDATION_END_YEAR,
        )
    ].copy()

    test_df = dataframe[
        dataframe[YEAR_COLUMN].between(
            TEST_START_YEAR,
            TEST_END_YEAR,
        )
    ].copy()

    if train_df.empty:
        raise ValueError(
            "The training period contains no rows."
        )

    if validation_df.empty:
        raise ValueError(
            "The validation period contains no rows."
        )

    if test_df.empty:
        raise ValueError(
            "The test period contains no rows."
        )

    X_train = train_df[ALL_FEATURES].copy()
    X_validation = validation_df[ALL_FEATURES].copy()
    X_test = test_df[ALL_FEATURES].copy()

    y_train_original = (
        train_df[TARGET_COLUMN].astype(float)
    )

    y_validation_original = (
        validation_df[TARGET_COLUMN].astype(float)
    )

    y_test_original = (
        test_df[TARGET_COLUMN].astype(float)
    )

    y_train_log = np.log1p(y_train_original)
    y_validation_log = np.log1p(
        y_validation_original
    )
    y_test_log = np.log1p(y_test_original)

    print()
    print(
        f"Training Period   : "
        f"{train_df[YEAR_COLUMN].min()}–"
        f"{train_df[YEAR_COLUMN].max()}"
    )
    print(
        f"Validation Period : "
        f"{validation_df[YEAR_COLUMN].min()}–"
        f"{validation_df[YEAR_COLUMN].max()}"
    )
    print(
        f"Testing Period    : "
        f"{test_df[YEAR_COLUMN].min()}–"
        f"{test_df[YEAR_COLUMN].max()}"
    )

    print()
    print(f"Training Rows     : {len(train_df)}")
    print(
        f"Validation Rows   : {len(validation_df)}"
    )
    print(f"Testing Rows      : {len(test_df)}")

    print()
    print(
        "Important: no 2017–2020 rows are used "
        "for model fitting."
    )

    models = build_models()

    results: list[dict] = []
    all_test_predictions: list[pd.DataFrame] = []

    for model_name, pipeline in models.items():
        print()
        print("=" * 70)
        print(f"Training {model_name}")
        print("=" * 70)

        started_at = perf_counter()

        pipeline.fit(
            X_train,
            y_train_log,
        )

        training_seconds = (
            perf_counter() - started_at
        )

        train_metrics, _ = evaluate_split(
            pipeline=pipeline,
            X=X_train,
            y_original=y_train_original,
            y_log=y_train_log,
        )

        validation_metrics, _ = evaluate_split(
            pipeline=pipeline,
            X=X_validation,
            y_original=y_validation_original,
            y_log=y_validation_log,
        )

        test_metrics, test_predictions = evaluate_split(
            pipeline=pipeline,
            X=X_test,
            y_original=y_test_original,
            y_log=y_test_log,
        )

        result = {
            "model": model_name,
            "training_seconds": round(
                training_seconds,
                4,
            ),
            "train_mae": round(
                train_metrics["mae"],
                6,
            ),
            "train_rmse": round(
                train_metrics["rmse"],
                6,
            ),
            "train_r2": round(
                train_metrics["r2"],
                6,
            ),
            "validation_mae": round(
                validation_metrics["mae"],
                6,
            ),
            "validation_rmse": round(
                validation_metrics["rmse"],
                6,
            ),
            "validation_r2": round(
                validation_metrics["r2"],
                6,
            ),
            "validation_log_mae": round(
                validation_metrics["log_mae"],
                6,
            ),
            "test_mae": round(
                test_metrics["mae"],
                6,
            ),
            "test_rmse": round(
                test_metrics["rmse"],
                6,
            ),
            "test_r2": round(
                test_metrics["r2"],
                6,
            ),
            "test_log_mae": round(
                test_metrics["log_mae"],
                6,
            ),
            "test_log_rmse": round(
                test_metrics["log_rmse"],
                6,
            ),
            "train_test_r2_gap": round(
                train_metrics["r2"]
                - test_metrics["r2"],
                6,
            ),
        }

        results.append(result)

        print()
        print(
            f"Training Time : "
            f"{training_seconds:.4f} seconds"
        )

        print()
        print("Validation Period: 2017–2018")
        print("-" * 70)
        print(
            f"MAE            : "
            f"{validation_metrics['mae']:.6f}"
        )
        print(
            f"RMSE           : "
            f"{validation_metrics['rmse']:.6f}"
        )
        print(
            f"R²             : "
            f"{validation_metrics['r2']:.6f}"
        )
        print(
            f"Log MAE        : "
            f"{validation_metrics['log_mae']:.6f}"
        )

        print()
        print("Future Test Period: 2019–2020")
        print("-" * 70)
        print(
            f"MAE            : "
            f"{test_metrics['mae']:.6f}"
        )
        print(
            f"RMSE           : "
            f"{test_metrics['rmse']:.6f}"
        )
        print(
            f"R²             : "
            f"{test_metrics['r2']:.6f}"
        )
        print(
            f"Log MAE        : "
            f"{test_metrics['log_mae']:.6f}"
        )
        print(
            f"Log RMSE       : "
            f"{test_metrics['log_rmse']:.6f}"
        )

        artifact_name = (
            model_name.lower()
            .replace(" ", "_")
        )

        time_model_path = (
            ARTIFACTS_DIR
            / f"{artifact_name}_time_pipeline.joblib"
        )

        joblib.dump(
            pipeline,
            time_model_path,
        )

        prediction_report = X_test[
            [
                "Crop",
                "Crop_Year",
                "Season",
                "State",
            ]
        ].copy()

        prediction_report["model"] = model_name

        prediction_report["actual_yield"] = (
            y_test_original.to_numpy()
        )

        prediction_report["predicted_yield"] = (
            test_predictions
        )

        prediction_report["absolute_error"] = (
            np.abs(
                prediction_report["actual_yield"]
                - prediction_report[
                    "predicted_yield"
                ]
            )
        )

        all_test_predictions.append(
            prediction_report
        )

    results_df = pd.DataFrame(results).sort_values(
        by=[
            "test_mae",
            "test_rmse",
        ]
    )

    comparison_csv_path = (
        REPORTS_DIR
        / "time_based_model_comparison.csv"
    )

    comparison_json_path = (
        REPORTS_DIR
        / "time_based_model_comparison.json"
    )

    predictions_path = (
        REPORTS_DIR
        / "time_based_test_predictions.csv"
    )

    results_df.to_csv(
        comparison_csv_path,
        index=False,
    )

    comparison_json_path.write_text(
        json.dumps(
            results,
            indent=2,
        ),
        encoding="utf-8",
    )

    pd.concat(
        all_test_predictions,
        ignore_index=True,
    ).to_csv(
        predictions_path,
        index=False,
    )

    print()
    print("=" * 70)
    print("Time-Based Validation Comparison")
    print("=" * 70)

    print(
        results_df[
            [
                "model",
                "validation_mae",
                "validation_r2",
                "test_mae",
                "test_rmse",
                "test_r2",
                "test_log_mae",
            ]
        ].to_string(index=False)
    )

    best_model = results_df.iloc[0]

    print()
    print("=" * 70)
    print("Current Time-Based Leader")
    print("=" * 70)

    print(f"Model     : {best_model['model']}")
    print(
        f"Test MAE  : "
        f"{best_model['test_mae']:.6f}"
    )
    print(
        f"Test RMSE : "
        f"{best_model['test_rmse']:.6f}"
    )
    print(
        f"Test R²   : "
        f"{best_model['test_r2']:.6f}"
    )

    print()
    print("Saved reports:")
    print(comparison_csv_path)
    print(comparison_json_path)
    print(predictions_path)

    print()
    print(
        "Time-trained model pipelines were saved "
        "inside ml/artifacts."
    )


if __name__ == "__main__":
    main()