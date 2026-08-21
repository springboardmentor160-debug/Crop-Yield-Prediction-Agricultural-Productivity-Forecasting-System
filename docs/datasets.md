# Datasets

## 1. Crop Yield Dataset

* **Source**: Local repository dataset (`backend/data/raw/crop_yield_raw.csv`)
* **License**: Open Data (assumed from context)
* **Purpose**: Train a regression model to forecast agricultural yield in `hg/ha`.
* **Records**: 221
* **Features**: `Area`, `Item`, `Year`, `average_rain_fall_mm_per_year`, `avg_temp`. (Note: `pesticides_tonnes` was explicitly removed to prevent data leakage, as the application cannot realistically collect this from farmers without forcing them to guess).
* **Target**: `hg/ha_yield`
* **Preprocessing**: 
    - Missing environmental features are imputed using the mean.
    - Invalid physical measurements (e.g. negative rainfall, pH outside 0-14) are dropped.
    - Duplicates are removed.
    - Categorical features are One-Hot Encoded; Numerical are Standard Scaled.
    - Processed dataset is stored as `crop_yield_clean.csv`.
* **Model using it**: `YieldPredictionModel` (Random Forest Regressor)
* **Limitations**: The dataset is exceptionally small (221 records) and relies heavily on macro-level national features. Consequently, the resulting R² score is objectively low (~0.17).

## 2. Crop Recommendation Dataset

* **Source**: [Harvestify GitHub Repository](https://raw.githubusercontent.com/arzzahid66/Optimizing_Agricultural_Production/master/Crop_recommendation.csv)
* **License**: Public Domain / Open Source (common Kaggle dataset)
* **Purpose**: Train a multi-class classifier to recommend optimal crops based on soil and climate conditions.
* **Records**: 2200
* **Features**: `N` (Nitrogen), `P` (Phosphorus), `K` (Potassium), `temperature`, `humidity`, `ph`, `rainfall`.
* **Target**: `label` (Crop name, 22 classes)
* **Preprocessing**: None required for the dataset as provided. (Train/Test split applied).
* **Model using it**: `RecommendationModel` (Random Forest Classifier)
* **Limitations**: The dataset is highly synthetic/idealized, leading to an artificially high macro F1 score of ~0.99.

## 3. Agricultural Risk Dataset

* **Status**: **BLOCKED**
* **Reason**: An exhaustive search identified target Kaggle datasets (such as "Janatahack Crop Damage Classification" and "AI Powered Agriculture Risk"). However, due to execution environment constraints (Kaggle API requires an auth token, and `kagglehub` package installations failed due to a PyPI connection timeout), it was technically impossible to securely download the raw CSVs. 
* **Note**: In strict compliance with the project's "No Fake AI" policy, the missing data was documented as blocked, rather than manufacturing fake risk metrics or fabricating labels.
* **Recommended Next Step**: Provide a valid Kaggle API token or a direct mirror URL to unlock the Risk Assessment AI model.

## 4. Weather Data Source
* **Source**: Open-Meteo (API) & Geopy (Nominatim)
* **Purpose**: Live feature enrichment pipeline for ML inference based on Farm Coordinates.
