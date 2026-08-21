"""
YieldSense AI — Model Evaluator

Computes metrics, generates comparison tables, and saves evaluation reports.
"""

import json
import os
from typing import Any, Dict, List, Optional

import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from ml.utils.config import EVALUATION_REPORT_FILE, PLOTS_DIR


class ModelEvaluator:
    """Evaluates ML models and generates reports."""

    def __init__(self, feature_names: Optional[List[str]] = None):
        self.feature_names = feature_names or []

    def compute_metrics(
        self,
        model_name: str,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_train_true: np.ndarray,
        y_train_pred: np.ndarray,
        cv_scores: np.ndarray,
        model: Any,
    ) -> Dict[str, Any]:
        """
        Compute comprehensive evaluation metrics for a model.

        Returns:
            Dictionary with MAE, MSE, RMSE, R², CV scores, and feature importance.
        """
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        test_r2 = r2_score(y_true, y_pred)
        train_r2 = r2_score(y_train_true, y_train_pred)

        # Feature importance
        feature_importance = self._get_feature_importance(model)

        return {
            "model_name": model_name,
            "mae": float(mae),
            "mse": float(mse),
            "rmse": float(rmse),
            "test_r2": float(test_r2),
            "train_r2": float(train_r2),
            "cv_scores": [float(s) for s in cv_scores],
            "cv_mean": float(cv_scores.mean()),
            "cv_std": float(cv_scores.std()),
            "feature_importance": feature_importance,
        }

    def _get_feature_importance(self, model: Any) -> Dict[str, float]:
        """Extract feature importance from a trained model."""
        importance = {}

        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            for i, name in enumerate(self.feature_names):
                if i < len(importances):
                    importance[name] = float(importances[i])
        elif hasattr(model, "coef_"):
            coefficients = np.abs(model.coef_)
            for i, name in enumerate(self.feature_names):
                if i < len(coefficients):
                    importance[name] = float(coefficients[i])

        # Sort by importance descending
        if importance:
            importance = dict(
                sorted(importance.items(), key=lambda x: x[1], reverse=True)
            )

        return importance

    def save_comparison_report(self, results: Dict[str, Any]) -> None:
        """Save a full evaluation comparison report as JSON."""
        report = {}

        for name, res in results.items():
            metrics = res["metrics"]
            report[name] = {
                "mae": metrics["mae"],
                "mse": metrics["mse"],
                "rmse": metrics["rmse"],
                "test_r2": metrics["test_r2"],
                "train_r2": metrics["train_r2"],
                "cv_mean_r2": metrics["cv_mean"],
                "cv_std": metrics["cv_std"],
                "cv_scores": metrics["cv_scores"],
                "feature_importance": metrics["feature_importance"],
            }

        os.makedirs(os.path.dirname(EVALUATION_REPORT_FILE), exist_ok=True)
        with open(EVALUATION_REPORT_FILE, "w") as f:
            json.dump(report, f, indent=2)

        print(f"Evaluation report saved to: {EVALUATION_REPORT_FILE}")

        # Print comparison table
        self._print_comparison_table(report)

    def _print_comparison_table(self, report: dict) -> None:
        """Print a formatted comparison table to console."""
        print(f"\n{'='*80}")
        print("MODEL COMPARISON TABLE")
        print(f"{'='*80}")
        print(f"{'Model':<25} {'MAE':>8} {'RMSE':>8} {'R2 Test':>9} {'R2 Train':>9} {'CV R2':>8}")
        print(f"{'-'*80}")

        for name, metrics in report.items():
            print(
                f"{name:<25} "
                f"{metrics['mae']:>8.4f} "
                f"{metrics['rmse']:>8.4f} "
                f"{metrics['test_r2']:>9.4f} "
                f"{metrics['train_r2']:>9.4f} "
                f"{metrics['cv_mean_r2']:>8.4f}"
            )

        print(f"{'='*80}\n")

    def generate_plots(self, results: Dict[str, Any], y_test: np.ndarray) -> None:
        """Generate evaluation plots and save as PNG."""
        try:
            import matplotlib
            matplotlib.use("Agg")  # Non-interactive backend
            import matplotlib.pyplot as plt
            import seaborn as sns
        except ImportError:
            print("Warning: matplotlib/seaborn not available - skipping plots")
            return

        os.makedirs(PLOTS_DIR, exist_ok=True)
        sns.set_theme(style="whitegrid")

        # 1. Model Comparison Bar Chart
        self._plot_model_comparison(results, plt)

        # 2. Actual vs Predicted (best model)
        self._plot_actual_vs_predicted(results, y_test, plt)

        # 3. Feature Importance (best model)
        self._plot_feature_importance(results, plt)

        print(f"Plots saved to: {PLOTS_DIR}")

    def _plot_model_comparison(self, results: dict, plt) -> None:
        """Bar chart comparing R2 scores across models."""
        names = list(results.keys())
        r2_scores = [results[n]["metrics"]["test_r2"] for n in names]
        cv_scores = [results[n]["metrics"]["cv_mean"] for n in names]

        fig, ax = plt.subplots(figsize=(10, 6))
        x = np.arange(len(names))
        width = 0.35

        bars1 = ax.bar(x - width / 2, r2_scores, width, label="Test R2", color="#16a34a")
        bars2 = ax.bar(x + width / 2, cv_scores, width, label="CV R2 (mean)", color="#0891b2")

        ax.set_xlabel("Model")
        ax.set_ylabel("R2 Score")
        ax.set_title("Model Comparison - R2 Scores")
        ax.set_xticks(x)
        ax.set_xticklabels(names, rotation=15, ha="right")
        ax.legend()
        ax.set_ylim(0, 1.1)

        for bar in bars1:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                    f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=9)
        for bar in bars2:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                    f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=9)

        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, "model_comparison.png"), dpi=150)
        plt.close()

    def _plot_actual_vs_predicted(self, results: dict, y_test: np.ndarray, plt) -> None:
        """Scatter plot of actual vs predicted for the best model."""
        # Find best model
        best_name = max(results, key=lambda n: results[n]["metrics"]["test_r2"])
        y_pred = results[best_name]["y_pred_test"]

        fig, ax = plt.subplots(figsize=(8, 8))
        ax.scatter(y_test, y_pred, alpha=0.7, color="#16a34a", edgecolors="white", s=80)

        # Perfect prediction line
        min_val = min(y_test.min(), y_pred.min())
        max_val = max(y_test.max(), y_pred.max())
        ax.plot([min_val, max_val], [min_val, max_val], "r--", linewidth=2, label="Perfect Prediction")

        ax.set_xlabel("Actual Yield (tons/ha)")
        ax.set_ylabel("Predicted Yield (tons/ha)")
        ax.set_title(f"Actual vs Predicted - {best_name}")
        ax.legend()

        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, "actual_vs_predicted.png"), dpi=150)
        plt.close()

    def _plot_feature_importance(self, results: dict, plt) -> None:
        """Horizontal bar chart of feature importance for the best model."""
        best_name = max(results, key=lambda n: results[n]["metrics"]["test_r2"])
        importance = results[best_name]["metrics"]["feature_importance"]

        if not importance:
            return

        features = list(importance.keys())
        values = list(importance.values())

        fig, ax = plt.subplots(figsize=(10, 6))
        colors = plt.cm.Greens(np.linspace(0.4, 0.9, len(features)))
        ax.barh(features[::-1], values[::-1], color=colors[::-1])
        ax.set_xlabel("Importance")
        ax.set_title(f"Feature Importance - {best_name}")

        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, "feature_importance.png"), dpi=150)
        plt.close()
