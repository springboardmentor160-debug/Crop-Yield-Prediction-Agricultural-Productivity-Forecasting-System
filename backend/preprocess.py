import pandas as pd
import os
import joblib
from sklearn.preprocessing import LabelEncoder

# ==========================
# File Paths
# ==========================

INPUT_FILE = "datasets/raw/crop_yield_raw.csv"
OUTPUT_FILE = "datasets/processed/crop_yield_cleaned.csv"

print("🌾 YieldSense AI Data Preprocessing Started...\n")

# ==========================
# Load Dataset
# ==========================

df = pd.read_csv(INPUT_FILE)

# Remove unwanted column
if "Unnamed: 0" in df.columns:
    df.drop("Unnamed: 0", axis=1, inplace=True)

print("✅ Dataset Loaded Successfully")
print("Rows :", df.shape[0])
print("Columns :", df.shape[1])

# ==========================
# Remove Duplicates
# ==========================

df.drop_duplicates(inplace=True)

# ==========================
# Fill Missing Values
# ==========================

numeric_columns = df.select_dtypes(include=["int64", "float64"]).columns

for column in numeric_columns:
    df[column].fillna(df[column].mean(), inplace=True)

# ==========================
# Encode Area
# ==========================

area_encoder = LabelEncoder()

df["Area"] = area_encoder.fit_transform(df["Area"])

# ==========================
# Encode Crop
# ==========================

item_encoder = LabelEncoder()

df["Item"] = item_encoder.fit_transform(df["Item"])

# ==========================
# Save Encoders
# ==========================

os.makedirs("models", exist_ok=True)

joblib.dump(area_encoder, "models/area_encoder.pkl")

joblib.dump(item_encoder, "models/item_encoder.pkl")

# ==========================
# Save Dataset
# ==========================

os.makedirs("datasets/processed", exist_ok=True)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n✅ Data Preprocessing Completed Successfully!")

print("\nFiles Generated")

print("--------------------------")

print("✔ crop_yield_cleaned.csv")

print("✔ area_encoder.pkl")

print("✔ item_encoder.pkl")

print("--------------------------")