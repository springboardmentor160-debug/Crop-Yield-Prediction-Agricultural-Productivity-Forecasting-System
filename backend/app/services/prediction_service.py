from app.ml_service import predict_yield as raw_predict_yield
from app.analytics import analyze_weather as raw_analyze_weather
from app.analytics import analyze_soil as raw_analyze_soil

def get_yield_prediction(payload):
    result = raw_predict_yield(payload)
    # Ensure format matches both simple mentor format and detailed response
    predicted_yield = result["predicted_yield_kg_per_ha"]
    return {
        "predicted_yield": predicted_yield,
        "predicted_yield_kg_per_ha": predicted_yield,
        "unit": "kg/ha",
        "confidence_score": result.get("confidence_score", 0.0),
        "accuracy": f"{int(result.get('confidence_score', 0))}%",
        "crop_name": getattr(payload, "crop_name", "Rice") or "Rice",
        "weather_analysis": result.get("weather_analysis", {}),
        "soil_analysis": result.get("soil_analysis", {}),
        "model": result.get("model", {}),
        "prediction_interval": result.get("prediction_interval", {}),
        "contributing_factors": result.get("contributing_factors", []),
    }

def get_weather_analysis(avg_temp: float, rainfall: float, humidity: float = 65.0):
    analysis = raw_analyze_weather(avg_temp, rainfall)
    return {
        "avg_temp": avg_temp,
        "temperature": avg_temp,
        "rainfall": rainfall,
        "humidity": humidity,
        "score": analysis["score"],
        "summary": f"{analysis['temperature_status']}. {analysis['impact_summary']}",
        "temperature_status": analysis["temperature_status"],
        "rainfall_status": analysis["rainfall_status"],
        "impact_summary": analysis["impact_summary"],
        "future_readiness": "Optimal for seasonal crop operations"
    }

def get_soil_analysis(soil_ph: float, nitrogen: float = None, phosphorus: float = None, potassium: float = None, organic_matter: float = None):
    analysis = raw_analyze_soil(soil_ph, nitrogen, phosphorus, potassium, organic_matter)
    
    # Map numerical score to high-level qualitative soil rating requested in mentor guide
    score = analysis.get("score", 75.0)
    if score >= 75:
        soil_quality = "Good"
    elif score >= 50:
        soil_quality = "Moderate"
    else:
        soil_quality = "Poor"

    return {
        "ph": soil_ph,
        "soil_ph": soil_ph,
        "nitrogen": nitrogen or 0.0,
        "phosphorus": phosphorus or 0.0,
        "potassium": potassium or 0.0,
        "organic_matter": organic_matter or 0.0,
        "score": score,
        "soil_quality": soil_quality,
        "suitability": analysis.get("suitability", "High"),
        "ph_status": analysis.get("ph_status", "Crop-suitable pH"),
        "recommendation": analysis.get("recommendation", "Suitable for rice")
    }
