"""
YieldSense AI  -  Soil Analysis Service

Rule-based soil health analyzer. Evaluates pH, NPK levels,
and provides crop-specific suitability ratings and recommendations.
"""

from typing import Dict, List, Optional, Tuple


# ============================================================
# Optimal Ranges (based on agricultural science)
# ============================================================

# General optimal ranges for major nutrients (kg/ha)
NUTRIENT_RANGES = {
    "nitrogen": {
        "low": (0, 50),
        "medium": (50, 100),
        "high": (100, 200),
        "optimal": (60, 120),
    },
    "phosphorus": {
        "low": (0, 20),
        "medium": (20, 50),
        "high": (50, 150),
        "optimal": (25, 60),
    },
    "potassium": {
        "low": (0, 15),
        "medium": (15, 35),
        "high": (35, 100),
        "optimal": (20, 45),
    },
}

# pH classifications
PH_RANGES = {
    "Strongly Acidic": (0, 4.5),
    "Moderately Acidic": (4.5, 5.5),
    "Slightly Acidic": (5.5, 6.5),
    "Neutral": (6.5, 7.5),
    "Slightly Alkaline": (7.5, 8.5),
    "Moderately Alkaline": (8.5, 9.5),
    "Strongly Alkaline": (9.5, 14.0),
}

# Crop-specific optimal pH ranges
CROP_PH_PREFERENCES: Dict[str, Tuple[float, float]] = {
    "rice": (5.5, 7.0),
    "wheat": (6.0, 7.5),
    "maize": (5.5, 7.5),
    "cotton": (6.0, 8.0),
    "sugarcane": (6.0, 7.5),
    "soybean": (6.0, 7.0),
    "potato": (5.0, 6.5),
    "groundnut": (5.5, 7.0),
    "tomato": (6.0, 7.0),
    "banana": (5.5, 7.0),
    "coffee": (5.0, 6.5),
    "tea": (4.5, 6.0),
    "coconut": (5.5, 7.0),
    "turmeric": (5.5, 7.5),
    "pepper": (5.5, 7.0),
}


def analyze_soil(
    soil_ph: float,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    moisture: Optional[float] = None,
    organic_matter: Optional[float] = None,
    crop: Optional[str] = None,
) -> dict:
    """
    Perform comprehensive soil analysis.

    Args:
        soil_ph: Soil pH level (0-14)
        nitrogen: Nitrogen content (kg/ha)
        phosphorus: Phosphorus content (kg/ha)
        potassium: Potassium content (kg/ha)
        moisture: Soil moisture percentage (optional)
        organic_matter: Organic matter percentage (optional)
        crop: Crop type for suitability analysis (optional)

    Returns:
        Dictionary with health_score, ratings, warnings, suggestions.
    """
    warnings: List[str] = []
    suggestions: List[str] = []
    score_components: List[float] = []

    # ---- pH Analysis ----
    ph_status = _classify_ph(soil_ph)
    ph_score = _score_ph(soil_ph)
    score_components.append(ph_score)

    if soil_ph < 5.5:
        warnings.append("Soil is too acidic for most crops")
        suggestions.append("Consider applying lime to raise pH")
    elif soil_ph > 8.5:
        warnings.append("Soil is too alkaline for most crops")
        suggestions.append("Consider adding sulfur or organic matter to lower pH")

    # ---- Nutrient Analysis ----
    nutrient_ratings = []

    # Nitrogen
    n_status, n_score, n_color = _rate_nutrient("nitrogen", nitrogen)
    score_components.append(n_score)
    nutrient_ratings.append({
        "name": "Nitrogen (N)",
        "value": nitrogen,
        "unit": "kg/ha",
        "status": n_status,
        "color": n_color,
    })
    if n_status == "Low":
        warnings.append("Nitrogen levels are low  -  may limit plant growth")
        suggestions.append("Apply nitrogen-rich fertilizers (urea, ammonium sulfate)")
    elif n_status == "High":
        suggestions.append("Reduce nitrogen fertilizer to prevent nutrient burn")

    # Phosphorus
    p_status, p_score, p_color = _rate_nutrient("phosphorus", phosphorus)
    score_components.append(p_score)
    nutrient_ratings.append({
        "name": "Phosphorus (P)",
        "value": phosphorus,
        "unit": "kg/ha",
        "status": p_status,
        "color": p_color,
    })
    if p_status == "Low":
        warnings.append("Phosphorus is deficient  -  root development may suffer")
        suggestions.append("Apply phosphatic fertilizers (DAP, SSP)")

    # Potassium
    k_status, k_score, k_color = _rate_nutrient("potassium", potassium)
    score_components.append(k_score)
    nutrient_ratings.append({
        "name": "Potassium (K)",
        "value": potassium,
        "unit": "kg/ha",
        "status": k_status,
        "color": k_color,
    })
    if k_status == "Low":
        warnings.append("Potassium levels are low  -  may reduce disease resistance")
        suggestions.append("Apply potash fertilizers (MOP, SOP)")

    # ---- Overall Health Score ----
    health_score = round(sum(score_components) / len(score_components), 1)

    if health_score >= 80:
        health_label = "Excellent"
    elif health_score >= 60:
        health_label = "Good"
    elif health_score >= 40:
        health_label = "Fair"
    else:
        health_label = "Poor"

    # ---- Crop Suitability ----
    suitability_rating = None
    if crop:
        suitability_rating = _assess_crop_suitability(
            crop.lower(), soil_ph, nitrogen, phosphorus, potassium
        )
        if suitability_rating == "Poor":
            suggestions.append(
                f"Consider improving soil conditions before planting {crop}"
            )

    # ---- Moisture Analysis ----
    if moisture is not None:
        if moisture < 20:
            warnings.append("Soil moisture is very low  -  irrigation recommended")
            suggestions.append("Increase watering frequency or add mulch to retain moisture")
        elif moisture > 80:
            warnings.append("Soil moisture is excessively high  -  drainage may be needed")

    # ---- Organic Matter ----
    if organic_matter is not None:
        if organic_matter < 2:
            suggestions.append("Add compost or green manure to improve organic matter content")

    # If no warnings, add a positive note
    if not warnings:
        suggestions.insert(0, "Soil conditions are generally favorable for cultivation")

    return {
        "health_score": health_score,
        "health_label": health_label,
        "ph_status": ph_status,
        "nutrient_ratings": nutrient_ratings,
        "suitability_rating": suitability_rating,
        "warnings": warnings,
        "suggestions": suggestions,
    }


def _classify_ph(ph: float) -> str:
    """Classify soil pH into a category."""
    for label, (low, high) in PH_RANGES.items():
        if low <= ph < high:
            return label
    return "Unknown"


def _score_ph(ph: float) -> float:
    """Score pH on a 0-100 scale. Optimal is 6.0-7.5."""
    if 6.0 <= ph <= 7.5:
        return 100.0
    elif 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0:
        return 75.0
    elif 5.0 <= ph < 5.5 or 8.0 < ph <= 8.5:
        return 50.0
    elif 4.5 <= ph < 5.0 or 8.5 < ph <= 9.0:
        return 30.0
    else:
        return 15.0


def _rate_nutrient(name: str, value: float) -> Tuple[str, float, str]:
    """
    Rate a nutrient level.

    Returns:
        Tuple of (status, score_0_to_100, color)
    """
    ranges = NUTRIENT_RANGES.get(name, {})
    optimal = ranges.get("optimal", (0, 100))

    if optimal[0] <= value <= optimal[1]:
        return "Optimal", 100.0, "green"
    elif value < ranges.get("low", (0, 0))[1]:
        return "Low", 25.0, "red"
    elif value < optimal[0]:
        return "Medium", 60.0, "yellow"
    elif value > optimal[1]:
        # High but not excessive
        return "High", 70.0, "blue"
    else:
        return "Medium", 50.0, "yellow"


def _assess_crop_suitability(
    crop: str,
    ph: float,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
) -> str:
    """Assess how suitable the soil is for a specific crop."""
    score = 0
    checks = 0

    # pH suitability
    ph_range = CROP_PH_PREFERENCES.get(crop)
    if ph_range:
        checks += 1
        if ph_range[0] <= ph <= ph_range[1]:
            score += 1
        elif abs(ph - ph_range[0]) <= 0.5 or abs(ph - ph_range[1]) <= 0.5:
            score += 0.5

    # Nutrient availability
    for name, value in [("nitrogen", nitrogen), ("phosphorus", phosphorus), ("potassium", potassium)]:
        checks += 1
        ranges = NUTRIENT_RANGES.get(name, {})
        optimal = ranges.get("optimal", (0, 100))
        if optimal[0] <= value <= optimal[1]:
            score += 1
        elif value >= ranges.get("low", (0, 0))[1]:
            score += 0.5

    if checks == 0:
        return "Unknown"

    ratio = score / checks
    if ratio >= 0.8:
        return "Excellent"
    elif ratio >= 0.6:
        return "Good"
    elif ratio >= 0.4:
        return "Fair"
    else:
        return "Poor"
