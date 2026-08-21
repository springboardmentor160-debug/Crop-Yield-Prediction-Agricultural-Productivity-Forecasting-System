from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

ML_ROOT = Path(__file__).resolve().parents[1]

DATASET = (
    ML_ROOT
    / "data"
    / "processed"
    / "yieldsense_ml_dataset.csv"
)

ARTIFACTS = ML_ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)

print("=" * 60)
print("YieldSense AI - Feature Engineering")
print("=" * 60)

df = pd.read_csv(DATASET)

# -----------------------------
# Target
# -----------------------------

y = np.log1p(df["Yield"])

# -----------------------------
# Features
# -----------------------------

X = df.drop(columns=["Yield"])

categorical_features = [
    "Crop",
    "Season",
    "State",
]

numeric_features = [
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

print()

print("Categorical Features")
print("--------------------")
print(categorical_features)

print()

print("Numeric Features")
print("----------------")
print(numeric_features)

# -----------------------------
# Pipelines
# -----------------------------

numeric_pipeline = Pipeline(
    [
        (
            "imputer",
            SimpleImputer(strategy="median"),
        ),
        (
            "scaler",
            StandardScaler(),
        ),
    ]
)

categorical_pipeline = Pipeline(
    [
        (
            "imputer",
            SimpleImputer(strategy="most_frequent"),
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
        ),
    ]
)

preprocessor = ColumnTransformer(
    [
        (
            "numeric",
            numeric_pipeline,
            numeric_features,
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features,
        ),
    ]
)

print()

print("Building preprocessing pipeline...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
)

preprocessor.fit(X_train)

joblib.dump(
    preprocessor,
    ARTIFACTS / "preprocessor.joblib",
)

joblib.dump(
    numeric_features,
    ARTIFACTS / "numeric_features.joblib",
)

joblib.dump(
    categorical_features,
    ARTIFACTS / "categorical_features.joblib",
)

print()

print("Training Samples :", len(X_train))
print("Testing Samples  :", len(X_test))

print()

print("Pipeline Saved Successfully")

print()

print("Artifacts")

print(ARTIFACTS / "preprocessor.joblib")
print(ARTIFACTS / "numeric_features.joblib")
print(ARTIFACTS / "categorical_features.joblib")