import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

df = pd.read_csv("datasets/processed/crop_yield_cleaned.csv")

os.makedirs("visualizations", exist_ok=True)

# Select numeric columns
numeric_df = df.select_dtypes(include=['int64', 'float64'])

plt.figure(figsize=(10,8))

sns.heatmap(
    numeric_df.corr(),
    annot=True,
    cmap="coolwarm"
)

plt.title("Feature Correlation Heatmap")

plt.savefig("visualizations/correlation_heatmap.png")

plt.show()

print("Correlation heatmap saved successfully!")