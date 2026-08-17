import os
import pandas as pd
import numpy as np

def map_to_canonical(df: pd.DataFrame) -> pd.DataFrame:
    temp_candidates = ["avg_temp", "Temperature_C", "temperature", "average_temperature"]
    rain_candidates = ["average_rain_fall_mm_per_year", "Rainfall_mm", "rainfall", "rainfall_mm"]
    ph_candidates = ["ph", "Soil_pH", "soil_ph", "ph_value"]
    target_candidates = ["yield_kg_per_ha", "hg/ha_yield", "Yield_Tons", "yield_amount"]
    
    col_map = {}
    
    # 1. Temperature
    temp_col = next((c for c in temp_candidates if c in df.columns), None)
    if temp_col:
        col_map[temp_col] = "avg_temp"
        
    # 2. Rainfall
    rain_col = next((c for c in rain_candidates if c in df.columns), None)
    if rain_col:
        col_map[rain_col] = "average_rain_fall_mm_per_year"
        
    # 3. pH
    ph_col = next((c for c in ph_candidates if c in df.columns), None)
    if ph_col:
        col_map[ph_col] = "ph"
        
    # 4. Target
    target_col = next((c for c in target_candidates if c in df.columns), None)
    
    df_mapped = df.rename(columns=col_map).copy()
    
    if target_col is not None:
        y = pd.to_numeric(df_mapped[target_col], errors="coerce")
        if target_col == "hg/ha_yield":
            # hg/ha to kg/ha (divide by 10)
            df_mapped["yield_kg_per_ha"] = y / 10.0
        elif target_col == "Yield_Tons":
            # tons to kg/ha: (Yield_Tons / Area_Hectares) * 1000
            area_col = next((c for c in ["Area_Hectares", "area", "area_cultivated"] if c in df_mapped.columns), None)
            if area_col:
                df_mapped["yield_kg_per_ha"] = (y / pd.to_numeric(df_mapped[area_col], errors="coerce")) * 1000.0
            else:
                df_mapped["yield_kg_per_ha"] = y * 1000.0
        else:
            df_mapped["yield_kg_per_ha"] = y
            
        if target_col != "yield_kg_per_ha":
            df_mapped = df_mapped.drop(columns=[target_col])
            
    return df_mapped

def run_agri_preprocessing_pipeline(input_csv_path: str, output_csv_path: str) -> dict:
    if not os.path.exists(input_csv_path):
        return {"status": "Failed", "error": "Raw file not found"}

    try:
        df = pd.read_csv(input_csv_path)
        initial_row_count = len(df)
        initial_missing_count = int(df.isnull().sum().sum())
        columns = list(df.columns)
        duplicates_removed = int(df.duplicated().sum())
        df = df.drop_duplicates().copy()

        # Map columns to canonical formats and convert units
        df = map_to_canonical(df)

        # Impute missing values
        climate_cols = [
            col
            for col in ["avg_temp", "average_rain_fall_mm_per_year", "ph", "nitrogen", "phosphorus", "potassium", "organic_matter"]
            if col in df.columns
        ]
        for col in climate_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            if df[col].isnull().sum() > 0:
                mean_val = df[col].median()
                if pd.isna(mean_val):
                    return {"status": "Failed", "error": f"Column '{col}' contains no usable numeric values"}
                df[col] = df[col].fillna(mean_val)

        # Drop negative rainfall/nutrients values
        for col in ["average_rain_fall_mm_per_year", "nitrogen", "phosphorus", "potassium", "organic_matter"]:
            if col in df.columns:
                initial_count = len(df)
                df = df[df[col] >= 0]
                dropped = initial_count - len(df)

        # Validate pH values
        for col in ["ph"]:
            if col in df.columns:
                initial_count = len(df)
                df = df[(df[col] >= 0) & (df[col] <= 14)]
                dropped = initial_count - len(df)
        if df.empty:
            return {"status": "Failed", "error": "No valid rows remain after validation"}

        os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
        df.to_csv(output_csv_path, index=False)
        return {
            "status": "Completed",
            "row_count": len(df),
            "missing_values": initial_missing_count,
            "duplicates_removed": duplicates_removed,
            "invalid_rows_removed": initial_row_count - duplicates_removed - len(df),
            "columns_found": ", ".join(columns)
        }
    except Exception as e:
        return {
            "status": "Failed",
            "row_count": 0,
            "missing_values": 0,
            "columns_found": "",
            "error": str(e)
        }

if __name__ == "__main__":
    # Preprocess raw files and combine them
    print("Preprocessing raw crop yield datasets...")
    run_agri_preprocessing_pipeline("data/raw/crop_yield_raw.csv", "data/processed/clean_crop_yield_raw.csv")
    run_agri_preprocessing_pipeline("data/raw/CropYieldSample.csv", "data/processed/clean_CropYieldSample.csv")
    
    # Combine both clean datasets into crop_yield_clean.csv
    df1 = pd.read_csv("data/processed/clean_crop_yield_raw.csv")
    df2 = pd.read_csv("data/processed/clean_CropYieldSample.csv")
    
    # Merge and make sure only canonical columns are kept
    cols = ["avg_temp", "average_rain_fall_mm_per_year", "ph", "yield_kg_per_ha"]
    df1_subset = df1[[c for c in cols if c in df1.columns]]
    df2_subset = df2[[c for c in cols if c in df2.columns]]
    
    combined = pd.concat([df1_subset, df2_subset], ignore_index=True)
    combined.to_csv("data/processed/crop_yield_clean.csv", index=False)
    print(f"Combined dataset written to data/processed/crop_yield_clean.csv with {len(combined)} rows.")
