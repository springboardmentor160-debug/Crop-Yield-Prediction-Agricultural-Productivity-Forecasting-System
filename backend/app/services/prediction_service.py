"""
YieldSense AI  -  Prediction Service

Orchestrates the full prediction pipeline:
  1. Validate input
  2. Fetch weather data (optional)
  3. Analyze soil health
  4. Prepare feature vector
  5. Load model + predict
  6. Run Risk Assessment
  7. Generate Recommendations
  8. Auto-save to prediction history
  9. Fire notification
 10. Assemble structured response
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.services.weather_service import get_current_weather
from app.services.soil_service import analyze_soil


async def predict_yield(input_data: Dict[str, Any], user_id: Optional[str] = None,
                         farm_id: Optional[str] = None, farm_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Run the full prediction pipeline.

    Args:
        input_data: Validated prediction request data.
        user_id: Optional Firebase UID (used for history saving).
        farm_id: Optional farm ID to associate with the prediction.
        farm_name: Optional farm display name.

    Returns:
        Structured prediction response dictionary.
    """
    # ---- Step 1: Fetch weather (if coordinates provided) ----
    weather_summary = None
    lat = input_data.get("latitude")
    lon = input_data.get("longitude")

    if lat is not None and lon is not None:
        try:
            weather_data = await get_current_weather(lat, lon)
            weather_summary = {
                "temperature": weather_data.get("temperature", input_data.get("temperature", 25)),
                "humidity": weather_data.get("humidity", input_data.get("humidity", 60)),
                "rainfall": weather_data.get("rainfall", 0),
                "wind_speed": weather_data.get("wind_speed", 0),
                "description": weather_data.get("description", "N/A"),
                "source": "Open-Meteo",
            }
        except Exception:
            weather_summary = None

    # ---- Step 2: Soil analysis ----
    soil_result = analyze_soil(
        soil_ph=input_data["soil_ph"],
        nitrogen=input_data["nitrogen"],
        phosphorus=input_data["phosphorus"],
        potassium=input_data["potassium"],
        crop=input_data.get("crop"),
    )

    soil_summary = {
        "health_score": soil_result["health_score"],
        "health_label": soil_result["health_label"],
        "ph_status": soil_result["ph_status"],
        "warnings": soil_result["warnings"],
        "suggestions": soil_result["suggestions"],
    }

    # ---- Step 3: Load model and predict ----
    from ml.inference.predictor import CropYieldPredictor

    predictor = CropYieldPredictor.get_instance()

    # Build feature dict matching training schema
    feature_input = {
        "crop": input_data["crop"],
        "season": input_data.get("season", "Kharif"),
        "state": input_data.get("state", "Unknown"),
        "area": input_data["area"],
        "production": input_data.get("production", 0),
        "annual_rainfall": input_data["annual_rainfall"],
        "fertilizer_usage": input_data.get("fertilizer_usage", 100),
        "pesticide_usage": input_data.get("pesticide_usage", 10),
        "temperature": input_data["temperature"],
        "soil_ph": input_data["soil_ph"],
        "nitrogen": input_data["nitrogen"],
        "phosphorus": input_data["phosphorus"],
        "potassium": input_data["potassium"],
    }

    prediction_result = predictor.predict(feature_input)

    # ---- Step 4: Assemble base response ----
    predicted_yield = prediction_result["predicted_yield"]
    area = input_data["area"]
    total_production = round(predicted_yield * area, 2)

    response = {
        "predicted_yield": predicted_yield,
        "prediction_unit": prediction_result["prediction_unit"],
        "total_production": total_production,
        "crop": input_data["crop"],
        "area": area,
        "season": input_data.get("season", "Kharif"),
        "model_used": prediction_result["model_used"],
        "model_accuracy": prediction_result["model_accuracy"],
        "confidence": prediction_result["confidence"],
        "weather_summary": weather_summary,
        "soil_summary": soil_summary,
        "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # ---- Step 5: Risk Assessment ----
    risk_data = None
    try:
        from app.services.risk_service import assess_risk
        risk_input = {
            "crop": input_data["crop"],
            "temperature": input_data["temperature"],
            "annual_rainfall": input_data["annual_rainfall"],
            "humidity": input_data.get("humidity", 60),
            "soil_ph": input_data["soil_ph"],
            "nitrogen": input_data["nitrogen"],
            "phosphorus": input_data["phosphorus"],
            "potassium": input_data["potassium"],
            "predicted_yield": predicted_yield,
            "season": input_data.get("season", "Kharif"),
        }
        risk_data = assess_risk(risk_input)
        response["risk_assessment"] = risk_data
    except Exception:
        response["risk_assessment"] = None

    # ---- Step 6: Recommendations ----
    try:
        from app.services.recommendation_service import generate_recommendations
        rec_input = {
            "crop": input_data["crop"],
            "temperature": input_data["temperature"],
            "annual_rainfall": input_data["annual_rainfall"],
            "humidity": input_data.get("humidity", 60),
            "soil_ph": input_data["soil_ph"],
            "nitrogen": input_data["nitrogen"],
            "phosphorus": input_data["phosphorus"],
            "potassium": input_data["potassium"],
            "predicted_yield": predicted_yield,
            "season": input_data.get("season", "Kharif"),
            "area": input_data.get("area"),
            "state": input_data.get("state"),
            "weather_summary": weather_summary,
        }
        recommendations = generate_recommendations(rec_input)
        response["recommendations"] = recommendations
    except Exception:
        response["recommendations"] = None

    # ---- Step 7: Auto-save to history (if user is authenticated) ----
    saved_id = None
    if user_id:
        try:
            from app.services.history_service import HistoryService
            history_svc = HistoryService()
            saved = history_svc.save_prediction(
                user_id=user_id,
                prediction_data=response,
                input_data=input_data,
                risk_data=risk_data,
                farm_id=farm_id,
                farm_name=farm_name,
            )
            saved_id = saved.get("id")
            response["prediction_id"] = saved_id
        except Exception:
            response["prediction_id"] = None

    # ---- Step 8: Fire notifications (if user is authenticated) ----
    if user_id:
        try:
            from app.services.notification_service import NotificationService
            notif_svc = NotificationService()

            # Prediction completed notification
            crop_name = input_data["crop"]
            yield_val = predicted_yield
            notif_svc.create_notification(
                user_id=user_id,
                title="Prediction Completed",
                message=f"Yield prediction for {crop_name}: {yield_val:.2f} tons/ha ({prediction_result['confidence']} confidence).",
                notification_type="success",
                link="/prediction",
            )

            # High risk notification
            if risk_data and risk_data.get("overall_risk_level") in ("High", "Critical"):
                risk_level = risk_data["overall_risk_level"]
                notif_svc.create_notification(
                    user_id=user_id,
                    title=f"{risk_level} Risk Detected",
                    message=f"{risk_level} agricultural risk detected for {crop_name}. {risk_data.get('priority_reason', 'Review risk assessment.')}",
                    notification_type="warning" if risk_level == "High" else "error",
                    link="/prediction",
                )
        except Exception:
            pass  # Notifications are non-critical

    return response
