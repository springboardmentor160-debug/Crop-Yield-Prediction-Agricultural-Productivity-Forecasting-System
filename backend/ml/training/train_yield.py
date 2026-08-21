import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
import joblib
import os
import time

def train():
    print("Loading yield dataset...")
    df = pd.read_csv("backend/data/processed/crop_yield_clean.csv")
    
    # We will predict hg/ha_yield. 
    # REMOVED: 'pesticides_tonnes' because the application cannot realistically collect it from the farmer
    # without making them guess, and imputing it with a country median causes leakage/fabrication.
    X = df[['Area', 'Item', 'Year', 'average_rain_fall_mm_per_year', 'avg_temp']]
    y = df['hg/ha_yield']
    
    # Train-test split (Note: doing random split here, though grouped by year would be better for time-series)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Preprocessor
    categorical_features = ['Area', 'Item']
    numerical_features = ['Year', 'average_rain_fall_mm_per_year', 'avg_temp']
    
    # Only fit preprocessing on training data to prevent data leakage
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    # Pipeline
    model = Pipeline(steps=[('preprocessor', preprocessor),
                            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, max_depth=15))])
    
    print("Training RandomForestRegressor...")
    start_time = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start_time
    
    print("Evaluating...")
    start_time = time.time()
    y_pred = model.predict(X_test)
    inference_time = time.time() - start_time
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R²: {r2:.4f}")
    print(f"Training Time: {train_time:.2f}s")
    print(f"Inference Time for {len(X_test)} samples: {inference_time:.4f}s")
    
    os.makedirs("backend/ml/models", exist_ok=True)
    joblib.dump(model, "backend/ml/models/yield_model.joblib")
    print("Yield Model saved to backend/ml/models/yield_model.joblib")

if __name__ == "__main__":
    train()
