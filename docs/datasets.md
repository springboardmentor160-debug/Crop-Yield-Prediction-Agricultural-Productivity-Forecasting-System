# Datasets Documentation - YieldSense AI

To train our machine learning models and validate our preprocessing workflows, we target open-source agricultural data structures.

## 1. Selected Datasets

### A. Kaggle Crop Yield Prediction Dataset
- **Contents**:
  - `avg_temp` (Climate temperature benchmarks - feature)
  - `average_rain_fall_mm_per_year` (Atmospheric precipitation - feature)
  - `ph` (Soil pH - feature)
  - `yield_kg_per_ha` (Target variable - output)
  - `rainfall` (Atmospheric precipitations logs)
- **Use Case**: Crop yield prediction and weather correlation models.

### B. Kaggle Crop Recommendation Dataset
- **Contents**:
  - Nitrogen (N), Phosphorus (P), Potassium (K)
  - Temperature, Humidity, pH, Rainfall
  - Label (Recommended crop)
- **Use Case**: Developing soil assessment and crop planning recommendations.

---

## 2. Preprocessing Rules (`preprocess.py`)
Our preprocessing script runs sequences to transform raw files into standardized tabular layouts:
1. **Load Raw Data**: Reads files from `data/raw/crop_yield_raw.csv`.
2. **Missing Value Imputation**: Imputes missing values for `avg_temp`, `average_rain_fall_mm_per_year`, `rainfall`, and `ph` using their column-specific historical means.
3. **Outlier Filtering**: Identifies and drops corrupted data entries (e.g., negative rainfall metrics).
4. **Data Export**: Outputs the standardized array to `data/processed/crop_yield_clean.csv`.
