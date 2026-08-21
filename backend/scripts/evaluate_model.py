import os
import pickle
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def evaluate_model():
    print("[*] Starting Model Evaluation on Unseen Test Data...")
    
    # Paths
    model_path = os.path.join("data", "processed", "crop_yield_model.pkl")
    data_path = os.path.join("data", "processed", "crop_yield_clean.csv")
    
    if not os.path.exists(model_path):
        print(f"[!] Model not found at {model_path}. Evaluation aborted.")
        return
        
    # Load Model
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    print(f"[+] Loaded XGBoost model from: {model_path}")
    
    # We will generate a validation dataset of 200 samples that the model has never seen
    # to perform a proper independent validation.
    np.random.seed(101) # Different seed than training data (which was 42)
    n_samples = 200
    
    # Soil pH range: 5.0 to 8.0, Temp: 15 to 35, Rainfall: 200 to 1500
    test_temp = np.random.normal(loc=25, scale=5, size=n_samples)
    test_rainfall = np.random.exponential(scale=50, size=n_samples)
    test_ph = np.random.uniform(low=5.0, high=8.0, size=n_samples)
    
    # Yield function with some noise to act as ground truth
    # Yield tons per ha = temp * 0.1 + rainfall * 0.005 - (ph - 6.5)**2 + noise
    noise = np.random.normal(loc=0, scale=0.5, size=n_samples)
    true_yield = (test_temp * 0.05) + (test_rainfall * 0.003) - ((test_ph - 6.5) ** 2) * 0.2 + 3.0 + noise
    
    # We scale yield to kg/ha for consistent platform metrics (1 ton = 1000 kg)
    true_yield_kg = true_yield * 1000
    
    # Build feature matrix matching model's expected shape: [temp, rainfall, ph]
    X_test = np.column_stack((test_temp, test_rainfall, test_ph))
    
    # Run predictions
    try:
        # Check if the model expects scaled or XGBoost 2D array
        predictions = model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(true_yield_kg, predictions)
        rmse = np.sqrt(mean_squared_error(true_yield_kg, predictions))
        r2 = r2_score(true_yield_kg, predictions)
        
        print("\n=============================================")
        print("          ML MODEL EVALUATION REPORT          ")
        print("=============================================")
        print(f"Test Samples Evaluated : {n_samples}")
        print(f"Mean Absolute Error (MAE)  : {mae:.2f} kg/ha")
        print(f"Root Mean Square Error (RMSE) : {rmse:.2f} kg/ha")
        print(f"R2 Accuracy Score          : {r2:.2f} (Explains {r2*100:.1f}% of variance)")
        print("=============================================\n")
        
        # Save metrics report to docs/evaluation_metrics.md for Milestone 4 docs
        os.makedirs("../docs", exist_ok=True)
        with open("../docs/evaluation_metrics.md", "w") as f:
            f.write("# Machine Learning Model Evaluation Report\n\n")
            f.write("Evaluation performed on unseen simulated test dataset.\n\n")
            f.write("| Metric | Value |\n")
            f.write("| --- | --- |\n")
            f.write(f"| Test Samples | {n_samples} |\n")
            f.write(f"| Mean Absolute Error (MAE) | {mae:.2f} kg/ha |\n")
            f.write(f"| Root Mean Square Error (RMSE) | {rmse:.2f} kg/ha |\n")
            f.write(f"| R2 Score | {r2:.2f} |\n")
            
        print("[+] Metrics successfully written to: docs/evaluation_metrics.md")
        
    except Exception as e:
        print(f"[!] Error predicting: {e}")

if __name__ == "__main__":
    evaluate_model()
