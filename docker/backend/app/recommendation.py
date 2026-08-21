# backend/app/recommendation.py
"""
Rule-based recommendation and risk assessment logic.

Deliberately NOT a machine learning model — this is simple if/elif logic
over values you already compute elsewhere in the pipeline (soil pH,
predicted yield, historical average yield, rainfall deviation). Rule-based
systems like this are a legitimate, expected approach when the rules
themselves are well-understood domain knowledge (e.g. "pH below 5.5 is
acidic for most crops").

This module is intentionally decoupled from the DB/ORM — it takes plain
numbers in and returns plain data out, so it's trivial to unit test and
easy to reuse from both `routers/recommendations.py` and
`routers/risk.py` without duplicating the thresholds in two places.
"""

from typing import List

def generate_recommendation(
    soil_ph: float,
    predicted_yield: float,
    avg_yield: float,
    rainfall_deviation: float,
) -> List[str]:
    """
    Returns a list of plain-English recommendation strings based on
    soil, yield, and weather signals.

    Args:
        soil_ph: current soil pH reading
        predicted_yield: this farm's predicted yield (tons/ha)
        avg_yield: this farm's (or the platform's) historical average yield
        rainfall_deviation: % deviation from normal rainfall, positive or negative
    """
    tips: List[str] = []

    # Soil check — thresholds reflect standard agronomic ranges, not
    # arbitrary numbers: most crops tolerate pH 5.5–7.5.
    if soil_ph < 5.5:
        tips.append("Soil is acidic — consider applying lime to raise pH.")
    elif soil_ph > 7.5:
        tips.append("Soil is alkaline — consider adding organic compost.")

    # Yield check — scaled by avg_yield rather than a hardcoded number,
    # so the same logic works for a 1-hectare plot or a 100-hectare farm.
    if avg_yield > 0 and predicted_yield < avg_yield * 0.8:
        tips.append("Predicted yield is below average — review irrigation and fertilizer schedule.")
    elif avg_yield > 0 and predicted_yield > avg_yield * 1.1:
        tips.append("Predicted yield is above average — maintain current practices.")

    # Weather check — deviation in either direction matters
    if rainfall_deviation < -20:
        tips.append("Rainfall is significantly below normal — increase irrigation frequency.")
    elif rainfall_deviation > 20:
        tips.append("Rainfall is significantly above normal — monitor drainage and waterlogging.")

    if not tips:
        tips.append("All indicators look normal — continue current farming practices.")

    return tips


def assess_risk(
    predicted_yield: float,
    avg_yield: float,
    rainfall_deviation: float,
    soil_ph: float,
) -> str:
    """
    Combines yield, weather, and soil signals into a single Low/Medium/High
    risk label using a simple additive scoring system — more severe
    deviations contribute more points than borderline ones.
    """
    risk_score = 0

    if avg_yield > 0:
        if predicted_yield < avg_yield * 0.7:
            risk_score += 2
        elif predicted_yield < avg_yield * 0.9:
            risk_score += 1

    if abs(rainfall_deviation) > 30:
        risk_score += 2
    elif abs(rainfall_deviation) > 15:
        risk_score += 1

    if soil_ph < 5.0 or soil_ph > 8.0:
        risk_score += 1

    if risk_score >= 4:
        return "High"
    elif risk_score >= 2:
        return "Medium"
    else:
        return "Low"


def generate_recommendation_and_risk(
    soil_ph: float,
    predicted_yield: float,
    avg_yield: float,
    rainfall_deviation: float,
) -> dict:
    """
    Convenience wrapper — bundles both results into one dict, matching
    the shape the /recommendations endpoint returns to the frontend.
    """
    return {
        "recommendations": generate_recommendation(
            soil_ph, predicted_yield, avg_yield, rainfall_deviation
        ),
        "risk_level": assess_risk(
            predicted_yield, avg_yield, rainfall_deviation, soil_ph
        ),
    }
