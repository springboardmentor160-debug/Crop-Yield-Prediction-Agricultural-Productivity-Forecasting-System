"""
YieldSense AI — Data Preprocessing Pipeline

A reusable, configurable pipeline for cleaning and normalizing crop datasets.
Designed to be used independently or integrated into the API.

Usage:
    from preprocessing.pipeline import CropDataPreprocessor, PreprocessingConfig

    config = PreprocessingConfig(
        required_columns=["crop", "area", "production", "yield"],
        numeric_columns=["area", "production", "yield", "annual_rainfall"],
        normalize_columns=["area", "production", "annual_rainfall"],
    )

    preprocessor = CropDataPreprocessor(config)
    report = preprocessor.run("datasets/raw/input.csv", "datasets/processed/output.csv")
    print(report)
"""

import os
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


@dataclass
class PreprocessingConfig:
    """Configuration for the preprocessing pipeline."""

    # Required columns that must exist in the dataset
    required_columns: List[str] = field(default_factory=lambda: [
        "crop", "season", "state", "area", "production",
        "annual_rainfall", "fertilizer_usage", "pesticide_usage",
        "temperature", "soil_ph", "nitrogen", "phosphorus", "potassium", "yield",
    ])

    # Numeric columns for validation and processing
    numeric_columns: List[str] = field(default_factory=lambda: [
        "area", "production", "annual_rainfall", "fertilizer_usage",
        "pesticide_usage", "temperature", "soil_ph", "nitrogen",
        "phosphorus", "potassium", "yield",
    ])

    # Columns to normalize (min-max)
    normalize_columns: List[str] = field(default_factory=lambda: [
        "area", "production", "annual_rainfall", "fertilizer_usage",
        "pesticide_usage", "temperature",
    ])

    # Missing value strategies: 'drop', 'mean', 'median', 'mode', 'zero'
    missing_value_strategies: Dict[str, str] = field(default_factory=lambda: {
        "area": "median",
        "production": "median",
        "annual_rainfall": "mean",
        "fertilizer_usage": "mean",
        "pesticide_usage": "mean",
        "temperature": "mean",
        "soil_ph": "median",
        "nitrogen": "mean",
        "phosphorus": "mean",
        "potassium": "mean",
        "yield": "drop",
        "crop": "drop",
    })

    # Domain-specific validation rules
    validation_rules: Dict[str, Tuple[float, float]] = field(default_factory=lambda: {
        "area": (0.0, float("inf")),
        "production": (0.0, float("inf")),
        "annual_rainfall": (0.0, 5000.0),
        "temperature": (-50.0, 60.0),
        "soil_ph": (0.0, 14.0),
        "nitrogen": (0.0, float("inf")),
        "phosphorus": (0.0, float("inf")),
        "potassium": (0.0, float("inf")),
        "yield": (0.0, float("inf")),
    })

    # Outlier detection
    outlier_method: str = "iqr"  # 'iqr' or 'zscore'
    outlier_action: str = "cap"  # 'cap' or 'remove'
    iqr_multiplier: float = 1.5
    zscore_threshold: float = 3.0


@dataclass
class PreprocessingReport:
    """Report generated after preprocessing."""

    input_file: str = ""
    output_file: str = ""
    original_rows: int = 0
    final_rows: int = 0
    original_columns: int = 0
    final_columns: int = 0
    missing_values_handled: Dict[str, int] = field(default_factory=dict)
    duplicates_removed: int = 0
    invalid_rows_removed: int = 0
    outliers_handled: int = 0
    columns_normalized: List[str] = field(default_factory=list)
    processing_time_seconds: float = 0.0
    timestamp: str = ""
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def __str__(self) -> str:
        """Human-readable summary."""
        lines = [
            "=" * 60,
            "PREPROCESSING REPORT",
            "=" * 60,
            f"Input:               {self.input_file}",
            f"Output:              {self.output_file}",
            f"Timestamp:           {self.timestamp}",
            f"Processing Time:     {self.processing_time_seconds:.2f}s",
            "-" * 60,
            f"Original Rows:       {self.original_rows}",
            f"Final Rows:          {self.final_rows}",
            f"Rows Removed:        {self.original_rows - self.final_rows}",
            f"Duplicates Removed:  {self.duplicates_removed}",
            f"Invalid Rows:        {self.invalid_rows_removed}",
            f"Outliers Handled:    {self.outliers_handled}",
            f"Columns Normalized:  {', '.join(self.columns_normalized) if self.columns_normalized else 'None'}",
        ]

        if self.missing_values_handled:
            lines.append("-" * 60)
            lines.append("Missing Values Handled:")
            for col, count in self.missing_values_handled.items():
                lines.append(f"  {col}: {count}")

        if self.warnings:
            lines.append("-" * 60)
            lines.append("Warnings:")
            for w in self.warnings:
                lines.append(f"  ⚠ {w}")

        if self.errors:
            lines.append("-" * 60)
            lines.append("Errors:")
            for e in self.errors:
                lines.append(f"  ❌ {e}")

        lines.append("=" * 60)
        return "\n".join(lines)


class CropDataPreprocessor:
    """
    Reusable CSV preprocessing pipeline for crop datasets.

    The pipeline executes these stages in order:
    1. Read CSV
    2. Validate Schema
    3. Handle Missing Values
    4. Handle Duplicates
    5. Remove Invalid Rows
    6. Handle Outliers
    7. Normalize Data
    8. Export Processed CSV
    """

    def __init__(self, config: Optional[PreprocessingConfig] = None):
        """
        Initialize the preprocessor.

        Args:
            config: Pipeline configuration. Uses defaults if not provided.
        """
        self.config = config or PreprocessingConfig()
        self.report = PreprocessingReport()

    def run(self, input_path: str, output_path: str) -> PreprocessingReport:
        """
        Execute the full preprocessing pipeline.

        Args:
            input_path: Path to the raw CSV file.
            output_path: Path for the processed CSV output.

        Returns:
            PreprocessingReport with statistics about the processing.
        """
        start_time = datetime.now()
        self.report = PreprocessingReport(
            input_file=input_path,
            output_file=output_path,
            timestamp=start_time.isoformat(),
        )

        try:
            # Stage 1: Read CSV
            df = self._read_csv(input_path)
            self.report.original_rows = len(df)
            self.report.original_columns = len(df.columns)

            # Stage 2: Validate Schema
            df = self._validate_schema(df)

            # Stage 3: Handle Missing Values
            df = self._handle_missing_values(df)

            # Stage 4: Handle Duplicates
            df = self._handle_duplicates(df)

            # Stage 5: Remove Invalid Rows
            df = self._remove_invalid_rows(df)

            # Stage 6: Handle Outliers
            df = self._handle_outliers(df)

            # Stage 7: Normalize Data
            df = self._normalize_data(df)

            # Stage 8: Export
            self._export_csv(df, output_path)

            self.report.final_rows = len(df)
            self.report.final_columns = len(df.columns)

        except Exception as e:
            self.report.errors.append(str(e))

        self.report.processing_time_seconds = (datetime.now() - start_time).total_seconds()
        return self.report

    def _read_csv(self, path: str) -> pd.DataFrame:
        """Stage 1: Read the CSV file."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"Input file not found: {path}")

        try:
            df = pd.read_csv(path)
        except Exception as e:
            raise ValueError(f"Failed to read CSV: {e}")

        if df.empty:
            raise ValueError("CSV file is empty")

        # Standardize column names
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

        return df

    def _validate_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 2: Validate that required columns exist."""
        missing_cols = [col for col in self.config.required_columns if col not in df.columns]

        if missing_cols:
            self.report.warnings.append(
                f"Missing columns (will be skipped): {missing_cols}"
            )
            # Update config to only use available columns
            self.config.required_columns = [
                col for col in self.config.required_columns if col in df.columns
            ]
            self.config.numeric_columns = [
                col for col in self.config.numeric_columns if col in df.columns
            ]
            self.config.normalize_columns = [
                col for col in self.config.normalize_columns if col in df.columns
            ]

        # Convert numeric columns to numeric types
        for col in self.config.numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        return df

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 3: Handle missing values based on per-column strategies."""
        for col, strategy in self.config.missing_value_strategies.items():
            if col not in df.columns:
                continue

            missing_count = df[col].isna().sum()
            if missing_count == 0:
                continue

            self.report.missing_values_handled[col] = int(missing_count)

            if strategy == "drop":
                df = df.dropna(subset=[col])
            elif strategy == "mean":
                df[col] = df[col].fillna(df[col].mean())
            elif strategy == "median":
                df[col] = df[col].fillna(df[col].median())
            elif strategy == "mode":
                mode_val = df[col].mode()
                if not mode_val.empty:
                    df[col] = df[col].fillna(mode_val[0])
            elif strategy == "zero":
                df[col] = df[col].fillna(0)

        return df.reset_index(drop=True)

    def _handle_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 4: Remove exact duplicate rows."""
        before = len(df)
        df = df.drop_duplicates()
        self.report.duplicates_removed = before - len(df)
        return df.reset_index(drop=True)

    def _remove_invalid_rows(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 5: Remove rows with domain-invalid values."""
        before = len(df)

        for col, (min_val, max_val) in self.config.validation_rules.items():
            if col not in df.columns:
                continue
            df = df[
                (df[col].isna()) | ((df[col] >= min_val) & (df[col] <= max_val))
            ]

        self.report.invalid_rows_removed = before - len(df)
        return df.reset_index(drop=True)

    def _handle_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 6: Detect and handle outliers using IQR or Z-score."""
        total_outliers = 0

        for col in self.config.numeric_columns:
            if col not in df.columns:
                continue

            if self.config.outlier_method == "iqr":
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - self.config.iqr_multiplier * iqr
                upper_bound = q3 + self.config.iqr_multiplier * iqr
            else:  # zscore
                mean = df[col].mean()
                std = df[col].std()
                lower_bound = mean - self.config.zscore_threshold * std
                upper_bound = mean + self.config.zscore_threshold * std

            outlier_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
            outlier_count = outlier_mask.sum()
            total_outliers += outlier_count

            if outlier_count > 0:
                if self.config.outlier_action == "cap":
                    df.loc[df[col] < lower_bound, col] = lower_bound
                    df.loc[df[col] > upper_bound, col] = upper_bound
                else:  # remove
                    df = df[~outlier_mask]

        self.report.outliers_handled = total_outliers
        return df.reset_index(drop=True)

    def _normalize_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 7: Apply min-max normalization to specified columns."""
        normalized_cols = []

        for col in self.config.normalize_columns:
            if col not in df.columns:
                continue

            col_min = df[col].min()
            col_max = df[col].max()

            if col_max - col_min > 0:
                df[col] = (df[col] - col_min) / (col_max - col_min)
                normalized_cols.append(col)
            else:
                self.report.warnings.append(
                    f"Column '{col}' has zero range — skipped normalization"
                )

        self.report.columns_normalized = normalized_cols
        return df

    def _export_csv(self, df: pd.DataFrame, path: str) -> None:
        """Stage 8: Export processed DataFrame to CSV."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)


# ============================================================
# Convenience function for command-line usage
# ============================================================
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python -m preprocessing.pipeline <input.csv> <output.csv>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    preprocessor = CropDataPreprocessor()
    report = preprocessor.run(input_file, output_file)
    print(report)
