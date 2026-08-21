"""
preprocess.py — Data Preprocessing Pipeline for YieldSense AI.

Cleans raw agricultural data and writes model-ready features.
Usage:
    python preprocess.py
"""
import logging
import sys
from pathlib import Path

import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

def clean_agricultural_data(input_path: str | Path, output_path: str | Path) -> None:
    """
    Executes the data cleaning and preprocessing pipeline.
    
    Args:
        input_path: Path to raw dataset.
        output_path: Path to write the cleaned dataset.
    """
    input_file = Path(input_path)
    output_file = Path(output_path)
    
    logging.info(f"Initiating preprocessing pipeline for {input_file}")

    if not input_file.exists():
        logging.error(f"Source file missing: {input_file}. Please ensure raw data is present.")
        return

    try:
        dataset = pd.read_csv(input_file)
    except Exception as exc:
        logging.error(f"Failed to read dataset: {exc}")
        return

    # 1. Impute missing environmental features
    environmental_features = ["avg_temp", "average_rain_fall_mm_per_year", "rainfall", "ph", "temperature", "humidity"]
    active_features = [feat for feat in environmental_features if feat in dataset.columns]
    
    for feature in active_features:
        missing_count = dataset[feature].isnull().sum()
        if missing_count > 0:
            feature_mean = dataset[feature].mean()
            dataset[feature] = dataset[feature].fillna(feature_mean)
            logging.info(f"Imputed {missing_count} missing entries in '{feature}' using mean ({feature_mean:.2f}).")

    # 2. Filter physically impossible measurements
    precipitation_feature = "rainfall" if "rainfall" in dataset.columns else (
        "average_rain_fall_mm_per_year" if "average_rain_fall_mm_per_year" in dataset.columns else None
    )
    
    if precipitation_feature:
        initial_count = len(dataset)
        dataset = dataset[dataset[precipitation_feature] >= 0]
        dropped_count = initial_count - len(dataset)
        if dropped_count > 0:
            logging.info(f"Discarded {dropped_count} records due to negative precipitation anomalies.")

    if "ph" in dataset.columns:
        initial_count = len(dataset)
        dataset = dataset[dataset["ph"].between(0, 14)]
        dropped_count = initial_count - len(dataset)
        if dropped_count > 0:
            logging.info(f"Discarded {dropped_count} records due to invalid soil pH ranges.")

    # 3. Remove redundant data points
    initial_count = len(dataset)
    dataset = dataset.drop_duplicates()
    dropped_count = initial_count - len(dataset)
    if dropped_count > 0:
        logging.info(f"Removed {dropped_count} duplicate records from the dataset.")

    # 4. Persist clean dataset
    output_file.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(output_file, index=False)
    logging.info(f"Pipeline complete. Exported {len(dataset)} processed records to {output_file}.")


if __name__ == "__main__":
    clean_agricultural_data(
        input_path="data/raw/crop_yield_raw.csv",
        output_path="data/processed/crop_yield_clean.csv",
    )
