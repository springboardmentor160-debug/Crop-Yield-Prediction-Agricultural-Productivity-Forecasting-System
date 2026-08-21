"""
YieldSense AI — Feature Engineer

Handles encoding, scaling, and feature/target separation.
Saves fitted transformers for inference-time reuse.
"""

from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

from ml.utils.config import (
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    TARGET_COLUMN,
    LABEL_ENCODERS_FILE,
    SCALER_FILE,
    FEATURE_COLUMNS_FILE,
    SAVED_MODELS_DIR,
)


class FeatureEngineer:
    """
    Handles the full feature engineering pipeline:
    1. Encode categorical features (LabelEncoder per column)
    2. Scale numerical features (StandardScaler)
    3. Separate features (X) and target (y)
    4. Save fitted transformers for inference
    """

    def __init__(self):
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.scaler: StandardScaler = StandardScaler()
        self.feature_columns: List[str] = []
        self.categorical_features: List[str] = []
        self.numerical_features: List[str] = []

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Fit encoders/scaler on the dataset and transform features.

        Args:
            df: Cleaned DataFrame with all required columns.

        Returns:
            Tuple of (X features array, y target array).
        """
        df = df.copy()

        # Detect available categorical and numerical features
        self.categorical_features = [
            col for col in CATEGORICAL_FEATURES if col in df.columns
        ]
        self.numerical_features = [
            col for col in NUMERICAL_FEATURES if col in df.columns
        ]

        print(f"Categorical features: {self.categorical_features}")
        print(f"Numerical features: {self.numerical_features}")

        # Step 1: Encode categorical features
        for col in self.categorical_features:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            self.label_encoders[col] = le
            print(f"   Encoded '{col}': {list(le.classes_)}")

        # Step 2: Determine feature column order
        self.feature_columns = self.categorical_features + self.numerical_features

        # Step 3: Separate features and target
        X = df[self.feature_columns].values
        y = df[TARGET_COLUMN].values

        # Step 4: Scale all features (after encoding, all are numeric)
        X = self.scaler.fit_transform(X)

        print(f"Feature matrix shape: {X.shape}")
        print(f"Target vector shape: {y.shape}")
        print(f"   Target range: [{y.min():.2f}, {y.max():.2f}]")

        return X, y

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transform new data using fitted encoders/scaler (for inference).

        Args:
            df: DataFrame with feature columns.

        Returns:
            Transformed feature array.
        """
        df = df.copy()

        # Encode categorical features
        for col in self.categorical_features:
            if col in df.columns and col in self.label_encoders:
                le = self.label_encoders[col]
                # Handle unseen labels by mapping to the most common class
                df[col] = df[col].astype(str).apply(
                    lambda x: le.transform([x])[0]
                    if x in le.classes_
                    else 0  # Default to first class for unknown values
                )

        # Ensure correct column order
        X = df[self.feature_columns].values

        # Scale
        X = self.scaler.transform(X)

        return X

    def save(self) -> None:
        """Save fitted transformers to disk."""
        import os
        os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

        joblib.dump(self.label_encoders, LABEL_ENCODERS_FILE)
        joblib.dump(self.scaler, SCALER_FILE)
        joblib.dump(self.feature_columns, FEATURE_COLUMNS_FILE)

        print(f"Saved label encoders to: {LABEL_ENCODERS_FILE}")
        print(f"Saved scaler to: {SCALER_FILE}")
        print(f"Saved feature columns to: {FEATURE_COLUMNS_FILE}")

    @classmethod
    def load(cls) -> "FeatureEngineer":
        """Load a pre-fitted FeatureEngineer from saved artifacts."""
        engineer = cls()
        engineer.label_encoders = joblib.load(LABEL_ENCODERS_FILE)
        engineer.scaler = joblib.load(SCALER_FILE)
        engineer.feature_columns = joblib.load(FEATURE_COLUMNS_FILE)

        # Reconstruct categorical/numerical lists from saved columns
        engineer.categorical_features = [
            col for col in engineer.feature_columns if col in CATEGORICAL_FEATURES
        ]
        engineer.numerical_features = [
            col for col in engineer.feature_columns if col in NUMERICAL_FEATURES
        ]

        return engineer
