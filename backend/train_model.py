import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

print("🌾 YieldSense AI Model Training Started...\n")

# Load Dataset
df = pd.read_csv("datasets/processed/crop_yield_cleaned.csv")

# Remove unwanted column
if "Unnamed: 0" in df.columns:
    df.drop("Unnamed: 0", axis=1, inplace=True)

# Features
X = df[
    [
        "Area",
        "Item",
        "Year",
        "average_rain_fall_mm_per_year",
        "pesticides_tonnes",
        "avg_temp"
    ]
]

# Target
y = df["hg/ha_yield"]

# Split Dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Models
models = {

    "Linear Regression": LinearRegression(),

    "Decision Tree": DecisionTreeRegressor(
        random_state=42
    ),

    "Random Forest": RandomForestRegressor(
        n_estimators=100,
        random_state=42
    ),

    "Gradient Boosting": GradientBoostingRegressor(
        random_state=42
    )

}

results = []

best_model = None
best_model_name = ""
best_score = -999999

print("=" * 60)
print("🤖 Training Multiple Machine Learning Models")
print("=" * 60)

for name, model in models.items():

    print(f"\nTraining {name}...")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = mean_squared_error(
        y_test,
        predictions
    ) ** 0.5

    r2 = r2_score(
        y_test,
        predictions
    )

    results.append({
        "Model": name,
        "MAE": mae,
        "RMSE": rmse,
        "R2 Score": r2
    })

    print(f"MAE  : {mae:.2f}")
    print(f"RMSE : {rmse:.2f}")
    print(f"R²   : {r2:.4f}")

    if r2 > best_score:

        best_score = r2
        best_model = model
        best_model_name = name

# Results Table
results_df = pd.DataFrame(results)

print("\n")
print("=" * 60)
print("📊 MODEL COMPARISON")
print("=" * 60)

print(results_df)

# Save Comparison
results_df.to_csv(
    "models/model_comparison.csv",
    index=False
)

# Save Best Model
joblib.dump(
    best_model,
    "models/crop_yield_model.pkl"
)

print("\n")
print("=" * 60)
print(f"🏆 Best Model : {best_model_name}")
print(f"🎯 Best R² Score : {best_score:.4f}")
print("=" * 60)

print("\n💾 Best model saved successfully!")
print("📁 models/crop_yield_model.pkl")

print("📄 Model comparison saved!")
print("📁 models/model_comparison.csv")

print("\n🎉 Milestone 2 Model Optimization Completed!")