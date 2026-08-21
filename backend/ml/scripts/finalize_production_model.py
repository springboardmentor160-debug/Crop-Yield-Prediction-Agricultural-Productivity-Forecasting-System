from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
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

PRODUCTION_MODEL_PATH = (
    ARTIFACTS_DIR
    / "yield_prediction_pipeline.joblib"
)

MODEL_METADATA_PATH = (
    ARTIFACTS_DIR
    / "model_metadata.json"
)

FINAL_SELECTION_PATH = (
    REPORTS_DIR
    / "final_model_selection.json"
)

FINAL_REPORT_PATH = (
    REPORTS_DIR
    / "final_ml_report.txt"
)

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

ALL_FEATURES = (
    NUMERIC_FEATURES
    + CATEGORICAL_FEATURES
)

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


def main() -> None:
    print("=" * 70)
    print("YieldSense AI - Finalize Production Model")
    print("=" * 70)

    dataframe = pd.read_csv(DATASET_PATH)

    required_columns = (
        ALL_FEATURES + [TARGET_COLUMN]
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing dataset columns: {missing_columns}"
        )

    y_original = (
        dataframe[TARGET_COLUMN]
        .astype(float)
    )

    if (y_original < 0).any():
        raise ValueError(
            "Yield contains negative values."
        )

    X = dataframe[ALL_FEATURES].copy()
    y_log = np.log1p(y_original)

    production_pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(),
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
    )

    print()
    print("Selected Model : Random Forest Regressor")
    print(f"Training Rows  : {len(X)}")
    print("Target         : log1p(Yield)")
    print()
    print(
        "Training final model on all available "
        "historical records..."
    )

    started_at = perf_counter()

    production_pipeline.fit(
        X,
        y_log,
    )

    training_seconds = (
        perf_counter() - started_at
    )

    joblib.dump(
        production_pipeline,
        PRODUCTION_MODEL_PATH,
    )

    trained_at = datetime.now(
        timezone.utc
    ).isoformat()

    metadata = {
        "project": "YieldSense AI",
        "task": "Crop Yield Prediction",
        "model_name": "Random Forest Regressor",
        "model_type": "RandomForestRegressor",
        "model_version": "1.0.0",
        "artifact_filename": (
            PRODUCTION_MODEL_PATH.name
        ),
        "trained_at_utc": trained_at,
        "training_rows": int(len(dataframe)),
        "training_year_start": int(
            dataframe["Crop_Year"].min()
        ),
        "training_year_end": int(
            dataframe["Crop_Year"].max()
        ),
        "feature_count": len(ALL_FEATURES),
        "features": ALL_FEATURES,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": (
            CATEGORICAL_FEATURES
        ),
        "target": TARGET_COLUMN,
        "target_transformation": "log1p",
        "prediction_inverse_transformation": (
            "expm1"
        ),
        "negative_predictions_clipped_to_zero": (
            True
        ),
        "production_feature_used": False,
        "hyperparameters": {
            "n_estimators": 500,
            "max_depth": None,
            "min_samples_split": 2,
            "min_samples_leaf": 1,
            "max_features": 0.5,
            "bootstrap": True,
            "random_state": RANDOM_STATE,
        },
        "random_split_metrics": {
            "mae": 4.392195,
            "rmse": 71.731423,
            "r2": 0.990742,
            "log_mae": 0.099604,
        },
        "time_based_metrics": {
            "validation_period": "2017-2018",
            "test_period": "2019-2020",
            "future_test_mae": 11.606862,
            "future_test_rmse": 184.271538,
            "future_test_r2": 0.952185,
            "future_log_test_mae": 0.151001,
        },
        "selection_basis": [
            (
                "Highest random-split prediction "
                "accuracy"
            ),
            (
                "Lowest random-split MAE and RMSE"
            ),
            (
                "Strong cross-validation performance"
            ),
            (
                "Ensemble stability across multiple "
                "decision trees"
            ),
            (
                "Suitable for nonlinear tabular "
                "agricultural data"
            ),
        ],
        "temporal_validation_note": (
            "Decision Tree performed better on the "
            "specific 2019-2020 chronological test. "
            "Random Forest was selected for production "
            "based on stronger overall random-split, "
            "cross-validation, and ensemble robustness. "
            "The temporal result remains documented."
        ),
        "final_training_seconds": round(
            training_seconds,
            4,
        ),
    }

    MODEL_METADATA_PATH.write_text(
        json.dumps(
            metadata,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    selection_report = {
        "selected_model": (
            "Random Forest Regressor"
        ),
        "production_artifact": str(
            PRODUCTION_MODEL_PATH
        ),
        "model_metadata": str(
            MODEL_METADATA_PATH
        ),
        "selection_status": "approved",
        "selection_basis": (
            metadata["selection_basis"]
        ),
        "random_split_metrics": (
            metadata["random_split_metrics"]
        ),
        "time_based_metrics": (
            metadata["time_based_metrics"]
        ),
        "temporal_validation_note": (
            metadata["temporal_validation_note"]
        ),
    }

    FINAL_SELECTION_PATH.write_text(
        json.dumps(
            selection_report,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    report_lines = [
        "YieldSense AI - Final ML Model Selection",
        "=" * 70,
        "",
        "SELECTED PRODUCTION MODEL",
        "-" * 70,
        "Random Forest Regressor",
        "",
        "RANDOM-SPLIT PERFORMANCE",
        "-" * 70,
        "MAE  : 4.392195",
        "RMSE : 71.731423",
        "R²   : 0.990742",
        "",
        "TIME-BASED PERFORMANCE",
        "-" * 70,
        "Future MAE  : 11.606862",
        "Future RMSE : 184.271538",
        "Future R²   : 0.952185",
        "",
        "MODEL-SELECTION REASON",
        "-" * 70,
        (
            "Random Forest achieved the highest "
            "overall random-split accuracy, lowest "
            "random-split error, strong cross-validation "
            "performance, and ensemble stability."
        ),
        "",
        (
            "Decision Tree performed better on the "
            "specific 2019-2020 chronological test. "
            "This temporal result is retained as an "
            "important model limitation and monitoring "
            "consideration."
        ),
        "",
        "FINAL TRAINING",
        "-" * 70,
        (
            f"Rows used: {len(dataframe)}"
        ),
        (
            f"Year range: "
            f"{dataframe['Crop_Year'].min()}-"
            f"{dataframe['Crop_Year'].max()}"
        ),
        (
            f"Training time: "
            f"{training_seconds:.4f} seconds"
        ),
        "",
        "PRODUCTION FILES",
        "-" * 70,
        str(PRODUCTION_MODEL_PATH),
        str(MODEL_METADATA_PATH),
        "",
        "STATUS",
        "-" * 70,
        "ML model development: COMPLETED",
        "Production model: Random Forest Regressor",
        "Next stage: FastAPI prediction integration",
    ]

    FINAL_REPORT_PATH.write_text(
        "\n".join(report_lines),
        encoding="utf-8",
    )

    print()
    print("=" * 70)
    print("Production Model Finalized")
    print("=" * 70)
    print()
    print("Model         : Random Forest Regressor")
    print(f"Training Rows : {len(dataframe)}")
    print(
        f"Training Time : "
        f"{training_seconds:.4f} seconds"
    )

    print()
    print("Production artifact:")
    print(PRODUCTION_MODEL_PATH)

    print()
    print("Metadata:")
    print(MODEL_METADATA_PATH)

    print()
    print("Updated reports:")
    print(FINAL_SELECTION_PATH)
    print(FINAL_REPORT_PATH)


if __name__ == "__main__":
    main()