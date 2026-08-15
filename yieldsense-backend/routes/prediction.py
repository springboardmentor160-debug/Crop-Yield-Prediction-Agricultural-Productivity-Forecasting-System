from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import joblib


router = APIRouter()


# =========================================================
# Load trained ML model
# =========================================================

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "processed"
    / "crop_yield_model.pkl"
)

try:
    model = joblib.load(MODEL_PATH)
    print("✅ Crop yield model loaded successfully")

except Exception as e:
    model = None
    print(f"❌ Error loading model: {e}")


# =========================================================
# Request Model
# =========================================================

class PredictionRequest(BaseModel):
    area: int
    item: int
    year: int
    rainfall: float
    pesticides: float
    temperature: float


# =========================================================
# Prediction Endpoint
# =========================================================

@router.post("/predict-yield")
def predict_yield(data: PredictionRequest):

    # Check whether model was loaded
    if model is None:
        raise HTTPException(
            status_code=500,
            detail="ML model could not be loaded."
        )

    try:

        # =================================================
        # Prepare input features
        # =================================================
        # IMPORTANT:
        # The order must be the same as the training order:
        #
        # Area
        # Item
        # Year
        # average_rain_fall_mm_per_year
        # pesticides_tonnes
        # avg_temp
        # =================================================

        features = [[
            data.area,
            data.item,
            data.year,
            data.rainfall,
            data.pesticides,
            data.temperature
        ]]

        # =================================================
        # Generate prediction
        # =================================================

        prediction = model.predict(features)

        predicted_yield = float(prediction[0])

        # =================================================
        # Return response
        # =================================================

        return {
            "area": data.area,
            "item": data.item,
            "year": data.year,
            "rainfall": data.rainfall,
            "pesticides": data.pesticides,
            "temperature": data.temperature,
            "predicted_yield": round(predicted_yield, 2)
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )