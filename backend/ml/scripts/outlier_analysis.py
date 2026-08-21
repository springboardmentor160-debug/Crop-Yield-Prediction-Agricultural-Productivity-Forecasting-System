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
print("YieldSense AI - Outlier Analysis")
print("=" * 60)

print("\nYield Statistics")
print("-" * 40)
print(df["Yield"].describe())

# -----------------------------
# IQR Method
# -----------------------------

Q1 = df["Yield"].quantile(0.25)
Q3 = df["Yield"].quantile(0.75)
IQR = Q3 - Q1

lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

outliers = df[
    (df["Yield"] < lower)
    | (df["Yield"] > upper)
]

print("\nOutlier Thresholds")
print("-" * 40)
print(f"Lower : {lower:.3f}")
print(f"Upper : {upper:.3f}")

print()

print(f"Total Outliers : {len(outliers)}")
print(
    f"Percentage     : {(len(outliers)/len(df))*100:.2f}%"
)

print()

print("Top 20 Highest Yield Records")
print("-" * 40)

print(
    outliers.sort_values(
        "Yield",
        ascending=False,
    )[
        [
            "Crop",
            "State",
            "Season",
            "Crop_Year",
            "Yield",
        ]
    ].head(20)
)

print()

print("Top Crops Among Outliers")
print("-" * 40)

print(
    outliers["Crop"]
    .value_counts()
    .head(15)
)

print()

print("Top States Among Outliers")
print("-" * 40)

print(
    outliers["State"]
    .value_counts()
    .head(15)
)

outliers.to_csv(
    REPORTS / "yield_outliers.csv",
    index=False,
)

print()

print("Outlier report saved:")
print(REPORTS / "yield_outliers.csv")