from pathlib import Path

import pandas as pd

RAW_DATA = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "raw"
    / "historical_crop_yield.csv"
)


def main():
    df = pd.read_csv(RAW_DATA)

    print("=" * 60)
    print("YieldSense AI - Target Leakage Analysis")
    print("=" * 60)

    calculated_yield = df["Production"] / df["Area"]

    difference = (df["Yield"] - calculated_yield).abs()

    exact_matches = (difference == 0).sum()

    rounded_matches = (difference < 0.0001).sum()

    print()
    print(f"Total Rows               : {len(df)}")
    print(f"Exact Matches            : {exact_matches}")
    print(f"Rounded Matches          : {rounded_matches}")
    print()

    print(
        "Maximum Difference       :",
        difference.max(),
    )

    print(
        "Average Difference       :",
        difference.mean(),
    )

    print()

    print("Sample Comparison")
    print("-" * 60)

    sample = pd.DataFrame(
        {
            "Area": df["Area"],
            "Production": df["Production"],
            "Dataset_Yield": df["Yield"],
            "Calculated_Yield": calculated_yield,
            "Difference": difference,
        }
    )

    print(sample.head(20))

    print()

    if rounded_matches == len(df):
        print("RESULT")
        print(
            "Yield is calculated directly from Production / Area."
        )
        print(
            "Production MUST NOT be used for ML training."
        )

    else:
        print("RESULT")
        print(
            "Yield is not directly calculated from Production / Area."
        )
        print(
            "Further feature analysis is required."
        )


if __name__ == "__main__":
    main()