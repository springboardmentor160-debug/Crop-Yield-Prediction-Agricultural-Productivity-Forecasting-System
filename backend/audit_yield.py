import pandas as pd
df = pd.read_csv("data/raw/crop_yield_raw.csv")
print("Records:", len(df))
print("Missing Values:\n", df.isnull().sum())
print("Unique Areas:", df["Area"].nunique())
print("Unique Crops:", df["Item"].nunique())
print("Years:", df["Year"].min(), "-", df["Year"].max())
print("Target Mean/Std:", df["hg/ha_yield"].mean(), df["hg/ha_yield"].std())
print("Duplicates:", df.duplicated().sum())
