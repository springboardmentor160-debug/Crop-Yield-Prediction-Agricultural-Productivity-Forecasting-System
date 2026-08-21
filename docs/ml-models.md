# Machine Learning Models

## 1. Yield Prediction Model

* **Problem**: Regression
* **Dataset**: `crop_yield_clean.csv`
* **Features**: `Area`, `Item`, `Year`, `average_rain_fall_mm_per_year`, `avg_temp`. (Note: `pesticides_tonnes` removed to prevent leakage and avoid fabrication).
* **Target**: `hg/ha_yield`
* **Preprocessing**: 
    - `StandardScaler` for numerical features.
    - `OneHotEncoder` for categorical features (`Area`, `Item`).
* **Algorithm Candidates**: Linear Regression, RandomForestRegressor, XGBoost
* **Selected Algorithm**: `RandomForestRegressor(n_estimators=100)` due to solid baseline performance on non-linear agricultural data without requiring exhaustive hyperparameter tuning.
* **Training Procedure**: 80/20 train-test split using a `scikit-learn` Pipeline with `ColumnTransformer`.
* **Evaluation Metrics**:
    - **MAE**: 2720.83
    - **RMSE**: 3664.79
    - **R²**: 0.1771
* **Known Limitations**: The dataset relies heavily on macro-level national averages and only contains 221 records. R² is objectively low (0.1771) because national aggregations cannot accurately predict micro-farm level dynamics. Rather than faking the data, this model remains as the genuine implementation.

## 2. Crop Recommendation Model

* **Problem**: Multi-class Classification
* **Dataset**: `crop_recommendation.csv`
* **Features**: `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall`.
* **Target**: `label` (22 different crops)
* **Preprocessing**: None. (Passed directly to tree ensemble).
* **Algorithm Candidates**: Logistic Regression, Decision Tree, RandomForestClassifier
* **Selected Algorithm**: `RandomForestClassifier(n_estimators=100)`
* **Training Procedure**: 80/20 train-test split.
* **Evaluation Metrics**:
    - **Accuracy**: 0.9932
    - **Precision**: 0.9937
    - **Recall**: 0.9932
    - **F1 Score**: 0.9932
* **Known Limitations**: The dataset is highly idealized and synthetic-feeling (0 exact duplicates found in audit). Real-world environments have overlapping suitability for crops that isn't cleanly separable.

## 3. Agricultural Risk Model

* **Status**: **BLOCKED**
* **Reason**: An exhaustive search identified target Kaggle datasets (such as "Janatahack Crop Damage Classification" and "AI Powered Agriculture Risk"). However, due to execution environment constraints (Kaggle API requires an auth token, and `kagglehub` package installations failed due to a PyPI connection timeout), it was technically impossible to securely download the raw CSVs into the environment. Rather than manufacturing fake risk metrics or fabricating labels, the model was officially declared blocked.
