from pathlib import Path

import pandas as pd


ML_ROOT = Path(__file__).resolve().parents[1]

RAW = ML_ROOT / "data" / "raw"
PROCESSED = ML_ROOT / "data" / "processed"

PROCESSED.mkdir(parents=True, exist_ok=True)


def standardize_text(series: pd.Series) -> pd.Series:
    return (
        series.astype(str)
        .str.strip()
        .str.replace(r"\s+", " ", regex=True)
        .str.title()
    )


print("=" * 60)
print("YieldSense AI - Dataset Preparation")
print("=" * 60)

# ---------------------------------------------------
# Historical Dataset
# ---------------------------------------------------

print("\nLoading historical crop dataset...")

historical = pd.read_csv(
    RAW / "historical_crop_yield.csv"
)

historical["Crop"] = standardize_text(
    historical["Crop"]
)

historical["Season"] = standardize_text(
    historical["Season"]
)

historical["State"] = standardize_text(
    historical["State"]
)

historical = historical.drop_duplicates()

historical = historical.sort_values(
    ["State", "Crop_Year", "Crop"]
)

print("Historical dataset cleaned.")

# ---------------------------------------------------
# Soil Dataset
# ---------------------------------------------------

print("\nLoading soil dataset...")

soil = pd.read_csv(
    RAW / "state_soil.csv"
)

soil["state"] = standardize_text(
    soil["state"]
)

soil = soil.drop_duplicates()

soil = soil.sort_values("state")

print("Soil dataset cleaned.")

# ---------------------------------------------------
# Weather Dataset
# ---------------------------------------------------

print("\nLoading weather dataset...")

weather = pd.read_csv(
    RAW / "state_weather.csv"
)

weather["state"] = standardize_text(
    weather["state"]
)

weather = weather.drop_duplicates()

weather = weather.sort_values(
    ["state", "year"]
)

print("Weather dataset cleaned.")

# ---------------------------------------------------
# Merge Soil
# ---------------------------------------------------

print("\nMerging soil data...")

merged = historical.merge(
    soil,
    how="left",
    left_on="State",
    right_on="state",
)

merged = merged.drop(columns=["state"])

# ---------------------------------------------------
# Merge Weather
# ---------------------------------------------------

print("Merging weather data...")

merged = merged.merge(
    weather,
    how="left",
    left_on=["State", "Crop_Year"],
    right_on=["state", "year"],
)

merged = merged.drop(columns=["state", "year"])

# ---------------------------------------------------
# Remove Production
# ---------------------------------------------------

print("\nRemoving Production feature...")

merged = merged.drop(columns=["Production"])

# ---------------------------------------------------
# Save Processed Dataset
# ---------------------------------------------------

output = (
    PROCESSED / "yieldsense_ml_dataset.csv"
)

merged.to_csv(output, index=False)

print()

print("=" * 60)
print("Preparation Completed")
print("=" * 60)

print(f"Rows : {len(merged)}")
print(f"Columns : {len(merged.columns)}")

print()

print("Columns")

for column in merged.columns:
    print("-", column)

print()

print(f"Saved to\n{output}")