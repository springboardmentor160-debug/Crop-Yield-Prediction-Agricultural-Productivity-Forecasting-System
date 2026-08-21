"""
YieldSense AI — ML Configuration

Central configuration for the ML pipeline. All paths, hyperparameters,
and feature definitions are defined here.
"""

import os

# ============================================================
# Paths
# ============================================================
# Going up 3 levels from backend/ml/utils/config.py to backend/
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ML_DIR = os.path.join(BACKEND_ROOT, "ml")

RAW_DATA_PATH = os.path.join(BACKEND_ROOT, "datasets", "raw", "sample_crop_data.csv")
PROCESSED_DATA_PATH = os.path.join(BACKEND_ROOT, "datasets", "processed", "processed_crop_data.csv")

SAVED_MODELS_DIR = os.path.join(ML_DIR, "models", "saved")
PLOTS_DIR = os.path.join(SAVED_MODELS_DIR, "plots")

# Crop Recommendation Model Artifacts
CROP_MODEL_FILE = os.path.join(SAVED_MODELS_DIR, "crop_best_model.joblib")
CROP_SCALER_FILE = os.path.join(SAVED_MODELS_DIR, "crop_scaler.joblib")
CROP_METADATA_FILE = os.path.join(SAVED_MODELS_DIR, "crop_model_metadata.json")

# Yield Prediction Model Artifacts
YIELD_MODEL_FILE = os.path.join(SAVED_MODELS_DIR, "yield_best_model.joblib")
YIELD_SCALER_FILE = os.path.join(SAVED_MODELS_DIR, "yield_scaler.joblib")
YIELD_FEATURE_COLUMNS_FILE = os.path.join(SAVED_MODELS_DIR, "yield_feature_columns.joblib")
YIELD_METADATA_FILE = os.path.join(SAVED_MODELS_DIR, "yield_model_metadata.json")

# ============================================================
# Dataset Schema
# ============================================================
# Target variable
TARGET_COLUMN = "yield"

# Categorical features (will be label-encoded)
CATEGORICAL_FEATURES = ["crop", "season", "state"]

# Numerical features used for prediction
NUMERICAL_FEATURES = [
    "area", "production", "annual_rainfall", "fertilizer_usage",
    "pesticide_usage", "temperature", "soil_ph",
    "nitrogen", "phosphorus", "potassium",
]

# All feature columns (categorical + numerical, excluding target)
ALL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

# Required columns in the raw dataset
REQUIRED_COLUMNS = ALL_FEATURES + [TARGET_COLUMN]

# ============================================================
# Model Hyperparameters
# ============================================================
RANDOM_STATE = 42
TEST_SIZE = 0.2
CV_FOLDS = 5

MODEL_CONFIGS = {
    "Random Forest": {
        "n_estimators": 100,
        "max_depth": None,
        "min_samples_split": 2,
        "min_samples_leaf": 1,
        "random_state": RANDOM_STATE,
    },
    "XGBoost": {
        "n_estimators": 100,
        "max_depth": 6,
        "learning_rate": 0.1,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "random_state": RANDOM_STATE,
    },
    "Gradient Boosting": {
        "n_estimators": 100,
        "max_depth": 5,
        "learning_rate": 0.1,
        "min_samples_split": 2,
        "random_state": RANDOM_STATE,
    },
    "Linear Regression": {},
}
