from pathlib import Path

import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]

DATASET = (
    ML_ROOT
    / "data"
    / "processed"
    / "yieldsense_ml_dataset.csv"
)

REPORTS = ML_ROOT / "reports"

REPORTS.mkdir(exist_ok=True)

df = pd.read_csv(DATASET)

print("=" * 60)
print("YieldSense AI - Exploratory Data Analysis")
print("=" * 60)

print("\nDATASET OVERVIEW")
print("-" * 40)

print(f"Rows                : {len(df)}")
print(f"Columns             : {len(df.columns)}")
print(f"Unique Crops        : {df['Crop'].nunique()}")
print(f"Unique States       : {df['State'].nunique()}")
print(f"Unique Seasons      : {df['Season'].nunique()}")
print(f"Year Range          : {df['Crop_Year'].min()} - {df['Crop_Year'].max()}")

print("\nYIELD STATISTICS")
print("-" * 40)

print(df["Yield"].describe())

print("\nTOP 10 CROPS BY AVERAGE YIELD")
print("-" * 40)

crop_stats = (
    df.groupby("Crop")["Yield"]
    .mean()
    .sort_values(ascending=False)
)

print(crop_stats.head(10))

print("\nTOP 10 STATES BY AVERAGE YIELD")
print("-" * 40)

state_stats = (
    df.groupby("State")["Yield"]
    .mean()
    .sort_values(ascending=False)
)

print(state_stats.head(10))

print("\nSEASON AVERAGE YIELD")
print("-" * 40)

season_stats = (
    df.groupby("Season")["Yield"]
    .mean()
    .sort_values(ascending=False)
)

print(season_stats)

print("\nCORRELATION WITH YIELD")
print("-" * 40)

numeric = df.select_dtypes(include="number")

corr = (
    numeric.corr()["Yield"]
    .sort_values(ascending=False)
)

print(corr)

corr.to_csv(
    REPORTS / "yield_correlations.csv"
)

print("\nCorrelation report saved.")