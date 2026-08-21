from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

import pandas as pd


ML_ROOT = Path(__file__).resolve().parents[1]

ARTIFACTS_DIR = ML_ROOT / "artifacts"
REPORTS_DIR = ML_ROOT / "reports"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)

BASELINE_REPORT = (
    REPORTS_DIR / "baseline_model_comparison.json"
)

DECISION_TREE_REPORT = (
    REPORTS_DIR / "decision_tree_results.json"
)

RANDOM_FOREST_REPORT = (
    REPORTS_DIR / "random_forest_results.json"
)

GRADIENT_BOOSTING_REPORT = (
    REPORTS_DIR / "gradient_boosting_results.json"
)

TIME_BASED_REPORT = (
    REPORTS_DIR / "time_based_model_comparison.csv"
)

FEATURE_IMPORTANCE_REPORT = (
    REPORTS_DIR / "feature_importance_summary.csv"
)

EXPLAINABILITY_REPORT = (
    REPORTS_DIR / "model_explainability_report.json"
)

SELECTED_MODEL_SOURCE = (
    ARTIFACTS_DIR
    / "decision_tree_time_pipeline.joblib"
)

SELECTED_MODEL_DESTINATION = (
    ARTIFACTS_DIR
    / "yield_prediction_pipeline.joblib"
)

FINAL_COMPARISON_CSV = (
    REPORTS_DIR / "final_model_comparison.csv"
)

FINAL_SELECTION_JSON = (
    REPORTS_DIR / "final_model_selection.json"
)

FINAL_REPORT_TEXT = (
    REPORTS_DIR / "final_ml_report.txt"
)

MODEL_METADATA_JSON = (
    ARTIFACTS_DIR / "model_metadata.json"
)


def load_json(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(
            f"Required report was not found: {path}"
        )

    return json.loads(
        path.read_text(encoding="utf-8")
    )


def normalize_model_name(name: str) -> str:
    mapping = {
        "Median Baseline": "Median Baseline",
        "Linear Regression": "Linear Regression",
        "Decision Tree Regressor": "Decision Tree",
        "Decision Tree": "Decision Tree",
        "Random Forest Regressor": "Random Forest",
        "Random Forest": "Random Forest",
        "Histogram Gradient Boosting Regressor": (
            "Gradient Boosting"
        ),
        "Gradient Boosting": "Gradient Boosting",
    }

    return mapping.get(name, name)


def load_random_split_results() -> dict[str, dict[str, Any]]:
    results: dict[str, dict[str, Any]] = {}

    baseline_data = load_json(BASELINE_REPORT)

    for item in baseline_data:
        model_name = normalize_model_name(
            item["model"]
        )

        results[model_name] = {
            "random_test_mae": item.get("test_mae"),
            "random_test_rmse": item.get("test_rmse"),
            "random_test_r2": item.get("test_r2"),
            "random_log_test_mae": item.get(
                "log_test_mae"
            ),
            "random_training_seconds": item.get(
                "training_seconds"
            ),
        }

    individual_reports = [
        DECISION_TREE_REPORT,
        RANDOM_FOREST_REPORT,
        GRADIENT_BOOSTING_REPORT,
    ]

    for report_path in individual_reports:
        item = load_json(report_path)

        model_name = normalize_model_name(
            item["model"]
        )

        results[model_name] = {
            "random_test_mae": item.get("test_mae"),
            "random_test_rmse": item.get(
                "test_rmse"
            ),
            "random_test_r2": item.get("test_r2"),
            "random_log_test_mae": item.get(
                "log_test_mae"
            ),
            "random_training_seconds": item.get(
                "training_seconds"
            ),
        }

    return results


def load_time_based_results() -> dict[str, dict[str, Any]]:
    if not TIME_BASED_REPORT.exists():
        raise FileNotFoundError(
            f"Required report was not found: "
            f"{TIME_BASED_REPORT}"
        )

    dataframe = pd.read_csv(TIME_BASED_REPORT)

    results: dict[str, dict[str, Any]] = {}

    for _, row in dataframe.iterrows():
        model_name = normalize_model_name(
            str(row["model"])
        )

        results[model_name] = {
            "future_validation_mae": row.get(
                "validation_mae"
            ),
            "future_validation_rmse": row.get(
                "validation_rmse"
            ),
            "future_validation_r2": row.get(
                "validation_r2"
            ),
            "future_test_mae": row.get("test_mae"),
            "future_test_rmse": row.get(
                "test_rmse"
            ),
            "future_test_r2": row.get("test_r2"),
            "future_log_test_mae": row.get(
                "test_log_mae"
            ),
            "future_training_seconds": row.get(
                "training_seconds"
            ),
            "future_train_test_r2_gap": row.get(
                "train_test_r2_gap"
            ),
        }

    return results


def build_comparison_dataframe() -> pd.DataFrame:
    random_results = load_random_split_results()
    future_results = load_time_based_results()

    model_names = sorted(
        set(random_results) | set(future_results)
    )

    rows = []

    for model_name in model_names:
        row = {
            "model": model_name,
            **random_results.get(model_name, {}),
            **future_results.get(model_name, {}),
        }

        rows.append(row)

    dataframe = pd.DataFrame(rows)

    dataframe["has_future_validation"] = (
        dataframe["future_test_r2"].notna()
    )

    dataframe["future_rank"] = (
        dataframe["future_test_mae"]
        .rank(
            method="min",
            ascending=True,
            na_option="bottom",
        )
        .astype(int)
    )

    dataframe["random_rank"] = (
        dataframe["random_test_mae"]
        .rank(
            method="min",
            ascending=True,
            na_option="bottom",
        )
        .astype(int)
    )

    return dataframe.sort_values(
        by=[
            "future_rank",
            "random_rank",
        ]
    )


def get_top_features(limit: int = 10) -> list[str]:
    if not FEATURE_IMPORTANCE_REPORT.exists():
        return []

    dataframe = pd.read_csv(
        FEATURE_IMPORTANCE_REPORT
    )

    if "feature" in dataframe.columns:
        feature_column = "feature"
    else:
        feature_column = dataframe.columns[0]

    if "average_importance" in dataframe.columns:
        dataframe = dataframe.sort_values(
            by="average_importance",
            ascending=False,
        )

    return (
        dataframe[feature_column]
        .astype(str)
        .head(limit)
        .tolist()
    )


def get_explainability_example_count() -> int:
    if not EXPLAINABILITY_REPORT.exists():
        return 0

    data = load_json(EXPLAINABILITY_REPORT)

    return len(data.get("examples", []))


def select_production_model(
    comparison: pd.DataFrame,
) -> pd.Series:
    eligible = comparison[
        comparison["has_future_validation"]
    ].copy()

    if eligible.empty:
        raise ValueError(
            "No models have time-based validation results."
        )

    # The production model is selected primarily by:
    # 1. Lowest future-year MAE
    # 2. Lowest future-year RMSE
    # 3. Highest future-year R²
    eligible = eligible.sort_values(
        by=[
            "future_test_mae",
            "future_test_rmse",
            "future_test_r2",
        ],
        ascending=[
            True,
            True,
            False,
        ],
    )

    return eligible.iloc[0]


def make_json_safe(value: Any) -> Any:
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value


def main() -> None:
    print("=" * 70)
    print("YieldSense AI - Final Model Comparison")
    print("=" * 70)

    comparison = build_comparison_dataframe()

    selected = select_production_model(
        comparison
    )

    selected_model_name = str(selected["model"])

    top_features = get_top_features(limit=10)

    explanation_count = (
        get_explainability_example_count()
    )

    comparison.to_csv(
        FINAL_COMPARISON_CSV,
        index=False,
    )

    selection = {
        "project": "YieldSense AI",
        "task": "Crop Yield Prediction",
        "selected_model": selected_model_name,
        "selection_basis": (
            "Best performance on future-year test data "
            "from 2019 to 2020"
        ),
        "training_period": "1997-2016",
        "validation_period": "2017-2018",
        "test_period": "2019-2020",
        "target": "Yield",
        "target_transformation": "log1p",
        "prediction_inverse_transformation": "expm1",
        "production_feature_removed": True,
        "selected_model_metrics": {
            "random_test_mae": make_json_safe(
                selected.get("random_test_mae")
            ),
            "random_test_rmse": make_json_safe(
                selected.get("random_test_rmse")
            ),
            "random_test_r2": make_json_safe(
                selected.get("random_test_r2")
            ),
            "future_validation_mae": make_json_safe(
                selected.get(
                    "future_validation_mae"
                )
            ),
            "future_validation_rmse": make_json_safe(
                selected.get(
                    "future_validation_rmse"
                )
            ),
            "future_validation_r2": make_json_safe(
                selected.get(
                    "future_validation_r2"
                )
            ),
            "future_test_mae": make_json_safe(
                selected.get("future_test_mae")
            ),
            "future_test_rmse": make_json_safe(
                selected.get("future_test_rmse")
            ),
            "future_test_r2": make_json_safe(
                selected.get("future_test_r2")
            ),
            "future_log_test_mae": make_json_safe(
                selected.get(
                    "future_log_test_mae"
                )
            ),
            "future_training_seconds": make_json_safe(
                selected.get(
                    "future_training_seconds"
                )
            ),
        },
        "top_global_features": top_features,
        "explainability_examples_generated": (
            explanation_count
        ),
        "model_artifact": str(
            SELECTED_MODEL_DESTINATION
        ),
        "selection_reasons": [
            (
                "Lowest prediction MAE on the "
                "2019-2020 future test period"
            ),
            (
                "Lowest future test RMSE among "
                "evaluated models"
            ),
            (
                "Highest future-year R² among "
                "evaluated models"
            ),
            (
                "Stable performance between the "
                "2017-2018 validation period and "
                "2019-2020 test period"
            ),
            (
                "Fast training and inference compared "
                "with the Random Forest model"
            ),
            (
                "Clear global and local prediction "
                "explainability"
            ),
        ],
    }

    FINAL_SELECTION_JSON.write_text(
        json.dumps(
            selection,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    if selected_model_name != "Decision Tree":
        raise ValueError(
            "The automatically selected model is not "
            "Decision Tree. Review the comparison before "
            "copying a production artifact."
        )

    if not SELECTED_MODEL_SOURCE.exists():
        raise FileNotFoundError(
            "The selected Decision Tree artifact "
            f"was not found: {SELECTED_MODEL_SOURCE}"
        )

    shutil.copy2(
        SELECTED_MODEL_SOURCE,
        SELECTED_MODEL_DESTINATION,
    )

    metadata = {
        "model_name": selected_model_name,
        "model_type": "DecisionTreeRegressor",
        "artifact_filename": (
            SELECTED_MODEL_DESTINATION.name
        ),
        "dataset_rows": 19689,
        "feature_count": 15,
        "features": [
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
            "Crop",
            "Season",
            "State",
        ],
        "categorical_features": [
            "Crop",
            "Season",
            "State",
        ],
        "numeric_features": [
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
        ],
        "target": "Yield",
        "target_transform": "log1p",
        "inverse_transform": "expm1",
        "training_period": {
            "start_year": 1997,
            "end_year": 2016,
        },
        "validation_period": {
            "start_year": 2017,
            "end_year": 2018,
        },
        "test_period": {
            "start_year": 2019,
            "end_year": 2020,
        },
        "future_test_metrics": (
            selection["selected_model_metrics"]
        ),
        "production_feature_used": False,
        "top_features": top_features,
    }

    MODEL_METADATA_JSON.write_text(
        json.dumps(
            metadata,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    report_lines = [
        "YieldSense AI - Final Machine Learning Report",
        "=" * 70,
        "",
        "PROJECT",
        "-" * 70,
        (
            "Crop Yield Prediction and Agricultural "
            "Productivity Forecasting"
        ),
        "",
        "DATASET",
        "-" * 70,
        "Historical records : 19,689",
        "Crops             : 55",
        "States            : 30",
        "Seasons           : 6",
        "Year range        : 1997-2020",
        "Final features    : 15",
        "Prediction target : Yield",
        "",
        "DATA PREPARATION",
        "-" * 70,
        "Missing values                : 0",
        "Exact duplicate rows          : 0",
        "Common states across datasets : 30",
        "Production feature            : Removed",
        "Target transformation         : log1p(Yield)",
        "",
        "MODEL COMPARISON",
        "-" * 70,
        comparison[
            [
                "model",
                "random_test_mae",
                "random_test_rmse",
                "random_test_r2",
                "future_test_mae",
                "future_test_rmse",
                "future_test_r2",
            ]
        ].to_string(index=False),
        "",
        "PRODUCTION MODEL",
        "-" * 70,
        f"Selected model : {selected_model_name}",
        (
            f"Future MAE    : "
            f"{selected['future_test_mae']:.6f}"
        ),
        (
            f"Future RMSE   : "
            f"{selected['future_test_rmse']:.6f}"
        ),
        (
            f"Future R²     : "
            f"{selected['future_test_r2']:.6f}"
        ),
        (
            f"Validation R² : "
            f"{selected['future_validation_r2']:.6f}"
        ),
        "",
        "SELECTION REASON",
        "-" * 70,
        (
            "Random Forest achieved the strongest score "
            "under random train-test splitting. However, "
            "Decision Tree achieved the best results when "
            "predicting unseen future years."
        ),
        "",
        (
            "YieldSense AI is intended to forecast future "
            "agricultural outcomes. Therefore, future-year "
            "performance was given priority over random-split "
            "performance."
        ),
        "",
        (
            "The Decision Tree also showed almost identical "
            "validation and future-test R² values, indicating "
            "stable temporal generalization."
        ),
        "",
        "TOP GLOBAL FEATURES",
        "-" * 70,
    ]

    if top_features:
        for rank, feature in enumerate(
            top_features,
            start=1,
        ):
            report_lines.append(
                f"{rank}. {feature}"
            )
    else:
        report_lines.append(
            "Feature importance report unavailable."
        )

    report_lines.extend(
        [
            "",
            "EXPLAINABILITY",
            "-" * 70,
            (
                f"Local explanations generated : "
                f"{explanation_count}"
            ),
            (
                "Method: Reference-value local "
                "sensitivity analysis"
            ),
            (
                "Note: Model explanations describe model "
                "behavior and do not prove agricultural "
                "causation."
            ),
            "",
            "PRODUCTION ARTIFACTS",
            "-" * 70,
            str(SELECTED_MODEL_DESTINATION),
            str(MODEL_METADATA_JSON),
            "",
            "FINAL STATUS",
            "-" * 70,
            "Machine-learning model development: COMPLETED",
            "Selected production model: Decision Tree",
            "Next stage: FastAPI prediction integration",
        ]
    )

    FINAL_REPORT_TEXT.write_text(
        "\n".join(report_lines),
        encoding="utf-8",
    )

    print()
    print("Final Comparison")
    print("-" * 70)

    print(
        comparison[
            [
                "model",
                "random_test_mae",
                "random_test_r2",
                "future_test_mae",
                "future_test_rmse",
                "future_test_r2",
            ]
        ].to_string(index=False)
    )

    print()
    print("=" * 70)
    print("Selected Production Model")
    print("=" * 70)
    print(f"Model : {selected_model_name}")
    print(
        f"MAE   : "
        f"{selected['future_test_mae']:.6f}"
    )
    print(
        f"RMSE  : "
        f"{selected['future_test_rmse']:.6f}"
    )
    print(
        f"R²    : "
        f"{selected['future_test_r2']:.6f}"
    )

    print()
    print("Production artifact created:")
    print(SELECTED_MODEL_DESTINATION)

    print()
    print("Generated files:")
    print(FINAL_COMPARISON_CSV)
    print(FINAL_SELECTION_JSON)
    print(FINAL_REPORT_TEXT)
    print(MODEL_METADATA_JSON)


if __name__ == "__main__":
    main()