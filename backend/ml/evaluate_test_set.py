"""
YieldSense AI — Final ML Model Validation Script (Week 7)

Evaluates trained classification and regression models on held-out test data (20% split).
Calculates MAE, RMSE, R² for regression and Accuracy, Precision, Recall, F1 for classification.
Generates backend/ml/evaluation_report.md.
"""

import json
import os
import time
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score
)

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "datasets" / "processed"
SAVED_MODELS_DIR = BASE_DIR / "ml" / "models" / "saved"
REPORT_MD_PATH = BASE_DIR / "ml" / "evaluation_report.md"

def evaluate_models():
    print("=" * 60)
    print("RUNNING FINAL ML MODEL EVALUATION ON HELD-OUT TEST DATA")
    print("=" * 60)

    # 1. Classification Model Evaluation (Crop Recommendation)
    crop_path = PROCESSED_DIR / "Crop_recommendation_processed.csv"
    df_crop = pd.read_csv(crop_path)
    X_crop = df_crop[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y_crop = df_crop['label_encoded']
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X_crop, y_crop, test_size=0.2, random_state=42
    )

    crop_scaler = joblib.load(SAVED_MODELS_DIR / "crop_scaler.joblib")
    crop_model = joblib.load(SAVED_MODELS_DIR / "crop_best_model.joblib")
    
    X_test_c_scaled = crop_scaler.transform(X_test_c)
    y_pred_c = crop_model.predict(X_test_c_scaled)

    c_acc = accuracy_score(y_test_c, y_pred_c)
    c_prec = precision_score(y_test_c, y_pred_c, average='weighted', zero_division=0)
    c_rec = recall_score(y_test_c, y_pred_c, average='weighted', zero_division=0)
    c_f1 = f1_score(y_test_c, y_pred_c, average='weighted', zero_division=0)

    print(f"\n[Classification: Crop Recommendation Model]")
    print(f"Algorithm: {type(crop_model).__name__}")
    print(f"Total Dataset Records: {len(df_crop)}")
    print(f"Train Records: {len(X_train_c)} | Test Records: {len(X_test_c)}")
    print(f"Accuracy:  {c_acc:.4f} ({c_acc*100:.2f}%)")
    print(f"Precision: {c_prec:.4f}")
    print(f"Recall:    {c_rec:.4f}")
    print(f"F1-Score:  {c_f1:.4f}")

    # 2. Regression Model Evaluation (Crop Yield Prediction)
    yield_path = PROCESSED_DIR / "yield_df_processed.csv"
    df_yield = pd.read_csv(yield_path)
    X_yield = df_yield.drop(columns=['hg/ha_yield'])
    y_yield = df_yield['hg/ha_yield']

    X_train_y, X_test_y, y_train_y, y_test_y = train_test_split(
        X_yield, y_yield, test_size=0.2, random_state=42
    )

    numerical_cols = ['Year', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp']
    yield_scaler = joblib.load(SAVED_MODELS_DIR / "yield_scaler.joblib")
    yield_model = joblib.load(SAVED_MODELS_DIR / "yield_best_model.joblib")

    X_test_y_scaled = X_test_y.copy()
    X_test_y_scaled[numerical_cols] = yield_scaler.transform(X_test_y[numerical_cols])

    y_pred_y = yield_model.predict(X_test_y_scaled)

    y_mae = mean_absolute_error(y_test_y, y_pred_y)
    y_mse = mean_squared_error(y_test_y, y_pred_y)
    y_rmse = np.sqrt(y_mse)
    y_r2 = r2_score(y_test_y, y_pred_y)

    print(f"\n[Regression: Crop Yield Prediction Model]")
    print(f"Algorithm: {type(yield_model).__name__}")
    print(f"Total Dataset Records: {len(df_yield)}")
    print(f"Train Records: {len(X_train_y)} | Test Records: {len(X_test_y)}")
    print(f"R² Score: {y_r2:.4f} ({y_r2*100:.2f}%)")
    print(f"MAE:      {y_mae:.2f} hg/ha ({y_mae/10000:.4f} tons/ha)")
    print(f"RMSE:     {y_rmse:.2f} hg/ha ({y_rmse/10000:.4f} tons/ha)")

    # 3. Generate Markdown Evaluation Report
    report_md = f"""# 📊 YieldSense AI — Final ML Model Evaluation Report

**Evaluation Date:** {time.strftime("%Y-%m-%d %H:%M:%S UTC")}  
**Evaluation Scope:** Unseen held-out test dataset (20% split)

---

## 1. Crop Yield Regressor (Regression Model)

- **Model Name:** KNN Regressor (tuned, k=1)
- **Dataset:** `yield_df_processed.csv` (FAO agricultural yield data)
- **Total Records:** {len(df_yield):,} records
- **Train Split (80%):** {len(X_train_y):,} records
- **Test Split (20%):** {len(X_test_y):,} records
- **Features Used (123 total):** `Year`, `average_rain_fall_mm_per_year`, `pesticides_tonnes`, `avg_temp`, plus One-Hot Encoded `Item` and `Area` columns.
- **Evaluation Metrics (on unseen test data):**
  - **R² Score:** `{y_r2:.4f}` ({y_r2*100:.2f}%)
  - **Mean Absolute Error (MAE):** `{y_mae:.2f}` hg/ha ({y_mae/10000:.4f} tons/ha)
  - **Root Mean Squared Error (RMSE):** `{y_rmse:.2f}` hg/ha ({y_rmse/10000:.4f} tons/ha)

---

## 2. Crop Recommendation Classifier (Classification Model)

- **Model Name:** Random Forest Classifier (n_estimators=100)
- **Dataset:** `Crop_recommendation_processed.csv`
- **Total Records:** {len(df_crop):,} records
- **Train Split (80%):** {len(X_train_c):,} records
- **Test Split (20%):** {len(X_test_c):,} records
- **Features Used (7 total):** `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall`
- **Evaluation Metrics (on unseen test data):**
  - **Accuracy:** `{c_acc:.4f}` ({c_acc*100:.2f}%)
  - **Precision (Weighted):** `{c_prec:.4f}`
  - **Recall (Weighted):** `{c_rec:.4f}`
  - **F1-Score (Weighted):** `{c_f1:.4f}`

---

## 3. Physical Boundary Safety Overrides

In addition to pure ML inference, the system implements deterministic agronomic boundary overrides:
- Severe water deficit / zero rainfall → Yield set to `0.0 tons/ha`
- Extreme temperature stress (< 0°C or > 48°C) → Yield set to `0.0 tons/ha`
- Severely degraded soil pH (< 3.5 or > 9.5) → Yield set to `0.0 tons/ha`
- Severe NPK nutrient depletion → Yield set to `0.0 tons/ha`
"""

    with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(report_md)

    print(f"\nSaved evaluation report to: {REPORT_MD_PATH}")
    print("=" * 60)

if __name__ == "__main__":
    evaluate_models()
