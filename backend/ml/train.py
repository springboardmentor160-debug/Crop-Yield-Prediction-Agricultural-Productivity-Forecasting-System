"""
YieldSense AI — ML Training Pipeline

Orchestrates the training of:
1. Crop Recommendation Model (Classification) on Crop_recommendation_processed.csv
2. Crop Yield Prediction Model (Regression) on yield_df_processed.csv

Evaluates multiple models, runs KNN elbow curves to choose the optimal n_neighbors,
plots comparisons, and saves the best models.
"""

import os
import json
import time
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
    r2_score, mean_absolute_error, mean_squared_error
)

import warnings
warnings.filterwarnings("ignore")

# Set non-interactive matplotlib backend
import matplotlib
matplotlib.use('Agg')

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "datasets" / "processed"
SAVED_MODELS_DIR = BASE_DIR / "ml" / "models" / "saved"
PLOTS_DIR = SAVED_MODELS_DIR / "plots"

# Create directories
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
PLOTS_DIR.mkdir(parents=True, exist_ok=True)


def ensure_datasets_processed():
    """Build processed CSV datasets directly from raw datasets if missing."""
    raw_dir = BASE_DIR / "datasets" / "raw"
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    crop_output = PROCESSED_DIR / "Crop_recommendation_processed.csv"
    if not crop_output.exists():
        crop_input = raw_dir / "Crop_recommendation.csv"
        if not crop_input.exists():
            raise FileNotFoundError(f"Raw dataset missing: {crop_input}")
        print(f"Processing raw crop dataset: {crop_input}...")
        df = pd.read_csv(crop_input).drop_duplicates().reset_index(drop=True)
        for col in df.columns:
            if df[col].isna().any():
                if pd.api.types.is_numeric_dtype(df[col]):
                    df[col] = df[col].fillna(df[col].median())
                else:
                    df[col] = df[col].fillna(df[col].mode(dropna=True).iloc[0])
        df['label'] = df['label'].astype(str).str.strip()
        label_map = {label: idx for idx, label in enumerate(sorted(df['label'].unique()))}
        df['label_encoded'] = df['label'].map(label_map).astype('int64')
        df.to_csv(crop_output, index=False)
        print("Crop recommendation dataset processed successfully.")

    yield_output = PROCESSED_DIR / "yield_df_processed.csv"
    if not yield_output.exists():
        yield_input = raw_dir / "yield_df.csv"
        if not yield_input.exists():
            raise FileNotFoundError(f"Raw dataset missing: {yield_input}")
        print(f"Processing raw yield dataset: {yield_input}...")
        df = pd.read_csv(yield_input)
        if 'Unnamed: 0' in df.columns:
            df = df.drop(columns=['Unnamed: 0'])
        df = df.drop_duplicates().reset_index(drop=True)
        for col in df.columns:
            if df[col].isna().any():
                if pd.api.types.is_numeric_dtype(df[col]):
                    df[col] = df[col].fillna(df[col].median())
                else:
                    df[col] = df[col].fillna(df[col].mode(dropna=True).iloc[0])
        df['Area'] = df['Area'].astype(str).str.strip()
        df['Item'] = df['Item'].astype(str).str.strip()
        df = pd.get_dummies(df, columns=['Area', 'Item'], drop_first=True, dtype='int64')
        df.to_csv(yield_output, index=False)
        print("Crop yield dataset processed successfully.")


def train_crop_recommendation():
    print("\n" + "=" * 60)
    print("TRAINING CROP RECOMMENDATION MODEL (CLASSIFICATION)")
    print("=" * 60)

    ensure_datasets_processed()
    crop_path = PROCESSED_DIR / "Crop_recommendation_processed.csv"

    # Load data
    df = pd.read_csv(crop_path)
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label_encoded']
    
    # Store label mapping
    unique_labels = sorted(df['label'].unique())
    label_map = {idx: label for idx, label in enumerate(unique_labels)}
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. KNN Elbow Curve
    print("Running KNN n_neighbors search (1 to 15)...")
    k_values = range(1, 16)
    knn_accuracies = []
    best_k = 1
    best_k_acc = 0

    for k in k_values:
        clf = KNeighborsClassifier(n_neighbors=k)
        clf.fit(X_train_scaled, y_train)
        acc = accuracy_score(y_test, clf.predict(X_test_scaled))
        knn_accuracies.append(acc)
        if acc > best_k_acc:
            best_k_acc = acc
            best_k = k
            
    print(f"Optimal k for KNN: {best_k} (Accuracy: {best_k_acc:.4f})")

    # Plot KNN Elbow Curve
    plt.figure(figsize=(8, 4.5))
    plt.plot(k_values, knn_accuracies, marker='o', color='forestgreen', linewidth=2)
    plt.title("Crop Recommendation: KNN Elbow Curve (Accuracy vs k)")
    plt.xlabel("n_neighbors (k)")
    plt.ylabel("Accuracy Score")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "crop_knn_elbow.png", dpi=150)
    plt.close()

    # Define models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree (Gini)": DecisionTreeClassifier(criterion='gini', random_state=42),
        "Decision Tree (Entropy)": DecisionTreeClassifier(criterion='entropy', random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "KNN Classifier (tuned)": KNeighborsClassifier(n_neighbors=best_k)
    }

    # Evaluate models
    results = {}
    best_model_name = ""
    best_model_acc = -1
    best_clf = None

    for name, clf in models.items():
        print(f"Training: {name}...")
        clf.fit(X_train_scaled, y_train)
        y_pred = clf.predict(X_test_scaled)

        acc = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        results[name] = {
            "Accuracy": acc,
            "Precision": precision,
            "Recall": recall,
            "F1-Score (Weighted)": f1
        }

        if acc > best_model_acc:
            best_model_acc = acc
            best_model_name = name
            best_clf = clf

    print("\n" + "=" * 60)
    print("CROP CLASSIFICATION MODEL COMPARISON")
    print("-" * 60)
    print(f"{'Model':<25} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1-Score':<10}")
    print("-" * 60)
    for name, metrics in results.items():
        print(f"{name:<25} {metrics['Accuracy']:.4f}     {metrics['Precision']:.4f}     {metrics['Recall']:.4f}     {metrics['F1-Score (Weighted)']:.4f}")
    print("=" * 60)

    # Save best crop recommendation model artifacts
    joblib.dump(best_clf, SAVED_MODELS_DIR / "crop_best_model.joblib")
    joblib.dump(scaler, SAVED_MODELS_DIR / "crop_scaler.joblib")
    
    metadata = {
        "best_model": best_model_name,
        "metrics": results[best_model_name],
        "label_map": label_map,
        "feature_names": list(X.columns),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(SAVED_MODELS_DIR / "crop_model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # Plot Model Comparison Bar Chart
    df_results = pd.DataFrame(results).T.reset_index().rename(columns={"index": "Model"})
    plt.figure(figsize=(10, 5))
    df_melted = pd.melt(df_results, id_vars="Model", value_vars=["Accuracy", "F1-Score (Weighted)"])
    sns.barplot(data=df_melted, x="Model", y="value", hue="variable", palette="viridis")
    plt.title("Crop Recommendation Model Performance Comparison")
    plt.ylabel("Score")
    plt.ylim(0, 1.05)
    plt.xticks(rotation=15)
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "crop_model_comparison.png", dpi=150)
    plt.close()

    # Plot Confusion Matrix for Best Model
    y_pred_best = best_clf.predict(X_test_scaled)
    cm = confusion_matrix(y_test, y_pred_best)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', xticklabels=unique_labels, yticklabels=unique_labels)
    plt.title(f"Confusion Matrix - Best Model: {best_model_name}")
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "crop_confusion_matrix.png", dpi=150)
    plt.close()

    print(f"Saved crop recommendation model artifacts. Best: {best_model_name} (Acc: {best_model_acc:.4f})")


def train_crop_yield():
    print("\n" + "=" * 60)
    print("TRAINING CROP YIELD REGRESSION MODEL")
    print("=" * 60)

    ensure_datasets_processed()
    yield_path = PROCESSED_DIR / "yield_df_processed.csv"

    # Load data
    df = pd.read_csv(yield_path)
    X = df.drop(columns=['hg/ha_yield'])
    y = df['hg/ha_yield']

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # We scale only the numerical features, leaving the one-hot encoded columns intact
    numerical_cols = ['Year', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp']
    scaler = StandardScaler()
    
    # Create scaled train/test
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    X_train_scaled[numerical_cols] = scaler.fit_transform(X_train[numerical_cols])
    X_test_scaled[numerical_cols] = scaler.transform(X_test[numerical_cols])

    # 1. KNN Elbow Curve
    print("Running KNN Regressor n_neighbors search (1 to 15)...")
    k_values = range(1, 16)
    knn_r2s = []
    best_k = 1
    best_k_r2 = -float("inf")

    for k in k_values:
        reg = KNeighborsRegressor(n_neighbors=k)
        reg.fit(X_train_scaled, y_train)
        r2 = r2_score(y_test, reg.predict(X_test_scaled))
        knn_r2s.append(r2)
        if r2 > best_k_r2:
            best_k_r2 = r2
            best_k = k
            
    print(f"Optimal k for KNN Regressor: {best_k} (R²: {best_k_r2:.4f})")

    # Plot KNN Regressor Elbow Curve
    plt.figure(figsize=(8, 4.5))
    plt.plot(k_values, knn_r2s, marker='o', color='darkorange', linewidth=2)
    plt.title("Yield Prediction: KNN Elbow Curve (R² vs k)")
    plt.xlabel("n_neighbors (k)")
    plt.ylabel("R² Score")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "yield_knn_elbow.png", dpi=150)
    plt.close()

    # Define models
    # Note: limit RandomForest Regressor depth to prevent memory overflow on large dataset
    models = {
        "Multiple Linear Regression": LinearRegression(),
        "Decision Tree (squared_error)": DecisionTreeRegressor(criterion='squared_error', random_state=42),
        "Decision Tree (friedman_mse)": DecisionTreeRegressor(criterion='friedman_mse', random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=50, max_depth=15, random_state=42),
        "KNN Regressor (tuned)": KNeighborsRegressor(n_neighbors=best_k)
    }

    # Evaluate models
    results = {}
    best_model_name = ""
    best_model_r2 = -float("inf")
    best_reg = None

    for name, reg in models.items():
        print(f"Training: {name}...")
        reg.fit(X_train_scaled, y_train)
        y_pred = reg.predict(X_test_scaled)

        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)

        results[name] = {
            "R2": r2,
            "MAE": mae,
            "MSE": mse,
            "RMSE": rmse
        }

        if r2 > best_model_r2:
            best_model_r2 = r2
            best_model_name = name
            best_reg = reg

    print("\n" + "=" * 60)
    print("CROP YIELD MODEL COMPARISON")
    print("-" * 60)
    print(f"{'Model':<30} {'R2':<10} {'MAE':<10} {'RMSE':<10}")
    print("-" * 60)
    for name, metrics in results.items():
        print(f"{name:<30} {metrics['R2']:.4f}     {metrics['MAE']:.2f}     {metrics['RMSE']:.2f}")
    print("=" * 60)

    # Save best regression model artifacts
    joblib.dump(best_reg, SAVED_MODELS_DIR / "yield_best_model.joblib")
    joblib.dump(scaler, SAVED_MODELS_DIR / "yield_scaler.joblib")
    joblib.dump(list(X.columns), SAVED_MODELS_DIR / "yield_feature_columns.joblib")

    metadata = {
        "best_model": best_model_name,
        "metrics": results[best_model_name],
        "feature_names": list(X.columns),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(SAVED_MODELS_DIR / "yield_model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # Plot Model Comparison Bar Chart (R2)
    df_results = pd.DataFrame(results).T.reset_index().rename(columns={"index": "Model"})
    plt.figure(figsize=(10, 5))
    sns.barplot(data=df_results, x="Model", y="R2", hue="Model", palette="magma", legend=False)
    plt.title("Crop Yield Regressors: R² Score Comparison")
    plt.ylabel("R² Score")
    plt.ylim(0, 1.05)
    plt.xticks(rotation=15)
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "yield_model_comparison.png", dpi=150)
    plt.close()

    # Plot Actual vs Predicted for Best Model
    y_pred_best = best_reg.predict(X_test_scaled)
    plt.figure(figsize=(8, 6))
    plt.scatter(y_test, y_pred_best, alpha=0.3, color='purple')
    # Draw reference line
    ideal_min = min(y_test.min(), y_pred_best.min())
    ideal_max = max(y_test.max(), y_pred_best.max())
    plt.plot([ideal_min, ideal_max], [ideal_min, ideal_max], '--k', linewidth=2)
    plt.title(f"Actual vs Predicted Yield (Best Model: {best_model_name})")
    plt.xlabel("Actual Yield (hg/ha)")
    plt.ylabel("Predicted Yield (hg/ha)")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "yield_actual_vs_predicted.png", dpi=150)
    plt.close()

    print(f"Saved crop yield prediction model artifacts. Best: {best_model_name} (R²: {best_model_r2:.4f})")


def main():
    start_time = time.time()
    
    # 1. Train Crop Recommendation (Classification)
    train_crop_recommendation()
    
    # 2. Train Crop Yield (Regression)
    train_crop_yield()
    
    print("\n" + "=" * 60)
    print("ALL MODEL TRAINING COMPLETE!")
    print(f"Total processing time: {time.time() - start_time:.1f} seconds")
    print(f"Plots saved to: {PLOTS_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
