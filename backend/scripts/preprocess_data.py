import pandas as pd
import numpy as np
import os

def generate_simulated_kaggle_dataset(output_path="raw_crop_data.csv"):
    """Simulates the Kaggle crop yield dataset since we are disconnected from the internet."""
    print("Generating simulated Kaggle Crop Yield Dataset...")
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'Location': np.random.choice(['Region_A', 'Region_B', 'Region_C', 'Region_D'], n_samples),
        'Date': pd.date_range(start='2020-01-01', periods=n_samples, freq='D'),
        'Crop_Type': np.random.choice(['Wheat', 'Corn', 'Rice', 'Soybeans'], n_samples),
        'Average_Temperature_C': np.random.normal(loc=25, scale=5, size=n_samples),
        'Total_Precipitation_mm': np.random.exponential(scale=50, size=n_samples),
        'Soil_Moisture_Percent': np.random.normal(loc=40, scale=10, size=n_samples),
        'Pesticide_Use_kg_per_ha': np.random.uniform(low=0.5, high=5.0, size=n_samples),
        'Yield_tons_per_ha': np.random.normal(loc=3.5, scale=1.0, size=n_samples) # Target variable
    }
    
    # Introduce some missing values to simulate real-world data
    data['Average_Temperature_C'][np.random.choice(n_samples, 20, replace=False)] = np.nan
    data['Soil_Moisture_Percent'][np.random.choice(n_samples, 30, replace=False)] = np.nan

    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Dataset generated and saved to {output_path}")

def preprocess_data(input_path="raw_crop_data.csv", output_path="cleaned_crop_data.csv"):
    """Cleans and normalizes the dataset for database ingestion and ML models."""
    print("Starting data preprocessing...")
    
    if not os.path.exists(input_path):
        generate_simulated_kaggle_dataset(input_path)
        
    df = pd.read_csv(input_path)
    
    # 1. Handle Missing Values
    # Impute numeric columns with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    
    # 2. Format Date
    df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
    
    # 3. Rename columns to match database schema conventions
    df.rename(columns={
        'Average_Temperature_C': 'avg_temp',
        'Total_Precipitation_mm': 'precipitation',
        'Soil_Moisture_Percent': 'soil_moisture',
        'Yield_tons_per_ha': 'yield_amount',
        'Location': 'location',
        'Date': 'date',
        'Crop_Type': 'crop_type'
    }, inplace=True)
    
    df.to_csv(output_path, index=False)
    print(f"Data cleaned and saved to {output_path}")
    print(f"Total records processed: {len(df)}")
    print("Sample of cleaned data:")
    print(df.head())

if __name__ == "__main__":
    preprocess_data()
