from fastapi import APIRouter, Depends, HTTPException
from auth_handler import get_current_user
from database import get_db_cursor
from services import weather_service, ml_service

router = APIRouter(prefix="/api/v1/analysis", tags=["Analysis"])

@router.post("/{farm_id}/analyze")
def run_agricultural_analysis(farm_id: int, crop: str = "", user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    
    # 1. Fetch Farm
    with get_db_cursor() as cur:
        cur.execute("SELECT * FROM farms WHERE id = %s", (farm_id,))
        farm = cur.fetchone()
        
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != user_id and user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
        
    lat, lon = farm["latitude"], farm["longitude"]
    n, p, k, ph = farm["soil_n"], farm["soil_p"], farm["soil_k"], farm["soil_ph"]
    
    # 2. Weather & Geocoding
    weather = weather_service.get_current_weather(lat, lon)
    country = weather_service.get_country_from_coordinates(lat, lon)
    
    # Save Weather Observation
    with get_db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO weather_observations (farm_id, temperature, humidity, rainfall)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (farm_id, weather["temperature"], weather["humidity"], weather["rainfall"])
        )
    
    # 3. Yield Prediction
    predicted_yield = 0.0
    if crop:
        predicted_yield = ml_service.predict_yield(
            area=country,
            crop=crop,
            rain=weather["rainfall"],
            temp=weather["temperature"]
        )
        # Save Prediction
        with get_db_cursor() as cur:
            cur.execute(
                """
                INSERT INTO yield_predictions (farm_id, crop, predicted_yield, yield_unit, model_version)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (farm_id, crop, predicted_yield, "tons/ha", "rf_v1")
            )
            
    # 4. Recommendation Prediction
    rec = ml_service.recommend_crop(
        n=n, p=p, k=k, 
        temp=weather["temperature"], 
        humidity=weather["humidity"], 
        ph=ph, 
        rainfall=weather["rainfall"]
    )
    
    with get_db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO recommendations (farm_id, recommended_crop, confidence, model_version)
            VALUES (%s, %s, %s, %s)
            """,
            (farm_id, rec["recommended_crop"], rec["confidence"], "rf_v1")
        )
        
    # 5. Risk Assessment (Blocked due to missing data)
    risk_level = "Blocked (Missing Data)"
    
    return {
        "farm_id": farm_id,
        "crop": crop,
        "predicted_yield": predicted_yield,
        "yield_unit": "tons/ha",
        "recommendation": rec["recommended_crop"],
        "recommendation_confidence": rec["confidence"],
        "risk_level": risk_level,
        "weather": weather,
        "model_versions": {
            "yield": "rf_v1",
            "recommendation": "rf_v1",
            "risk": "none"
        }
    }

@router.get("/{farm_id}/latest")
def get_latest_analysis(farm_id: int, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    
    with get_db_cursor() as cur:
        cur.execute("SELECT user_id FROM farms WHERE id = %s", (farm_id,))
        farm = cur.fetchone()
        
    if not farm or (farm["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Get latest data
    with get_db_cursor() as cur:
        cur.execute("SELECT * FROM yield_predictions WHERE farm_id = %s ORDER BY created_at DESC LIMIT 1", (farm_id,))
        pred = cur.fetchone()
        
        cur.execute("SELECT * FROM recommendations WHERE farm_id = %s ORDER BY created_at DESC LIMIT 1", (farm_id,))
        rec = cur.fetchone()
        
        cur.execute("SELECT * FROM weather_observations WHERE farm_id = %s ORDER BY recorded_at DESC LIMIT 1", (farm_id,))
        weather = cur.fetchone()
        
    return {
        "prediction": pred,
        "recommendation": rec,
        "weather": weather,
        "risk_level": "Blocked (Missing Data)"
    }

@router.get("/{farm_id}/history")
def get_analysis_history(farm_id: int, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    
    with get_db_cursor() as cur:
        cur.execute("SELECT user_id FROM farms WHERE id = %s", (farm_id,))
        farm = cur.fetchone()
        
    if not farm or (farm["user_id"] != user_id and user.get("role") != "Admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    with get_db_cursor() as cur:
        cur.execute("SELECT * FROM yield_predictions WHERE farm_id = %s ORDER BY created_at DESC LIMIT 50", (farm_id,))
        predictions = cur.fetchall()
        
        cur.execute("SELECT * FROM recommendations WHERE farm_id = %s ORDER BY created_at DESC LIMIT 50", (farm_id,))
        recommendations = cur.fetchall()
        
        cur.execute("SELECT * FROM weather_observations WHERE farm_id = %s ORDER BY recorded_at DESC LIMIT 50", (farm_id,))
        weather = cur.fetchall()
        
        # Risk history is blocked
        risk = []
        
    return {
        "predictions": predictions,
        "recommendations": recommendations,
        "weather": weather,
        "risk": risk
    }
