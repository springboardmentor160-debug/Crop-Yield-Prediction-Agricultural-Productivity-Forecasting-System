def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def analyze_weather(avg_temp: float, rainfall: float) -> dict:
    rainfall_score = 100 - min(abs(rainfall - 850) / 850 * 100, 100)
    temp_score = 100 - min(abs(avg_temp - 26) / 26 * 100, 100)
    score = round(clamp((rainfall_score * 0.55) + (temp_score * 0.45), 0, 100), 1)

    if rainfall < 450:
        rainfall_status = "Low rainfall stress"
        weather_impact = "Irrigation support is recommended before peak growth."
    elif rainfall > 1400:
        rainfall_status = "Excess rainfall risk"
        weather_impact = "Monitor drainage and fungal disease pressure."
    else:
        rainfall_status = "Favorable rainfall"
        weather_impact = "Rainfall is within a productive crop-growth band."

    if avg_temp < 18:
        temperature_status = "Cool temperature risk"
    elif avg_temp > 34:
        temperature_status = "Heat stress risk"
    else:
        temperature_status = "Stable temperature"

    return {
        "score": score,
        "rainfall_status": rainfall_status,
        "temperature_status": temperature_status,
        "impact_summary": weather_impact,
    }


def analyze_soil(
    soil_ph: float,
    nitrogen: float | None = None,
    phosphorus: float | None = None,
    potassium: float | None = None,
    organic_matter: float | None = None,
) -> dict:
    ph_score = 100 - min(abs(soil_ph - 6.8) / 6.8 * 100, 100)
    nutrient_values = [value for value in [nitrogen, phosphorus, potassium] if value is not None]
    nutrient_score = 70.0
    if nutrient_values:
        nutrient_score = sum(clamp(value, 0, 100) for value in nutrient_values) / len(nutrient_values)
    organic_score = 70.0 if organic_matter is None else clamp(organic_matter * 20, 0, 100)
    score = round(clamp((ph_score * 0.45) + (nutrient_score * 0.35) + (organic_score * 0.2), 0, 100), 1)

    if soil_ph < 5.8:
        ph_status = "Acidic soil"
        recommendation = "Apply lime and retest pH before fertilizer planning."
    elif soil_ph > 7.8:
        ph_status = "Alkaline soil"
        recommendation = "Use organic amendments and monitor micronutrient availability."
    else:
        ph_status = "Crop-suitable pH"
        recommendation = "Soil pH is suitable for most cereal and vegetable crops."

    if score >= 75:
        suitability = "High"
    elif score >= 55:
        suitability = "Medium"
    else:
        suitability = "Low"

    return {
        "score": score,
        "suitability": suitability,
        "ph_status": ph_status,
        "recommendation": recommendation,
    }
