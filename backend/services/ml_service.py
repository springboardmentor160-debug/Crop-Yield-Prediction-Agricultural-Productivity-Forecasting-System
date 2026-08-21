import joblib
import pandas as pd
import os
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")

# Load Models (cached in memory)
try:
    yield_model = joblib.load(os.path.join(MODELS_DIR, "yield_model.joblib"))
    recommendation_model = joblib.load(os.path.join(MODELS_DIR, "recommendation_model.joblib"))
    recommendation_classes = joblib.load(os.path.join(MODELS_DIR, "recommendation_classes.joblib"))
except Exception as e:
    print(f"Warning: ML Models not loaded. {e}")
    yield_model = None
    recommendation_model = None
    recommendation_classes = []

def predict_yield(area: str, crop: str, rain: float, temp: float) -> float:
    if not yield_model:
        return 0.0
    
    current_year = datetime.datetime.now().year
    # Convert input to DataFrame exactly as expected by ColumnTransformer
    input_df = pd.DataFrame([{
        'Area': area,
        'Item': crop,
        'Year': current_year,
        'average_rain_fall_mm_per_year': rain * 365, # rough estimate if daily rain is given
        'avg_temp': temp
    }])
    
    try:
        prediction = yield_model.predict(input_df)[0]
        return round(float(prediction), 2)
    except Exception as e:
        print(f"Yield Prediction failed: {e}")
        return 0.0

def recommend_crop(n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float):
    if not recommendation_model:
        return {"recommended_crop": "Unknown", "confidence": 0.0}
    
    # Fill defaults if missing
    input_data = [[
        n or 0.0, 
        p or 0.0, 
        k or 0.0, 
        temp, 
        humidity, 
        ph or 7.0, 
        rainfall * 100 # Adjusting scale for rainfall mm
    ]]
    
    try:
        probabilities = recommendation_model.predict_proba(input_data)[0]
        max_prob_idx = probabilities.argmax()
        confidence = probabilities[max_prob_idx]
        predicted_crop = recommendation_classes[max_prob_idx]
        return {
            "recommended_crop": str(predicted_crop),
            "confidence": round(float(confidence), 2)
        }
    except Exception as e:
        print(f"Recommendation failed: {e}")
        return {"recommended_crop": "Unknown", "confidence": 0.0}
