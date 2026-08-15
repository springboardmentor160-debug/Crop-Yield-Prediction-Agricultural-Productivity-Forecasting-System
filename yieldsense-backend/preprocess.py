import pandas as pd

# Load the dataset
df = pd.read_csv("data/raw/yield_df.csv")

# Display first 5 rows
print("First 5 rows:")
print(df.head())

# Display dataset information
print("\nDataset Info:")
print(df.info())

# Remove missing values
df = df.dropna()

# Save cleaned dataset
df.to_csv(
    "data/processed/cleaned_crop_data.csv",
    index=False
)

print("\n✅ Data preprocessing completed successfully!")