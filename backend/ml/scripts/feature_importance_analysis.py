from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error


ML_ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "yieldsense_ml_dataset.csv"
)

ARTIFACTS_DIR = ML_ROOT / "artifacts"
REPORTS_DIR = ML_ROOT / "reports"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)

TARGET_COLUMN = "Yield"
YEAR_COLUMN = "Crop_Year"

FEATURES = [
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
]

MODEL_FILES = {
    "Decision Tree": (
        ARTIFACTS_DIR
        / "decision_tree_time_pipeline.joblib"
    ),
    "Random Forest": (
        ARTIFACTS_DIR
        / "random_forest_time_pipeline.joblib"
    ),
}

TEST_START_YEAR = 2019
TEST_END_YEAR = 2020
RANDOM_STATE = 42


def original_scale_mae_scorer(
    estimator,
    X,
    y_log,
) -> float:
    predicted_log = estimator.predict(X)

    predicted_original = np.clip(
        np.expm1(predicted_log),
        a_min=0,
        a_max=None,
    )

    actual_original = np.expm1(y_log)

    # Scikit-learn expects larger scores to be better.
    return -mean_absolute_error(
        actual_original,
        predicted_original,
    )


def main() -> None:
    print("=" * 70)
    print("YieldSense AI - Feature Importance Analysis")
    print("=" * 70)

    dataframe = pd.read_csv(DATASET_PATH)

    test_df = dataframe[
        dataframe[YEAR_COLUMN].between(
            TEST_START_YEAR,
            TEST_END_YEAR,
        )
    ].copy()

    if test_df.empty:
        raise ValueError(
            "No rows were found for 2019–2020."
        )

    X_test = test_df[FEATURES].copy()
    y_test_log = np.log1p(
        test_df[TARGET_COLUMN].astype(float)
    )

    print()
    print(f"Test Period : {TEST_START_YEAR}–{TEST_END_YEAR}")
    print(f"Test Rows   : {len(test_df)}")
    print(
        "Metric      : Increase in original-scale MAE "
        "after feature shuffling"
    )

    combined_results = []

    for model_name, model_path in MODEL_FILES.items():
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found: {model_path}"
            )

        print()
        print("=" * 70)
        print(model_name)
        print("=" * 70)

        pipeline = joblib.load(model_path)

        result = permutation_importance(
            estimator=pipeline,
            X=X_test,
            y=y_test_log,
            scoring=original_scale_mae_scorer,
            n_repeats=10,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        )

        importance_df = pd.DataFrame(
            {
                "model": model_name,
                "feature": FEATURES,
                "importance_mean": result.importances_mean,
                "importance_std": result.importances_std,
            }
        ).sort_values(
            by="importance_mean",
            ascending=False,
        )

        importance_df["rank"] = (
            importance_df["importance_mean"]
            .rank(
                method="dense",
                ascending=False,
            )
            .astype(int)
        )

        output_name = (
            model_name.lower()
            .replace(" ", "_")
        )

        output_path = (
            REPORTS_DIR
            / f"{output_name}_feature_importance.csv"
        )

        importance_df.to_csv(
            output_path,
            index=False,
        )

        combined_results.append(importance_df)

        print()
        print(
            importance_df[
                [
                    "rank",
                    "feature",
                    "importance_mean",
                    "importance_std",
                ]
            ]
            .head(15)
            .to_string(index=False)
        )

        print()
        print(f"Saved: {output_path}")

    combined_df = pd.concat(
        combined_results,
        ignore_index=True,
    )

    combined_path = (
        REPORTS_DIR
        / "feature_importance_comparison.csv"
    )

    combined_df.to_csv(
        combined_path,
        index=False,
    )

    pivot = combined_df.pivot(
        index="feature",
        columns="model",
        values="importance_mean",
    ).fillna(0)

    pivot["average_importance"] = pivot.mean(axis=1)

    pivot = pivot.sort_values(
        by="average_importance",
        ascending=False,
    )

    summary_path = (
        REPORTS_DIR
        / "feature_importance_summary.csv"
    )

    pivot.to_csv(summary_path)

    print()
    print("=" * 70)
    print("Combined Feature Importance")
    print("=" * 70)

    print(pivot.head(15).to_string())

    print()
    print("Saved combined reports:")
    print(combined_path)
    print(summary_path)


if __name__ == "__main__":
    main()