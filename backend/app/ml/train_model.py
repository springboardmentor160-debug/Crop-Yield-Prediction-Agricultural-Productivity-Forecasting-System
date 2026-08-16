"""
YieldSense AI - ML Model Training Script
Trains XGBoost model on crop yield dataset
Run: python -m app.ml.train_model
"""
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

def train():
    print("=" * 50)
    print("YieldSense AI - Model Training")
    print("=" * 50)

    # Load dataset - checks your actual file names
    data_path = "data/processed/cleaned_crop_yield.csv"
    if not os.path.exists(data_path):
        data_path = "data/raw/kaggle_crop_yield.csv"
        if not os.path.exists(data_path):
            data_path = "data/processed/crop_yield_clean.csv"
            if not os.path.exists(data_path):
                data_path = "data/raw/crop_yield_raw.csv"
                if not os.path.exists(data_path):
                    print("ERROR: No dataset found!")
                    print("Files checked:")
                    print("  - data/processed/cleaned_crop_yield.csv")
                    print("  - data/raw/kaggle_crop_yield.csv")
                    return

    print(f"Loading from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")

    # Detect and rename columns
    col_map = {}
    for col in df.columns:
        cl = col.lower().strip()
        if "yield" in cl or "hg/ha" in cl:
            col_map[col] = "yield"
        elif "rain" in cl:
            col_map[col] = "rainfall"
        elif "temp" in cl:
            col_map[col] = "temperature"
        elif "item" in cl or (cl == "crop"):
            col_map[col] = "crop_type"
        elif cl == "area":
            col_map[col] = "country"
        elif "pesticide" in cl:
            col_map[col] = "pesticides"
        elif "year" in cl:
            col_map[col] = "year"
        elif col.strip() == "N":
            col_map[col] = "nitrogen"
        elif col.strip() == "P":
            col_map[col] = "phosphorus"
        elif col.strip() == "K":
            col_map[col] = "potassium"
        elif "ph" in cl:
            col_map[col] = "soil_ph"
        elif "humid" in cl:
            col_map[col] = "humidity"
        elif "label" in cl:
            col_map[col] = "crop_type"

    df.rename(columns=col_map, inplace=True)
    print(f"Renamed columns: {list(df.columns)}")

    # Check yield column exists
    if "yield" not in df.columns:
        print("ERROR: Could not find yield column!")
        print("Available columns:", list(df.columns))
        return

    # Drop missing target rows
    df.dropna(subset=["yield"], inplace=True)

    # Encode crop type
    le = LabelEncoder()
    if "crop_type" in df.columns:
        df["crop_type"] = df["crop_type"].astype(str)
        df["crop_encoded"] = le.fit_transform(df["crop_type"])
        print(f"Crops found: {list(le.classes_)}")
    else:
        df["crop_encoded"] = 0
        le = None

    # Select available features
    feature_candidates = [
        "crop_encoded", "rainfall", "temperature", "humidity",
        "soil_ph", "nitrogen", "phosphorus", "potassium",
        "pesticides", "year"
    ]
    features = [f for f in feature_candidates if f in df.columns]
    print(f"Features used: {features}")

    if len(features) < 2:
        print("ERROR: Not enough features found!")
        print("Available columns:", list(df.columns))
        return

    # Fill missing values with mean
    for f in features:
        if df[f].isnull().sum() > 0:
            df[f].fillna(df[f].mean(), inplace=True)

    X = df[features]
    y = df["yield"]

    # Convert hg/ha to tons/ha if needed
    if y.mean() > 1000:
        y = y / 10000
        print(f"Converted yield from hg/ha to tons/ha")

    print(f"Target yield range: {y.min():.2f} - {y.max():.2f} tons/ha")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

    # Train XGBoost
    print("\nTraining XGBoost model...")
    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n" + "=" * 50)
    print("MODEL PERFORMANCE:")
    print(f"  MAE  (Mean Absolute Error): {mae:.4f} tons/ha")
    print(f"  RMSE (Root Mean Sq Error):  {rmse:.4f} tons/ha")
    print(f"  R2   (Accuracy Score):      {r2:.4f} ({r2*100:.1f}%)")
    print("=" * 50)

    # Save everything
    os.makedirs("app/ml", exist_ok=True)
    joblib.dump(model, "app/ml/model.pkl")
    joblib.dump(le, "app/ml/label_encoder.pkl")
    joblib.dump(features, "app/ml/features.pkl")

    metrics = {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "accuracy_percent": round(r2 * 100, 1),
        "features": features,
        "n_crops": len(le.classes_) if le else 0,
        "crops": list(le.classes_) if le else [],
        "training_samples": len(X_train),
    }
    joblib.dump(metrics, "app/ml/metrics.pkl")

    print(f"\nModel saved:   app/ml/model.pkl")
    print(f"Encoder saved: app/ml/label_encoder.pkl")
    print(f"Features saved: app/ml/features.pkl")
    print(f"Metrics saved: app/ml/metrics.pkl")
    print("\nTraining complete!")

if __name__ == "__main__":
    train()