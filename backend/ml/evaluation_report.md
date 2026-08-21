# 📊 YieldSense AI — Final ML Model Evaluation Report

**Evaluation Date:** 2026-08-14 20:58:27 UTC  
**Evaluation Scope:** Unseen held-out test dataset (20% split)

---

## 1. Crop Yield Regressor (Regression Model)

- **Model Name:** KNN Regressor (tuned, k=1)
- **Dataset:** `yield_df_processed.csv` (FAO agricultural yield data)
- **Total Records:** 25,932 records
- **Train Split (80%):** 20,745 records
- **Test Split (20%):** 5,187 records
- **Features Used (123 total):** `Year`, `average_rain_fall_mm_per_year`, `pesticides_tonnes`, `avg_temp`, plus One-Hot Encoded `Item` and `Area` columns.
- **Evaluation Metrics (on unseen test data):**
  - **R² Score:** `0.9860` (98.60%)
  - **Mean Absolute Error (MAE):** `4140.23` hg/ha (0.4140 tons/ha)
  - **Root Mean Squared Error (RMSE):** `10090.20` hg/ha (1.0090 tons/ha)

---

## 2. Crop Recommendation Classifier (Classification Model)

- **Model Name:** Random Forest Classifier (n_estimators=100)
- **Dataset:** `Crop_recommendation_processed.csv`
- **Total Records:** 2,200 records
- **Train Split (80%):** 1,760 records
- **Test Split (20%):** 440 records
- **Features Used (7 total):** `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall`
- **Evaluation Metrics (on unseen test data):**
  - **Accuracy:** `0.9932` (99.32%)
  - **Precision (Weighted):** `0.9937`
  - **Recall (Weighted):** `0.9932`
  - **F1-Score (Weighted):** `0.9932`

---

## 3. Physical Boundary Safety Overrides

In addition to pure ML inference, the system implements deterministic agronomic boundary overrides:
- Severe water deficit / zero rainfall → Yield set to `0.0 tons/ha`
- Extreme temperature stress (< 0°C or > 48°C) → Yield set to `0.0 tons/ha`
- Severely degraded soil pH (< 3.5 or > 9.5) → Yield set to `0.0 tons/ha`
- Severe NPK nutrient depletion → Yield set to `0.0 tons/ha`
