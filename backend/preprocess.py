
import pandas as pd
import numpy as np
import os


def clean_crop_yield_data(input_path: str, output_path: str) -> pd.DataFrame:
    """
    Cleans the Kaggle Crop Yield Prediction dataset.
    Expected columns: Area, Item, Year, hg/ha_yield,
                       average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp
    """
    print(f"\n🔄 Processing crop yield dataset: {input_path}")

    if not os.path.exists(input_path):
        print(f"❌ File not found: {input_path}")
        return None

    df = pd.read_csv(input_path)
    print(f"   Loaded {len(df)} rows, {len(df.columns)} columns")

    # 1. Standardize column names (lowercase, no spaces)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # 2. Fill missing numeric values with column mean
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        missing = df[col].isnull().sum()
        if missing > 0:
            mean_val = df[col].mean()
            df[col] = df[col].fillna(mean_val)
            print(f"   ✔ Filled {missing} missing values in '{col}' with mean {mean_val:.2f}")

    # 3. Drop rows with missing categorical values (can't guess crop/area names)
    categorical_cols = df.select_dtypes(include=["object"]).columns
    before = len(df)
    df = df.dropna(subset=categorical_cols)
    if before != len(df):
        print(f"   ✔ Dropped {before - len(df)} rows with missing category values")

    # 4. Remove impossible/outlier values
    if "average_rain_fall_mm_per_year" in df.columns:
        before = len(df)
        df = df[df["average_rain_fall_mm_per_year"] >= 0]
        print(f"   ✔ Removed {before - len(df)} rows with negative rainfall")

    if "avg_temp" in df.columns:
        before = len(df)
        df = df[(df["avg_temp"] >= -10) & (df["avg_temp"] <= 60)]
        print(f"   ✔ Removed {before - len(df)} rows with unrealistic temperature")

    if "hg/ha_yield" in df.columns:
        before = len(df)
        df = df[df["hg/ha_yield"] > 0]
        print(f"   ✔ Removed {before - len(df)} rows with zero/negative yield")

    # 5. Remove exact duplicate rows
    before = len(df)
    df = df.drop_duplicates()
    if before != len(df):
        print(f"   ✔ Removed {before - len(df)} duplicate rows")

    # 6. Save cleaned data
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved cleaned data: {output_path} ({len(df)} rows)")

    return df


def clean_crop_recommendation_data(input_path: str, output_path: str) -> pd.DataFrame:
    """
    Cleans the Kaggle Crop Recommendation dataset.
    Expected columns: N, P, K, temperature, humidity, ph, rainfall, label
    """
    print(f"\n🔄 Processing crop recommendation dataset: {input_path}")

    if not os.path.exists(input_path):
        print(f"❌ File not found: {input_path}")
        return None

    df = pd.read_csv(input_path)
    print(f"   Loaded {len(df)} rows, {len(df.columns)} columns")

    df.columns = [c.strip().lower() for c in df.columns]

    # 1. Fill missing numeric values with mean
    numeric_cols = ["n", "p", "k", "temperature", "humidity", "ph", "rainfall"]
    for col in numeric_cols:
        if col in df.columns:
            missing = df[col].isnull().sum()
            if missing > 0:
                mean_val = df[col].mean()
                df[col] = df[col].fillna(mean_val)
                print(f"   ✔ Filled {missing} missing values in '{col}' with mean {mean_val:.2f}")

    # 2. Remove impossible values
    if "ph" in df.columns:
        before = len(df)
        df = df[(df["ph"] >= 0) & (df["ph"] <= 14)]
        print(f"   ✔ Removed {before - len(df)} rows with invalid pH")

    if "humidity" in df.columns:
        before = len(df)
        df = df[(df["humidity"] >= 0) & (df["humidity"] <= 100)]
        print(f"   ✔ Removed {before - len(df)} rows with invalid humidity")

    if "rainfall" in df.columns:
        before = len(df)
        df = df[df["rainfall"] >= 0]
        print(f"   ✔ Removed {before - len(df)} rows with negative rainfall")

    # 3. Drop rows missing the target label
    if "label" in df.columns:
        before = len(df)
        df = df.dropna(subset=["label"])
        print(f"   ✔ Dropped {before - len(df)} rows with missing crop label")

    # 4. Remove duplicates
    before = len(df)
    df = df.drop_duplicates()
    if before != len(df):
        print(f"   ✔ Removed {before - len(df)} duplicate rows")

    # 5. Save cleaned data
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved cleaned data: {output_path} ({len(df)} rows)")

    return df


if __name__ == "__main__":
    # Adjust these paths to match your actual downloaded filenames
    clean_crop_yield_data(
        input_path="data/raw/kaggle_crop_yield.csv",
        output_path="data/processed/cleaned_crop_yield.csv",
    )

    clean_crop_recommendation_data(
        input_path="data/raw/kaggle_crop_recommendation.csv",
        output_path="data/processed/cleaned_crop_recommendation.csv",
    )

    print("\n🚀 Preprocessing pipeline complete!")