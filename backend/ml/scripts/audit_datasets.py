from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

import pandas as pd


ML_ROOT = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = ML_ROOT / "data" / "raw"
REPORTS_DIR = ML_ROOT / "reports"

DATASET_FILES = {
    "historical_crop_yield": (
        RAW_DATA_DIR / "historical_crop_yield.csv"
    ),
    "state_soil": RAW_DATA_DIR / "state_soil.csv",
    "state_weather": RAW_DATA_DIR / "state_weather.csv",
}

EXPECTED_COLUMNS = {
    "historical_crop_yield": [
        "Crop",
        "Crop_Year",
        "Season",
        "State",
        "Area",
        "Production",
        "Annual_Rainfall",
        "Fertilizer",
        "Pesticide",
        "Yield",
    ],
    "state_soil": [
        "state",
        "N",
        "P",
        "K",
        "pH",
    ],
    "state_weather": [
        "state",
        "year",
        "avg_temp_c",
        "total_rainfall_mm",
        "avg_humidity_percent",
    ],
}


def make_json_safe(value: Any) -> Any:
    """
    Convert pandas and NumPy values into JSON-safe Python values.
    """
    if value is None:
        return None

    if isinstance(value, dict):
        return {
            str(key): make_json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [make_json_safe(item) for item in value]

    if hasattr(value, "item"):
        try:
            value = value.item()
        except (ValueError, AttributeError):
            pass

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None

    if pd.isna(value):
        return None

    return value


def normalize_column_name(column: Any) -> str:
    return (
        str(column)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        .replace(".", "")
    )


def read_csv_safely(file_path: Path) -> pd.DataFrame:
    if not file_path.exists():
        raise FileNotFoundError(
            f"Dataset file was not found: {file_path}"
        )

    try:
        return pd.read_csv(file_path)
    except UnicodeDecodeError:
        return pd.read_csv(file_path, encoding="latin-1")


def get_column_report(
    dataframe: pd.DataFrame,
    column: str,
) -> dict[str, Any]:
    series = dataframe[column]

    report: dict[str, Any] = {
        "data_type": str(series.dtype),
        "total_values": int(len(series)),
        "missing_values": int(series.isna().sum()),
        "missing_percentage": round(
            float(series.isna().mean() * 100),
            4,
        ),
        "unique_values": int(series.nunique(dropna=True)),
    }

    if pd.api.types.is_numeric_dtype(series):
        numeric_series = pd.to_numeric(
            series,
            errors="coerce",
        )

        report.update(
            {
                "minimum": make_json_safe(numeric_series.min()),
                "maximum": make_json_safe(numeric_series.max()),
                "mean": make_json_safe(numeric_series.mean()),
                "median": make_json_safe(numeric_series.median()),
                "standard_deviation": make_json_safe(
                    numeric_series.std()
                ),
                "zero_values": int((numeric_series == 0).sum()),
                "negative_values": int((numeric_series < 0).sum()),
            }
        )
    else:
        cleaned_series = (
            series.dropna()
            .astype(str)
            .str.strip()
        )

        top_values = (
            cleaned_series.value_counts()
            .head(10)
            .to_dict()
        )

        report.update(
            {
                "empty_string_values": int(
                    cleaned_series.eq("").sum()
                ),
                "leading_or_trailing_space_values": int(
                    (
                        series.dropna().astype(str)
                        != series.dropna().astype(str).str.strip()
                    ).sum()
                ),
                "top_values": make_json_safe(top_values),
            }
        )

    return report


def get_dataset_specific_checks(
    dataset_name: str,
    dataframe: pd.DataFrame,
) -> dict[str, Any]:
    normalized_columns = {
        normalize_column_name(column): column
        for column in dataframe.columns
    }

    checks: dict[str, Any] = {}

    if dataset_name == "historical_crop_yield":
        numeric_checks = [
            "area",
            "production",
            "annual_rainfall",
            "fertilizer",
            "pesticide",
            "yield",
        ]

        for normalized_name in numeric_checks:
            original_column = normalized_columns.get(
                normalized_name
            )

            if original_column:
                numeric_values = pd.to_numeric(
                    dataframe[original_column],
                    errors="coerce",
                )

                checks[f"{normalized_name}_negative_count"] = int(
                    (numeric_values < 0).sum()
                )

        year_column = normalized_columns.get("crop_year")

        if year_column:
            years = pd.to_numeric(
                dataframe[year_column],
                errors="coerce",
            )

            checks["minimum_crop_year"] = make_json_safe(
                years.min()
            )
            checks["maximum_crop_year"] = make_json_safe(
                years.max()
            )
            checks["invalid_crop_year_count"] = int(
                years.isna().sum()
            )

        state_column = normalized_columns.get("state")
        crop_column = normalized_columns.get("crop")
        season_column = normalized_columns.get("season")

        if state_column:
            checks["states"] = sorted(
                dataframe[state_column]
                .dropna()
                .astype(str)
                .str.strip()
                .unique()
                .tolist()
            )

        if crop_column:
            checks["crop_count"] = int(
                dataframe[crop_column]
                .dropna()
                .astype(str)
                .str.strip()
                .nunique()
            )

        if season_column:
            checks["seasons"] = sorted(
                dataframe[season_column]
                .dropna()
                .astype(str)
                .str.strip()
                .unique()
                .tolist()
            )

    elif dataset_name == "state_soil":
        ph_column = normalized_columns.get("ph")

        if ph_column:
            ph_values = pd.to_numeric(
                dataframe[ph_column],
                errors="coerce",
            )

            checks["ph_below_zero_count"] = int(
                (ph_values < 0).sum()
            )
            checks["ph_above_fourteen_count"] = int(
                (ph_values > 14).sum()
            )

        state_column = normalized_columns.get("state")

        if state_column:
            checks["states"] = sorted(
                dataframe[state_column]
                .dropna()
                .astype(str)
                .str.strip()
                .unique()
                .tolist()
            )

            checks["duplicate_state_count"] = int(
                dataframe[state_column]
                .dropna()
                .astype(str)
                .str.strip()
                .str.lower()
                .duplicated()
                .sum()
            )

    elif dataset_name == "state_weather":
        humidity_column = normalized_columns.get(
            "avg_humidity_percent"
        )

        if humidity_column:
            humidity_values = pd.to_numeric(
                dataframe[humidity_column],
                errors="coerce",
            )

            checks["humidity_below_zero_count"] = int(
                (humidity_values < 0).sum()
            )
            checks["humidity_above_hundred_count"] = int(
                (humidity_values > 100).sum()
            )

        rainfall_column = normalized_columns.get(
            "total_rainfall_mm"
        )

        if rainfall_column:
            rainfall_values = pd.to_numeric(
                dataframe[rainfall_column],
                errors="coerce",
            )

            checks["negative_rainfall_count"] = int(
                (rainfall_values < 0).sum()
            )

        year_column = normalized_columns.get("year")

        if year_column:
            years = pd.to_numeric(
                dataframe[year_column],
                errors="coerce",
            )

            checks["minimum_year"] = make_json_safe(years.min())
            checks["maximum_year"] = make_json_safe(years.max())
            checks["invalid_year_count"] = int(
                years.isna().sum()
            )

        state_column = normalized_columns.get("state")

        if state_column:
            checks["states"] = sorted(
                dataframe[state_column]
                .dropna()
                .astype(str)
                .str.strip()
                .unique()
                .tolist()
            )

    return checks


def audit_dataset(
    dataset_name: str,
    file_path: Path,
) -> dict[str, Any]:
    dataframe = read_csv_safely(file_path)

    actual_columns = [
        str(column).strip()
        for column in dataframe.columns
    ]

    normalized_actual_columns = {
        normalize_column_name(column)
        for column in actual_columns
    }

    normalized_expected_columns = {
        normalize_column_name(column)
        for column in EXPECTED_COLUMNS[dataset_name]
    }

    missing_columns = sorted(
        normalized_expected_columns
        - normalized_actual_columns
    )

    unexpected_columns = sorted(
        normalized_actual_columns
        - normalized_expected_columns
    )

    column_reports = {
        str(column): get_column_report(dataframe, column)
        for column in dataframe.columns
    }

    return {
        "dataset_name": dataset_name,
        "file_path": str(file_path),
        "file_size_bytes": file_path.stat().st_size,
        "row_count": int(len(dataframe)),
        "column_count": int(len(dataframe.columns)),
        "columns": actual_columns,
        "missing_expected_columns": missing_columns,
        "unexpected_columns": unexpected_columns,
        "duplicate_row_count": int(
            dataframe.duplicated().sum()
        ),
        "total_missing_values": int(
            dataframe.isna().sum().sum()
        ),
        "column_reports": column_reports,
        "specific_checks": get_dataset_specific_checks(
            dataset_name,
            dataframe,
        ),
    }


def build_state_compatibility_report(
    audit_results: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    yield_states = set(
        audit_results["historical_crop_yield"]
        ["specific_checks"]
        .get("states", [])
    )

    soil_states = set(
        audit_results["state_soil"]
        ["specific_checks"]
        .get("states", [])
    )

    weather_states = set(
        audit_results["state_weather"]
        ["specific_checks"]
        .get("states", [])
    )

    normalized_yield = {
        state.strip().lower(): state
        for state in yield_states
    }

    normalized_soil = {
        state.strip().lower(): state
        for state in soil_states
    }

    normalized_weather = {
        state.strip().lower(): state
        for state in weather_states
    }

    common_normalized = (
        set(normalized_yield)
        & set(normalized_soil)
        & set(normalized_weather)
    )

    return {
        "historical_yield_state_count": len(yield_states),
        "soil_state_count": len(soil_states),
        "weather_state_count": len(weather_states),
        "common_state_count": len(common_normalized),
        "common_states": sorted(
            normalized_yield[state]
            for state in common_normalized
        ),
        "yield_states_missing_in_soil": sorted(
            normalized_yield[state]
            for state in (
                set(normalized_yield) - set(normalized_soil)
            )
        ),
        "yield_states_missing_in_weather": sorted(
            normalized_yield[state]
            for state in (
                set(normalized_yield) - set(normalized_weather)
            )
        ),
        "soil_states_not_in_yield": sorted(
            normalized_soil[state]
            for state in (
                set(normalized_soil) - set(normalized_yield)
            )
        ),
        "weather_states_not_in_yield": sorted(
            normalized_weather[state]
            for state in (
                set(normalized_weather)
                - set(normalized_yield)
            )
        ),
    }


def write_text_summary(
    report: dict[str, Any],
    output_path: Path,
) -> None:
    lines: list[str] = []

    lines.append("YieldSense AI - Dataset Audit Summary")
    lines.append("=" * 42)
    lines.append("")

    for dataset_name, result in report["datasets"].items():
        lines.append(dataset_name.replace("_", " ").title())
        lines.append("-" * 42)
        lines.append(f"Rows: {result['row_count']}")
        lines.append(f"Columns: {result['column_count']}")
        lines.append(
            f"Duplicate rows: {result['duplicate_row_count']}"
        )
        lines.append(
            f"Total missing values: "
            f"{result['total_missing_values']}"
        )
        lines.append(
            "Missing expected columns: "
            f"{result['missing_expected_columns']}"
        )
        lines.append(
            "Unexpected columns: "
            f"{result['unexpected_columns']}"
        )
        lines.append("")

    compatibility = report["state_compatibility"]

    lines.append("State Compatibility")
    lines.append("-" * 42)
    lines.append(
        f"Historical yield states: "
        f"{compatibility['historical_yield_state_count']}"
    )
    lines.append(
        f"Soil states: {compatibility['soil_state_count']}"
    )
    lines.append(
        f"Weather states: {compatibility['weather_state_count']}"
    )
    lines.append(
        f"Common states: {compatibility['common_state_count']}"
    )
    lines.append(
        "Yield states missing in soil: "
        f"{compatibility['yield_states_missing_in_soil']}"
    )
    lines.append(
        "Yield states missing in weather: "
        f"{compatibility['yield_states_missing_in_weather']}"
    )

    output_path.write_text(
        "\n".join(lines),
        encoding="utf-8",
    )


def main() -> None:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    audit_results: dict[str, dict[str, Any]] = {}

    print("Starting YieldSense AI dataset audit...")
    print()

    for dataset_name, file_path in DATASET_FILES.items():
        print(f"Auditing: {dataset_name}")
        print(f"File: {file_path}")

        audit_results[dataset_name] = audit_dataset(
            dataset_name=dataset_name,
            file_path=file_path,
        )

        print(
            f"Rows: "
            f"{audit_results[dataset_name]['row_count']}"
        )
        print(
            f"Duplicate rows: "
            f"{audit_results[dataset_name]['duplicate_row_count']}"
        )
        print()

    complete_report = {
        "datasets": audit_results,
        "state_compatibility": (
            build_state_compatibility_report(audit_results)
        ),
    }

    json_report_path = (
        REPORTS_DIR / "dataset_audit_report.json"
    )

    text_report_path = (
        REPORTS_DIR / "dataset_audit_summary.txt"
    )

    json_report_path.write_text(
        json.dumps(
            make_json_safe(complete_report),
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    write_text_summary(
        report=complete_report,
        output_path=text_report_path,
    )

    print("Dataset audit completed successfully.")
    print(f"JSON report: {json_report_path}")
    print(f"Text summary: {text_report_path}")


if __name__ == "__main__":
    main()