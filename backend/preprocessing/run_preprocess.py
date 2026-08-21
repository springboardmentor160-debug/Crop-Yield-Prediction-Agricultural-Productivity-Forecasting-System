import json
from pathlib import Path
import pandas as pd

def clean_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    for column in cleaned.columns:
        if cleaned[column].isna().any():
            if pd.api.types.is_numeric_dtype(cleaned[column]):
                cleaned[column] = cleaned[column].fillna(cleaned[column].median())
            else:
                cleaned[column] = cleaned[column].fillna(cleaned[column].mode(dropna=True).iloc[0])
    return cleaned

def main():
    BASE_DIR = Path(__file__).resolve().parent.parent / "datasets"
    raw_dir = BASE_DIR / "raw"
    processed_dir = BASE_DIR / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    # 1. Crop Recommendation Processing
    crop_input = raw_dir / "Crop_recommendation.csv"
    crop_output = processed_dir / "Crop_recommendation_processed.csv"
    
    print(f"Reading {crop_input}...")
    crop_df = pd.read_csv(crop_input)
    crop_df = crop_df.drop_duplicates().reset_index(drop=True)
    crop_df = clean_missing_values(crop_df)
    crop_df['label'] = crop_df['label'].astype(str).str.strip()
    
    label_map = {label: idx for idx, label in enumerate(sorted(crop_df['label'].unique()))}
    crop_df['label_encoded'] = crop_df['label'].map(label_map).astype('int64')
    crop_df.to_csv(crop_output, index=False)
    
    print('Crop dataset processed')
    print('Shape:', crop_df.shape)
    
    # 2. Yield DF Processing
    yield_input = raw_dir / "yield_df.csv"
    yield_output = processed_dir / "yield_df_processed.csv"
    
    print(f"Reading {yield_input}...")
    yield_df = pd.read_csv(yield_input)
    if 'Unnamed: 0' in yield_df.columns:
        yield_df = yield_df.drop(columns=['Unnamed: 0'])
    yield_df = yield_df.drop_duplicates().reset_index(drop=True)
    yield_df = clean_missing_values(yield_df)
    yield_df['Area'] = yield_df['Area'].astype(str).str.strip()
    yield_df['Item'] = yield_df['Item'].astype(str).str.strip()
    
    yield_df = pd.get_dummies(yield_df, columns=['Area', 'Item'], drop_first=True, dtype='int64')
    yield_df.to_csv(yield_output, index=False)
    
    print('Yield dataset processed')
    print('Shape:', yield_df.shape)
    
    # 3. Save report
    report = {
        'crop_recommendation': {
            'input': crop_input.name,
            'output': crop_output.name,
            'shape': list(crop_df.shape),
            'missing_values': int(crop_df.isna().sum().sum()),
            'duplicates': int(crop_df.duplicated().sum()),
            'label_map': label_map,
        },
        'yield_df': {
            'input': yield_input.name,
            'output': yield_output.name,
            'shape': list(yield_df.shape),
            'missing_values': int(yield_df.isna().sum().sum()),
            'duplicates': int(yield_df.duplicated().sum()),
        },
    }
    
    report_path = processed_dir / 'preprocessing_report.json'
    report_path.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print('Report saved:', report_path)

if __name__ == "__main__":
    main()
