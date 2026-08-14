import pandas as pd

# Load crop yield dataset

df = pd.read_csv(
    "../dataset/raw/yield_df.csv"
)

print("Dataset Loaded Successfully")


print(df.head())

print("Dataset Shape:")
print(df.shape)

print("Missing Values:")
print(df.isnull().sum())

# Remove missing values

df = df.dropna()

# Remove duplicate rows

df = df.drop_duplicates()

# Save cleaned dataset

df.to_csv(
    "../dataset/processed/cleaned_crop_yield.csv",
    index=False
)


print("Preprocessing Completed Successfully")