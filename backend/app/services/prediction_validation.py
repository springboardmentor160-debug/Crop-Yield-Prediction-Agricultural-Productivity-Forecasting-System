from __future__ import annotations

import math
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import HTTPException, status

BACKEND_ROOT = Path(__file__).resolve().parents[2]

PROCESSED_DATASET_PATH = (
    BACKEND_ROOT
    / "ml"
    / "data"
    / "processed"
    / "yieldsense_ml_dataset.csv"
)

TRAINING_START_YEAR = 1997
TRAINING_END_YEAR = 2020

MODEL_FEATURES = [
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


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def normalize_lookup_key(value: str) -> str:
    return normalize_text(value).casefold()


def ensure_finite(
    value: float,
    field_name: str,
) -> float:
    try:
        numeric_value = float(value)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} must be a valid number",
        ) from exc

    if not math.isfinite(numeric_value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"{field_name} cannot be NaN, "
                "positive infinity, or negative infinity"
            ),
        )

    return numeric_value


@lru_cache(maxsize=1)
def get_prediction_validation_data() -> dict[str, Any]:
    if not PROCESSED_DATASET_PATH.exists():
        raise RuntimeError(
            "The processed ML dataset required for prediction "
            f"validation was not found: {PROCESSED_DATASET_PATH}"
        )

    dataframe = pd.read_csv(PROCESSED_DATASET_PATH)

    missing_columns = [
        column
        for column in MODEL_FEATURES
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise RuntimeError(
            "The processed ML dataset is missing validation "
            f"columns: {missing_columns}"
        )

    crop_lookup = {
        normalize_lookup_key(value): normalize_text(value)
        for value in dataframe["Crop"]
        .dropna()
        .astype(str)
        .unique()
    }

    season_lookup = {
        normalize_lookup_key(value): normalize_text(value)
        for value in dataframe["Season"]
        .dropna()
        .astype(str)
        .unique()
    }

    state_lookup = {
        normalize_lookup_key(value): normalize_text(value)
        for value in dataframe["State"]
        .dropna()
        .astype(str)
        .unique()
    }

    numeric_ranges: dict[str, dict[str, float]] = {}

    for feature in NUMERIC_FEATURES:
        values = pd.to_numeric(
            dataframe[feature],
            errors="coerce",
        ).dropna()

        numeric_ranges[feature] = {
            "minimum": float(values.min()),
            "maximum": float(values.max()),
            "lower_reference": float(
                values.quantile(0.005)
            ),
            "upper_reference": float(
                values.quantile(0.995)
            ),
        }

    return {
        "crop_lookup": crop_lookup,
        "season_lookup": season_lookup,
        "state_lookup": state_lookup,
        "numeric_ranges": numeric_ranges,
    }


def resolve_supported_crop(value: str) -> str:
    validation_data = get_prediction_validation_data()
    normalized_key = normalize_lookup_key(value)

    crop = validation_data["crop_lookup"].get(
        normalized_key
    )

    if crop is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Crop '{normalize_text(value)}' is not supported "
                "by the trained model"
            ),
        )

    return crop


def resolve_supported_season(value: str) -> str:
    validation_data = get_prediction_validation_data()
    normalized_key = normalize_lookup_key(value)

    season = validation_data["season_lookup"].get(
        normalized_key
    )

    if season is None:
        supported_seasons = sorted(
            validation_data["season_lookup"].values()
        )

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Season '{normalize_text(value)}' is not supported. "
                f"Supported seasons: {', '.join(supported_seasons)}"
            ),
        )

    return season


def resolve_supported_state(value: str) -> str:
    validation_data = get_prediction_validation_data()
    normalized_key = normalize_lookup_key(value)

    state_name = validation_data["state_lookup"].get(
        normalized_key
    )

    if state_name is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"State '{normalize_text(value)}' is not supported "
                "by the trained model"
            ),
        )

    return state_name


def validate_hard_numeric_ranges(
    values: dict[str, Any],
) -> None:
    hard_rules = {
        "area_hectares": (
            0,
            None,
            "Farm area must be greater than zero",
        ),
        "annual_rainfall": (
            0,
            None,
            "Annual rainfall cannot be negative",
        ),
        "fertilizer": (
            0,
            None,
            "Fertilizer cannot be negative",
        ),
        "pesticide": (
            0,
            None,
            "Pesticide cannot be negative",
        ),
        "nitrogen": (
            0,
            None,
            "Nitrogen cannot be negative",
        ),
        "phosphorus": (
            0,
            None,
            "Phosphorus cannot be negative",
        ),
        "potassium": (
            0,
            None,
            "Potassium cannot be negative",
        ),
        "ph": (
            0,
            14,
            "Soil pH must be between 0 and 14",
        ),
        "average_temperature_c": (
            -50,
            60,
            "Average temperature must be between -50 and 60°C",
        ),
        "total_rainfall_mm": (
            0,
            None,
            "Total rainfall cannot be negative",
        ),
        "average_humidity_percent": (
            0,
            100,
            "Average humidity must be between 0 and 100",
        ),
    }

    for field_name, (
        minimum,
        maximum,
        message,
    ) in hard_rules.items():
        numeric_value = ensure_finite(
            values[field_name],
            field_name.replace("_", " ").title(),
        )

        if field_name == "area_hectares":
            invalid = numeric_value <= minimum
        else:
            invalid = numeric_value < minimum

        if maximum is not None:
            invalid = invalid or numeric_value > maximum

        if invalid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=message,
            )


def validate_model_dataframe(
    model_dataframe: pd.DataFrame,
) -> None:
    if len(model_dataframe) != 1:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Prediction input must contain exactly one record"
            ),
        )

    missing_columns = [
        column
        for column in MODEL_FEATURES
        if column not in model_dataframe.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Prediction input is missing model features: "
                + ", ".join(missing_columns)
            ),
        )

    unexpected_columns = [
        column
        for column in model_dataframe.columns
        if column not in MODEL_FEATURES
    ]

    if unexpected_columns:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Prediction input contains unexpected features: "
                + ", ".join(unexpected_columns)
            ),
        )

    if model_dataframe.isna().any().any():
        missing_features = (
            model_dataframe.columns[
                model_dataframe.isna().any()
            ]
            .tolist()
        )

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Prediction inputs contain missing values: "
                + ", ".join(missing_features)
            ),
        )

    for feature in NUMERIC_FEATURES:
        ensure_finite(
            model_dataframe.iloc[0][feature],
            feature,
        )


def build_prediction_warnings(
    values: dict[str, Any],
) -> list[str]:
    validation_data = get_prediction_validation_data()
    ranges = validation_data["numeric_ranges"]

    warnings: list[str] = []

    crop_year = int(values["crop_year"])

    if crop_year > TRAINING_END_YEAR:
        warnings.append(
            "The requested crop year is later than the model's "
            f"training period ending in {TRAINING_END_YEAR}."
        )

    if crop_year < TRAINING_START_YEAR:
        warnings.append(
            "The requested crop year is earlier than the model's "
            f"training period beginning in {TRAINING_START_YEAR}."
        )

    weather_reference_year = values.get(
        "weather_reference_year"
    )

    if (
        weather_reference_year is not None
        and int(weather_reference_year) != crop_year
    ):
        warnings.append(
            "Exact weather data was unavailable for the requested "
            f"year. Weather data from {weather_reference_year} was used."
        )

    field_mapping = {
        "area_hectares": "Area",
        "annual_rainfall": "Annual_Rainfall",
        "fertilizer": "Fertilizer",
        "pesticide": "Pesticide",
        "nitrogen": "N",
        "phosphorus": "P",
        "potassium": "K",
        "ph": "pH",
        "average_temperature_c": "avg_temp_c",
        "total_rainfall_mm": "total_rainfall_mm",
        "average_humidity_percent": (
            "avg_humidity_percent"
        ),
    }

    for service_field, dataset_feature in field_mapping.items():
        value = float(values[service_field])
        reference = ranges[dataset_feature]

        if (
            value < reference["lower_reference"]
            or value > reference["upper_reference"]
        ):
            warnings.append(
                f"{service_field.replace('_', ' ').title()} is "
                "outside the range seen in most training records. "
                "The prediction may be less reliable."
            )

    return warnings


def clear_prediction_validation_cache() -> None:
    get_prediction_validation_data.cache_clear()