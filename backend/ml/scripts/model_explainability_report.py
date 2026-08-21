from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


ML_ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = (
    ML_ROOT
    / "data"
    / "processed"
    / "yieldsense_ml_dataset.csv"
)

MODEL_PATH = (
    ML_ROOT
    / "artifacts"
    / "decision_tree_time_pipeline.joblib"
)

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

CATEGORICAL_FEATURES = [
    "Crop",
    "Season",
    "State",
]

NUMERIC_FEATURES = [
    feature
    for feature in FEATURES
    if feature not in CATEGORICAL_FEATURES
]

TRAIN_END_YEAR = 2016
TEST_START_YEAR = 2019
TEST_END_YEAR = 2020

NUMBER_OF_EXAMPLES = 20


def to_original_scale(log_prediction: float) -> float:
    return float(
        np.clip(
            np.expm1(log_prediction),
            a_min=0,
            a_max=None,
        )
    )


def build_reference_values(
    training_data: pd.DataFrame,
) -> dict[str, object]:
    references: dict[str, object] = {}

    for feature in NUMERIC_FEATURES:
        references[feature] = float(
            training_data[feature].median()
        )

    for feature in CATEGORICAL_FEATURES:
        mode = training_data[feature].mode()

        references[feature] = (
            mode.iloc[0]
            if not mode.empty
            else training_data[feature].iloc[0]
        )

    return references


def explain_prediction(
    model,
    row: pd.DataFrame,
    reference_values: dict[str, object],
) -> tuple[float, pd.DataFrame]:
    base_log_prediction = model.predict(row)[0]
    base_prediction = to_original_scale(
        base_log_prediction
    )

    contributions = []

    for feature in FEATURES:
        modified_row = row.copy()

        original_value = modified_row.iloc[0][feature]
        reference_value = reference_values[feature]

        modified_row.loc[
            modified_row.index[0],
            feature,
        ] = reference_value

        modified_log_prediction = model.predict(
            modified_row
        )[0]

        modified_prediction = to_original_scale(
            modified_log_prediction
        )

        contribution = (
            base_prediction - modified_prediction
        )

        contributions.append(
            {
                "feature": feature,
                "actual_input_value": (
                    original_value.item()
                    if hasattr(original_value, "item")
                    else original_value
                ),
                "reference_value": (
                    reference_value.item()
                    if hasattr(reference_value, "item")
                    else reference_value
                ),
                "prediction_change": float(
                    contribution
                ),
                "absolute_impact": float(
                    abs(contribution)
                ),
                "direction": (
                    "increased prediction"
                    if contribution > 0
                    else (
                        "decreased prediction"
                        if contribution < 0
                        else "no measurable change"
                    )
                ),
            }
        )

    contribution_df = pd.DataFrame(
        contributions
    ).sort_values(
        by="absolute_impact",
        ascending=False,
    )

    return base_prediction, contribution_df


def main() -> None:
    print("=" * 70)
    print("YieldSense AI - Model Explainability Report")
    print("=" * 70)

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Decision Tree artifact not found: {MODEL_PATH}"
        )

    dataframe = pd.read_csv(DATASET_PATH)

    training_data = dataframe[
        dataframe[YEAR_COLUMN] <= TRAIN_END_YEAR
    ].copy()

    test_data = dataframe[
        dataframe[YEAR_COLUMN].between(
            TEST_START_YEAR,
            TEST_END_YEAR,
        )
    ].copy()

    if training_data.empty or test_data.empty:
        raise ValueError(
            "Training or future test data is empty."
        )

    model = joblib.load(MODEL_PATH)

    reference_values = build_reference_values(
        training_data
    )

    test_features = test_data[FEATURES].copy()

    predicted_log = model.predict(test_features)

    predicted_yield = np.clip(
        np.expm1(predicted_log),
        a_min=0,
        a_max=None,
    )

    test_data = test_data.copy()

    test_data["predicted_yield"] = predicted_yield

    test_data["absolute_error"] = np.abs(
        test_data[TARGET_COLUMN]
        - test_data["predicted_yield"]
    )

    # Choose a balanced sample:
    # low-error, typical-error and high-error examples.
    sorted_test = test_data.sort_values(
        by="absolute_error"
    )

    sample_positions = np.linspace(
        0,
        len(sorted_test) - 1,
        NUMBER_OF_EXAMPLES,
        dtype=int,
    )

    selected_examples = sorted_test.iloc[
        sample_positions
    ].copy()

    complete_explanations = []
    summary_rows = []

    for example_number, (
        index,
        example,
    ) in enumerate(
        selected_examples.iterrows(),
        start=1,
    ):
        input_row = pd.DataFrame(
            [example[FEATURES].to_dict()]
        )

        prediction, contribution_df = (
            explain_prediction(
                model=model,
                row=input_row,
                reference_values=reference_values,
            )
        )

        top_factors = contribution_df.head(5)

        explanation = {
            "example_number": example_number,
            "dataset_index": int(index),
            "crop": example["Crop"],
            "state": example["State"],
            "season": example["Season"],
            "crop_year": int(example["Crop_Year"]),
            "actual_yield": float(
                example[TARGET_COLUMN]
            ),
            "predicted_yield": float(prediction),
            "absolute_error": float(
                abs(
                    example[TARGET_COLUMN]
                    - prediction
                )
            ),
            "top_factors": (
                top_factors.to_dict(
                    orient="records"
                )
            ),
        }

        complete_explanations.append(explanation)

        summary_rows.append(
            {
                "example_number": example_number,
                "crop": example["Crop"],
                "state": example["State"],
                "season": example["Season"],
                "year": int(example["Crop_Year"]),
                "actual_yield": float(
                    example[TARGET_COLUMN]
                ),
                "predicted_yield": float(
                    prediction
                ),
                "absolute_error": float(
                    abs(
                        example[TARGET_COLUMN]
                        - prediction
                    )
                ),
                "factor_1": (
                    top_factors.iloc[0]["feature"]
                ),
                "factor_1_effect": float(
                    top_factors.iloc[0][
                        "prediction_change"
                    ]
                ),
                "factor_2": (
                    top_factors.iloc[1]["feature"]
                ),
                "factor_2_effect": float(
                    top_factors.iloc[1][
                        "prediction_change"
                    ]
                ),
                "factor_3": (
                    top_factors.iloc[2]["feature"]
                ),
                "factor_3_effect": float(
                    top_factors.iloc[2][
                        "prediction_change"
                    ]
                ),
            }
        )

    json_path = (
        REPORTS_DIR
        / "model_explainability_report.json"
    )

    csv_path = (
        REPORTS_DIR
        / "model_explainability_summary.csv"
    )

    text_path = (
        REPORTS_DIR
        / "model_explainability_report.txt"
    )

    json_path.write_text(
        json.dumps(
            {
                "model": (
                    "Decision Tree Time-Based Pipeline"
                ),
                "training_period": "1997-2016",
                "test_period": "2019-2020",
                "explanation_method": (
                    "Reference-value local sensitivity"
                ),
                "reference_values": (
                    reference_values
                ),
                "examples": complete_explanations,
            },
            indent=2,
            default=str,
        ),
        encoding="utf-8",
    )

    pd.DataFrame(summary_rows).to_csv(
        csv_path,
        index=False,
    )

    lines = [
        "YieldSense AI - Model Explainability Report",
        "=" * 55,
        "",
        "Model: Decision Tree Time-Based Pipeline",
        "Training period: 1997-2016",
        "Future test period: 2019-2020",
        "",
        (
            "Method: Each input feature is replaced "
            "with a reference value. The resulting "
            "change in predicted yield estimates the "
            "local influence of that feature."
        ),
        "",
    ]

    for explanation in complete_explanations:
        lines.extend(
            [
                (
                    f"Example "
                    f"{explanation['example_number']}"
                ),
                "-" * 55,
                (
                    f"Crop: {explanation['crop']} | "
                    f"State: {explanation['state']} | "
                    f"Season: "
                    f"{explanation['season']} | "
                    f"Year: "
                    f"{explanation['crop_year']}"
                ),
                (
                    f"Actual yield: "
                    f"{explanation['actual_yield']:.4f}"
                ),
                (
                    f"Predicted yield: "
                    f"{explanation['predicted_yield']:.4f}"
                ),
                (
                    f"Absolute error: "
                    f"{explanation['absolute_error']:.4f}"
                ),
                "Top influencing factors:",
            ]
        )

        for factor in explanation["top_factors"]:
            lines.append(
                (
                    f"- {factor['feature']}: "
                    f"{factor['direction']} by "
                    f"{abs(factor['prediction_change']):.4f}"
                )
            )

        lines.append("")

    text_path.write_text(
        "\n".join(lines),
        encoding="utf-8",
    )

    print()
    print(f"Training rows : {len(training_data)}")
    print(f"Future rows   : {len(test_data)}")
    print(
        f"Examples      : "
        f"{len(selected_examples)}"
    )

    print()
    print("Sample explanations")
    print("-" * 70)

    for row in summary_rows[:5]:
        print()
        print(
            f"{row['crop']} | "
            f"{row['state']} | "
            f"{row['year']}"
        )

        print(
            f"Actual={row['actual_yield']:.4f}, "
            f"Predicted={row['predicted_yield']:.4f}, "
            f"Error={row['absolute_error']:.4f}"
        )

        print(
            "Top factors:",
            row["factor_1"],
            row["factor_2"],
            row["factor_3"],
        )

    print()
    print("Reports saved:")
    print(json_path)
    print(csv_path)
    print(text_path)


if __name__ == "__main__":
    main()