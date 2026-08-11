# preprocess.py - Standard Production Pipeline for Tabular ML Processing
import pandas as pd
import numpy as np
import os

def run_agri_preprocessing_pipeline(input_csv_path: str, output_csv_path: str):
    print(f"[*] Launching extraction sequences on: {input_csv_path}")
    
    if not os.path.exists(input_csv_path):
        print(f"[!] Target raw file not found at {input_csv_path}. Skipping workflow loop.")
        return

    # 1. Read input dataset
    df = pd.read_csv(input_csv_path)
    
    # 2. Impute missing climate variables using historical mean benchmarks
    climate_cols = [col for col in ['avg_temp', 'average_rain_fall_mm_per_year', 'rainfall', 'ph'] if col in df.columns]
    for col in climate_cols:
        if df[col].isnull().sum() > 0:
            mean_val = df[col].mean()
            df[col].fillna(mean_val, inplace=True)
            print(f"[+] Imputed missing entries in feature column [{col}] using historical mean: {mean_val:.2f}")

    # 3. Detect and clear impossible record outliers (e.g., negative rainfall anomalies)
    if 'rainfall' in df.columns:
        initial_count = len(df)
        df = df[df['rainfall'] >= 0]
        final_count = len(df)
        if initial_count != final_count:
            print(f"[!] Dropped {initial_count - final_count} corrupted rows displaying negative rainfall data.")

    # 4. Generate scalable processed outputs ready for categorical array encoding
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    df.to_csv(output_csv_path, index=False)
    print(f"[+] Preprocessing complete! Clean agricultural matrices exported to: {output_csv_path}\n")

if __name__ == "__main__":
    # Create sample structured test layout directory directories
    run_agri_preprocessing_pipeline("data/raw/crop_yield_raw.csv", "data/processed/crop_yield_clean.csv")
