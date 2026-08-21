"""
YieldSense AI — Model Trainer

Trains multiple regression models, compares them, and saves the best one.
"""

import os
import json
from typing import Dict, Any, Tuple

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, train_test_split
from xgboost import XGBRegressor

from ml.utils.config import (
    MODEL_CONFIGS,
    RANDOM_STATE,
    TEST_SIZE,
    CV_FOLDS,
    BEST_MODEL_FILE,
    MODEL_METADATA_FILE,
    SAVED_MODELS_DIR,
)
from ml.evaluation.evaluator import ModelEvaluator


def _build_model(name: str, params: dict):
    """Instantiate a model by name with given parameters."""
    model_map = {
        "Random Forest": RandomForestRegressor,
        "XGBoost": XGBRegressor,
        "Gradient Boosting": GradientBoostingRegressor,
        "Linear Regression": LinearRegression,
    }

    model_class = model_map.get(name)
    if model_class is None:
        raise ValueError(f"Unknown model: {name}")

    return model_class(**params)


def train_and_compare(
    X: np.ndarray,
    y: np.ndarray,
    feature_names: list,
) -> Tuple[Any, Dict[str, Any]]:
    """
    Train multiple models, evaluate each, compare, and return the best.

    Args:
        X: Feature matrix (already encoded and scaled).
        y: Target array.
        feature_names: List of feature column names.

    Returns:
        Tuple of (best_model, all_results_dict).
    """
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    print(f"\n{'='*60}")
    print("MODEL TRAINING")
    print(f"{'='*60}")
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set:     {X_test.shape[0]} samples")
    print(f"Features:     {X.shape[1]}")
    print(f"CV Folds:     {CV_FOLDS}")
    print(f"{'='*60}\n")

    evaluator = ModelEvaluator(feature_names=feature_names)
    results = {}
    best_model = None
    best_score = -np.inf
    best_name = ""

    for name, params in MODEL_CONFIGS.items():
        print(f"Training: {name}...")

        model = _build_model(name, params)
        model.fit(X_train, y_train)

        # Predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)

        # Cross-validation
        cv_scores = cross_val_score(
            model, X, y, cv=min(CV_FOLDS, len(y)), scoring="r2"
        )

        # Evaluate
        metrics = evaluator.compute_metrics(
            model_name=name,
            y_true=y_test,
            y_pred=y_pred_test,
            y_train_true=y_train,
            y_train_pred=y_pred_train,
            cv_scores=cv_scores,
            model=model,
        )

        results[name] = {
            "model": model,
            "metrics": metrics,
            "y_pred_test": y_pred_test,
        }

        # Track best by test R2
        test_r2 = metrics["test_r2"]
        print(f"   R2={test_r2:.4f}, MAE={metrics['mae']:.4f}, RMSE={metrics['rmse']:.4f}, CV_R2={metrics['cv_mean']:.4f}")

        if test_r2 > best_score:
            best_score = test_r2
            best_model = model
            best_name = name

    print(f"\n{'='*60}")
    print(f"Best Model: {best_name} (R2 = {best_score:.4f})")
    print(f"{'='*60}\n")

    # Save best model
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    joblib.dump(best_model, BEST_MODEL_FILE)
    print(f"Best model saved to: {BEST_MODEL_FILE}")

    # Save metadata
    metadata = {
        "best_model": best_name,
        "test_r2": float(best_score),
        "test_mae": float(results[best_name]["metrics"]["mae"]),
        "test_rmse": float(results[best_name]["metrics"]["rmse"]),
        "cv_mean_r2": float(results[best_name]["metrics"]["cv_mean"]),
        "training_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "num_features": int(X.shape[1]),
        "feature_names": feature_names,
        "all_models_r2": {
            name: float(res["metrics"]["test_r2"]) for name, res in results.items()
        },
    }

    with open(MODEL_METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model metadata saved to: {MODEL_METADATA_FILE}")

    # Generate evaluation report and plots
    evaluator.save_comparison_report(results)
    evaluator.generate_plots(results, y_test)

    return best_model, results
