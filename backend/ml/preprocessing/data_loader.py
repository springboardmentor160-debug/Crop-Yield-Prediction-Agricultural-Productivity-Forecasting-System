"""
YieldSense AI — Data Loader

Loads, validates, and cleans the crop dataset using the M1 preprocessing pipeline.
"""

import os
import pandas as pd

from ml.utils.config import (
    RAW_DATA_PATH,
    PROCESSED_DATA_PATH,
    REQUIRED_COLUMNS,
    TARGET_COLUMN,
)


def load_and_clean_data(
    raw_path: str = RAW_DATA_PATH,
    processed_path: str = PROCESSED_DATA_PATH,
    force_reprocess: bool = False,
) -> pd.DataFrame:
    """
    Load the crop dataset. If a processed version exists and reprocessing
    is not forced, load it directly. Otherwise, run the M1 preprocessing
    pipeline and return the cleaned data.

    Args:
        raw_path: Path to the raw CSV dataset.
        processed_path: Path for the processed output.
        force_reprocess: If True, always reprocess from raw.

    Returns:
        Cleaned pandas DataFrame ready for feature engineering.
    """
    # Use processed data if available and not forcing reprocess
    if os.path.exists(processed_path) and not force_reprocess:
        print(f"Loading processed dataset from: {processed_path}")
        df = pd.read_csv(processed_path)
    else:
        print(f"Loading raw dataset from: {raw_path}")
        if not os.path.exists(raw_path):
            raise FileNotFoundError(f"Raw dataset not found: {raw_path}")

        df = pd.read_csv(raw_path)

        # Standardize column names
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

        # Basic cleaning (leveraging M1 pipeline concepts without normalization)
        df = _clean_dataset(df)

        # Save processed version
        os.makedirs(os.path.dirname(processed_path), exist_ok=True)
        df.to_csv(processed_path, index=False)
        print(f"Processed dataset saved to: {processed_path}")

    # Validate schema
    _validate_schema(df)

    print(f"Dataset shape: {df.shape[0]} rows x {df.shape[1]} columns")
    return df


def _clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply basic cleaning without normalization (scaling is done in feature engineering).
    """
    original_len = len(df)

    # Drop exact duplicates
    df = df.drop_duplicates()

    # Drop rows where target is missing
    df = df.dropna(subset=[TARGET_COLUMN])

    # Drop rows where critical features are missing
    critical_cols = [c for c in REQUIRED_COLUMNS if c in df.columns]
    df = df.dropna(subset=critical_cols)

    # Ensure numeric columns are numeric
    numeric_cols = [
        "area", "production", "annual_rainfall", "fertilizer_usage",
        "pesticide_usage", "temperature", "soil_ph",
        "nitrogen", "phosphorus", "potassium", "yield",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop rows with any remaining NaN in numeric cols
    available_numeric = [c for c in numeric_cols if c in df.columns]
    df = df.dropna(subset=available_numeric)

    # Remove rows with negative yield or area
    if "yield" in df.columns:
        df = df[df["yield"] > 0]
    if "area" in df.columns:
        df = df[df["area"] > 0]

    # Validate pH range
    if "soil_ph" in df.columns:
        df = df[(df["soil_ph"] >= 0) & (df["soil_ph"] <= 14)]

    df = df.reset_index(drop=True)
    removed = original_len - len(df)
    if removed > 0:
        print(f"Removed {removed} invalid/duplicate rows during cleaning")

    return df


def _validate_schema(df: pd.DataFrame) -> None:
    """
    Validate that the dataset contains all required columns.
    Raises ValueError if critical columns are missing.
    """
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(
            f"Dataset is missing required columns: {missing}. "
            f"Available columns: {list(df.columns)}"
        )

    if len(df) == 0:
        raise ValueError("Dataset is empty after cleaning")

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found in dataset")

    print(f"Schema validated - all {len(REQUIRED_COLUMNS)} required columns present")
