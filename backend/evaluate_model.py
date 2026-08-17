import json
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "data", "processed", "crop_yield_model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "crop_yield_clean.csv")

def evaluate_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Model file not found at {MODEL_PATH}. Please run train_model.py first.")
        return

    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    feature_columns = artifact.get("feature_columns", ["avg_temp", "average_rain_fall_mm_per_year", "ph"])
    target_column = artifact.get("target_column", "yield_kg_per_ha")

    if not os.path.exists(DATA_PATH):
        print(f"Data file not found at {DATA_PATH}.")
        return

    df = pd.read_csv(DATA_PATH)
    
    from train_model import _first_existing_column
    for col in feature_columns:
        if col not in df.columns:
            candidates = [col]
            if col == "avg_temp": candidates.extend(["Temperature_C", "temperature", "average_temperature"])
            elif col == "average_rain_fall_mm_per_year": candidates.extend(["Rainfall_mm", "rainfall", "rainfall_mm"])
            elif col == "ph": candidates.extend(["Soil_pH", "soil_ph", "ph_value"])
            
            alt = _first_existing_column(df.columns, candidates)
            if alt:
                df[col] = df[alt]
            else:
                raise KeyError(f"Feature column '{col}' not found in dataset columns: {list(df.columns)}")
                
    if target_column not in df.columns:
        alt_target = _first_existing_column(df.columns, [target_column, "hg/ha_yield", "Yield_Tons", "yield_amount"])
        if alt_target:
            df[target_column] = df[alt_target]
        else:
            raise KeyError(f"Target column '{target_column}' not found in dataset columns: {list(df.columns)}")

    X = df[feature_columns]
    y = df[target_column]

    preds = model.predict(X)
    mae = mean_absolute_error(y, preds)
    rmse = np.sqrt(mean_squared_error(y, preds))

    print("=== MODEL EVALUATION REPORT ===")
    print(f"Model Type: {artifact.get('model_type', model.__class__.__name__)}")
    print(f"Total Test Instances Evaluated: {len(y)}")
    print(f"MAE  : {mae:.2f} kg/ha")
    print(f"RMSE : {rmse:.2f} kg/ha")

    if hasattr(model, "feature_importances_"):
        print("\nFeature Importances:")
        for col, imp in zip(feature_columns, model.feature_importances_):
            print(f"  - {col}: {imp:.4f}")

    print("\nSample Predictions vs Actual:")
    sample_df = pd.DataFrame({"Actual": y[:5], "Predicted": preds[:5]})
    print(sample_df.to_string(index=False))

if __name__ == "__main__":
    evaluate_model()
