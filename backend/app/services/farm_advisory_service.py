"""
YieldSense AI  -  Farm Advisory Service

Implements the rule-based Recommendation Engine and Risk Assessment.

Design principles:
  - Deterministic: same inputs always produce same outputs
  - Explainable: each recommendation has a clear reason
  - Testable: pure functions with no side effects
  - Safe: missing data skips rules, never crashes
  - Centralized thresholds: modify once, affects all rules

Data sources (all from existing Firestore collections):
  - soil_ph         → farm document (FARMS_COLLECTION)
  - crop            → farm document
  - predicted_yield → most recent prediction in PREDICTION_HISTORY_COLLECTION
  - avg_yield       → mean of all predictions for this farm
  - annual_rainfall → most recent prediction input
  - rainfall_deviation → annual_rainfall minus crop water requirement baseline
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.firebase.firestore import get_firestore_client, FARMS_COLLECTION, PREDICTION_HISTORY_COLLECTION
from app.utils.exceptions import NotFoundException, ForbiddenException


# ============================================================
# Centralized Thresholds (Agronomic Configuration)
# Change values here  -  all rules update automatically.
# ============================================================

# Soil pH rules (§3)
SOIL_ACIDIC_THRESHOLD: float = 5.5
"""Soil pH below this triggers acidic soil recommendation."""

SOIL_ALKALINE_THRESHOLD: float = 7.5
"""Soil pH above this triggers alkaline soil recommendation."""

# Soil risk scoring (§11)
SOIL_HIGH_RISK_PH_LOW: float = 5.0
"""Soil pH below this adds 1 risk point (severe acidity)."""

SOIL_HIGH_RISK_PH_HIGH: float = 8.0
"""Soil pH above this adds 1 risk point (severe alkalinity)."""

# Yield rules (§4)
YIELD_LOW_THRESHOLD: float = 0.8
"""Predicted yield below avg × this triggers low-yield recommendation."""

YIELD_ABOVE_THRESHOLD: float = 1.1
"""Predicted yield above avg × this triggers above-average recommendation."""

# Yield risk scoring (§9)
YIELD_VERY_LOW_THRESHOLD: float = 0.7
"""Predicted yield below avg × this adds 2 risk points (§9 first condition)."""

YIELD_MODERATE_RISK: float = 0.9
"""Predicted yield below avg × this adds 1 risk point (§9 second condition)."""

# Rainfall rules (§5)
RAINFALL_WARNING_DEVIATION: float = 20.0
"""Rainfall deviation beyond ±this triggers recommendation."""

# Rainfall risk scoring (§10)
RAINFALL_HIGH_RISK: float = 30.0
"""abs(rainfall_deviation) above this adds 2 risk points."""

RAINFALL_MODERATE_RISK: float = 15.0
"""abs(rainfall_deviation) above this adds 1 risk point."""

# Risk level thresholds (§12)
RISK_HIGH_SCORE: int = 4
"""risk_score >= this → High"""

RISK_MEDIUM_SCORE: int = 2
"""risk_score >= this → Medium"""


# ============================================================
# Crop Water Requirements (for rainfall deviation calculation)
# These are already defined in recommendation_service.py and
# risk_service.py. Reproduced here to keep this module
# self-contained and independently testable.
# ============================================================

CROP_WATER_REQUIREMENTS: Dict[str, float] = {
    "Rice": 1200, "Wheat": 450, "Maize": 500, "Soybean": 450,
    "Cotton": 700, "Sugarcane": 1500, "Potato": 500, "Groundnut": 500,
    "Barley": 350, "Millets": 350, "Sorghum": 400, "Sunflower": 600,
    "Rapeseed": 400, "Mustard": 350, "Lentil": 300, "Chickpea": 400,
    "Jute": 1000, "Coffee": 1200, "Tea": 1500, "Coconut": 1200,
    "Banana": 1200, "Mango": 1000, "Tomato": 600, "Onion": 500,
    "Garlic": 400, "Ginger": 1500, "Turmeric": 1200, "Pepper": 1200,
    "Other": 700,
}

DEFAULT_CROP_WATER_REQUIREMENT: float = 700.0
"""Fallback water requirement when crop is unknown."""


# ============================================================
# Pure Rule Functions (independently testable  -  §21)
# These functions have no I/O or side effects.
# ============================================================

def generate_farm_recommendations(
    soil_ph: Optional[float],
    predicted_yield: Optional[float],
    avg_yield: Optional[float],
    rainfall_deviation: Optional[float],
) -> List[str]:
    """
    Generate plain-English agricultural recommendations based on farm data.

    Rules:
      - Soil pH < SOIL_ACIDIC_THRESHOLD → lime recommendation (§3)
      - Soil pH > SOIL_ALKALINE_THRESHOLD → organic compost recommendation (§3)
      - predicted_yield < avg_yield × YIELD_LOW_THRESHOLD → irrigation/fertilizer review (§4)
      - predicted_yield > avg_yield × YIELD_ABOVE_THRESHOLD → maintain practices (§4)
      - rainfall_deviation < -RAINFALL_WARNING_DEVIATION → increase irrigation (§5)
      - rainfall_deviation > +RAINFALL_WARNING_DEVIATION → monitor drainage (§5)
      - No rules fire → normal conditions fallback (§6)

    Missing data handling (§7):
      - If a value is None, rules requiring that value are skipped.
      - Other rules continue to evaluate normally.
      - The function never raises an exception due to missing data.
      - A zero is NOT substituted for None  -  the rule is simply skipped.

    Args:
        soil_ph: Soil pH reading. None if unavailable.
        predicted_yield: Most recent predicted yield (tons/ha). None if no history.
        avg_yield: Historical average yield (tons/ha). None if insufficient history.
        rainfall_deviation: Deviation of annual rainfall from crop baseline (mm).
                            Positive = above baseline, negative = below.
                            None if unavailable.

    Returns:
        List of plain-English recommendation strings. Never empty.
    """
    recommendations: List[str] = []

    # ---- Soil pH rules (§3) ----
    if soil_ph is not None:
        if soil_ph < SOIL_ACIDIC_THRESHOLD:
            recommendations.append(
                f"Soil is acidic (pH {soil_ph:.1f})  -  consider applying lime to raise pH above {SOIL_ACIDIC_THRESHOLD}."
            )
        elif soil_ph > SOIL_ALKALINE_THRESHOLD:
            recommendations.append(
                f"Soil is alkaline (pH {soil_ph:.1f})  -  consider adding organic compost to lower pH below {SOIL_ALKALINE_THRESHOLD}."
            )
        # pH within range → no contradictory recommendation

    # ---- Yield rules (§4) ----
    # Both predicted_yield and avg_yield must be available and avg_yield must be positive
    if predicted_yield is not None and avg_yield is not None and avg_yield > 0:
        if predicted_yield < avg_yield * YIELD_LOW_THRESHOLD:
            pct_below = round((1 - predicted_yield / avg_yield) * 100, 1)
            recommendations.append(
                f"Predicted yield ({predicted_yield:.2f} tons/ha) is {pct_below}% below your farm average "
                f"({avg_yield:.2f} tons/ha)  -  review irrigation and fertilizer schedules."
            )
        elif predicted_yield > avg_yield * YIELD_ABOVE_THRESHOLD:
            pct_above = round((predicted_yield / avg_yield - 1) * 100, 1)
            recommendations.append(
                f"Predicted yield ({predicted_yield:.2f} tons/ha) is {pct_above}% above your farm average "
                f"({avg_yield:.2f} tons/ha)  -  current farming practices are effective, continue as-is."
            )
        # Within normal range → no unnecessary advice (§4)

    # ---- Rainfall rules (§5) ----
    if rainfall_deviation is not None:
        if rainfall_deviation < -RAINFALL_WARNING_DEVIATION:
            recommendations.append(
                f"Rainfall is significantly below the crop baseline ({rainfall_deviation:.0f} mm)  -  "
                f"review and increase irrigation frequency to prevent yield loss."
            )
        elif rainfall_deviation > RAINFALL_WARNING_DEVIATION:
            recommendations.append(
                f"Rainfall is significantly above the crop baseline (+{rainfall_deviation:.0f} mm)  -  "
                f"monitor drainage and watch for waterlogging, which can damage roots."
            )
        # Within ±RAINFALL_WARNING_DEVIATION → no unnecessary advice (§5)

    # ---- Normal conditions fallback (§6) ----
    if not recommendations:
        recommendations.append(
            "All indicators look normal  -  continue current farming practices."
        )

    return recommendations


def assess_farm_risk(
    predicted_yield: Optional[float],
    avg_yield: Optional[float],
    rainfall_deviation: Optional[float],
    soil_ph: Optional[float],
) -> Dict[str, Any]:
    """
    Calculate farm risk level using a point-based scoring system.

    Scoring (§9–§11):
      - Yield risk:    predicted < avg × 0.7  → +2 pts
                       predicted < avg × 0.9  → +1 pt  (else-if, no double-counting)
      - Rainfall risk: abs(deviation) > 30    → +2 pts
                       abs(deviation) > 15    → +1 pt  (else-if, no double-counting)
      - Soil risk:     pH < 5.0 OR pH > 8.0  → +1 pt

    Final level (§12):
      - score >= 4 → High
      - score >= 2 → Medium
      - score < 2  → Low

    Missing data handling (§7):
      - None values cause that specific rule to be skipped (score += 0).
      - Other rules evaluate normally.

    Returns:
        Dict with risk_score, risk_level, identified_risks, priority_level, etc.
    """
    risk_score: int = 0
    identified_risks: List[Dict[str, str]] = []

    # ---- Yield risk (§9)  -  no double-counting ----
    if predicted_yield is not None and avg_yield is not None and avg_yield > 0:
        if predicted_yield < avg_yield * YIELD_VERY_LOW_THRESHOLD:
            risk_score += 2
            pct = round((1 - predicted_yield / avg_yield) * 100, 1)
            identified_risks.append({
                "type": "Yield Risk",
                "severity": "High",
                "reason": (
                    f"Predicted yield ({predicted_yield:.2f} tons/ha) is {pct}% below farm average "
                    f"({avg_yield:.2f} tons/ha)  -  significantly under the {int(YIELD_VERY_LOW_THRESHOLD*100)}% threshold."
                ),
                "advice": (
                    "Investigate soil health, nutrient deficiencies, and water availability immediately. "
                    "Consider consulting an agricultural extension officer."
                ),
            })
        elif predicted_yield < avg_yield * YIELD_MODERATE_RISK:
            risk_score += 1
            pct = round((1 - predicted_yield / avg_yield) * 100, 1)
            identified_risks.append({
                "type": "Yield Risk",
                "severity": "Medium",
                "reason": (
                    f"Predicted yield ({predicted_yield:.2f} tons/ha) is {pct}% below farm average "
                    f"({avg_yield:.2f} tons/ha)."
                ),
                "advice": (
                    "Review fertilizer application schedule and ensure consistent irrigation "
                    "throughout the growing season."
                ),
            })

    # ---- Rainfall risk (§10)  -  no double-counting ----
    if rainfall_deviation is not None:
        abs_dev = abs(rainfall_deviation)
        if abs_dev > RAINFALL_HIGH_RISK:
            risk_score += 2
            direction = "below" if rainfall_deviation < 0 else "above"
            identified_risks.append({
                "type": "Rainfall Risk",
                "severity": "High",
                "reason": (
                    f"Rainfall deviation is extreme ({rainfall_deviation:+.0f} mm from crop baseline), "
                    f"significantly {direction} normal levels."
                ),
                "advice": (
                    "Implement emergency water management: increase drip irrigation if below baseline, "
                    "or install drainage channels if above baseline. Act within the week."
                ),
            })
        elif abs_dev > RAINFALL_MODERATE_RISK:
            risk_score += 1
            direction = "below" if rainfall_deviation < 0 else "above"
            identified_risks.append({
                "type": "Rainfall Risk",
                "severity": "Medium",
                "reason": (
                    f"Rainfall deviation is {rainfall_deviation:+.0f} mm from crop baseline  -  "
                    f"moderately {direction} normal levels."
                ),
                "advice": (
                    "Monitor soil moisture closely. Adjust irrigation schedule or "
                    "check field drainage as appropriate."
                ),
            })

    # ---- Soil risk (§11)  -  single point only ----
    if soil_ph is not None:
        if soil_ph < SOIL_HIGH_RISK_PH_LOW or soil_ph > SOIL_HIGH_RISK_PH_HIGH:
            risk_score += 1
            if soil_ph < SOIL_HIGH_RISK_PH_LOW:
                reason = f"Soil pH ({soil_ph:.1f}) is severely acidic (below {SOIL_HIGH_RISK_PH_LOW})."
                advice = "Apply agricultural lime immediately. Severely acidic soil causes aluminum toxicity and locks out phosphorus."
            else:
                reason = f"Soil pH ({soil_ph:.1f}) is severely alkaline (above {SOIL_HIGH_RISK_PH_HIGH})."
                advice = "Apply elemental sulfur or gypsum to lower pH. Alkaline soil prevents iron, zinc, and manganese uptake."
            identified_risks.append({
                "type": "Soil Risk",
                "severity": "Medium",
                "reason": reason,
                "advice": advice,
            })

    # ---- Final risk level (§12) ----
    if risk_score >= RISK_HIGH_SCORE:
        risk_level = "High"
        priority_level = "Act Now"
        priority_reason = (
            "Multiple serious risk factors detected. "
            "Corrective action within 1–2 weeks is essential to protect yield."
        )
    elif risk_score >= RISK_MEDIUM_SCORE:
        risk_level = "Medium"
        priority_level = "Act Soon"
        priority_reason = (
            "Moderate risk factors present. "
            "Plan corrective actions within the next 3–4 weeks."
        )
    else:
        risk_level = "Low"
        priority_level = "Monitor"
        priority_reason = (
            "Low risk profile. "
            "Continue standard monitoring and good agronomic practices."
        )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_category": _dominant_category(identified_risks),
        "identified_risks": identified_risks,
        "detected_risk_count": len(identified_risks),
        "priority_level": priority_level,
        "priority_reason": priority_reason,
    }


def _dominant_category(risks: List[Dict[str, str]]) -> str:
    """Return the most common risk category, or 'Stable' if no risks."""
    if not risks:
        return "Stable"
    counts: Dict[str, int] = {}
    for r in risks:
        cat = r.get("type", "Unknown")
        counts[cat] = counts.get(cat, 0) + 1
    return max(counts, key=counts.get)  # type: ignore[arg-type]


# ============================================================
# Data Assembly  -  reads from Firestore
# ============================================================

def _get_farm_predictions(farm_id: str, user_id: str, db) -> List[Dict[str, Any]]:
    """
    Retrieve all prediction history records for a specific farm.
    Sorted by created_at descending (most recent first).
    """
    query = (
        db.collection(PREDICTION_HISTORY_COLLECTION)
        .where("user_id", "==", user_id)
        .where("farm_id", "==", farm_id)
    )
    docs = list(query.stream())
    records: List[Dict[str, Any]] = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        records.append(data)
    records.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return records


def _compute_yield_stats(predictions: List[Dict[str, Any]]) -> Tuple[Optional[float], Optional[float]]:
    """
    Compute predicted_yield (most recent) and avg_yield (historical mean).

    Returns:
        (predicted_yield, avg_yield)  -  either may be None if data is unavailable.
    """
    if not predictions:
        return None, None

    yields = [
        p["predicted_yield"]
        for p in predictions
        if p.get("predicted_yield") is not None and p["predicted_yield"] > 0
    ]

    if not yields:
        return None, None

    predicted_yield = yields[0]  # Most recent
    avg_yield = sum(yields) / len(yields)

    return predicted_yield, avg_yield


def _compute_rainfall_deviation(predictions: List[Dict[str, Any]], crop: str) -> Optional[float]:
    """
    Compute rainfall deviation for the most recent prediction.

    Deviation = annual_rainfall_used - crop_water_requirement_baseline

    Returns:
        Deviation in mm (positive = above baseline, negative = below).
        None if the value is unavailable.
    """
    if not predictions:
        return None

    most_recent = predictions[0]
    annual_rainfall = most_recent.get("annual_rainfall")

    if annual_rainfall is None:
        return None

    crop_key = crop.strip().title() if crop else "Other"
    baseline = CROP_WATER_REQUIREMENTS.get(crop_key, DEFAULT_CROP_WATER_REQUIREMENT)

    return round(annual_rainfall - baseline, 1)


# ============================================================
# Public Orchestrator  -  called by API route
# ============================================================

def get_farm_advisory(farm_id: str, user_id: str, db) -> Dict[str, Any]:
    """
    Generate a farm-specific advisory report.

    Steps:
      1. Load farm (validates ownership)
      2. Load prediction history for this farm
      3. Compute yield stats and rainfall deviation
      4. Run recommendation engine
      5. Run risk assessment
      6. Assemble and return response

    Args:
        farm_id: Firestore farm document ID.
        user_id: Authenticated user's Firebase UID.
        db: Firestore client.

    Returns:
        Full advisory response dict.

    Raises:
        NotFoundException: Farm does not exist or is deleted.
        ForbiddenException: User does not own this farm.
    """
    # ---- Step 1: Load farm ----
    farm_doc = db.collection(FARMS_COLLECTION).document(farm_id).get()

    if not farm_doc.exists:
        raise NotFoundException(resource="Farm", resource_id=farm_id)

    farm = farm_doc.to_dict()
    farm["id"] = farm_doc.id

    if farm.get("is_deleted", False):
        raise NotFoundException(resource="Farm", resource_id=farm_id)

    if farm.get("user_id") != user_id:
        raise ForbiddenException(detail="You do not have access to this farm.")

    # ---- Step 2: Load prediction history ----
    predictions = _get_farm_predictions(farm_id, user_id, db)

    # ---- Step 3: Compute metrics ----
    soil_ph: Optional[float] = farm.get("soil_ph")
    crop: str = farm.get("crop", "Other") or "Other"

    predicted_yield, avg_yield = _compute_yield_stats(predictions)
    rainfall_deviation = _compute_rainfall_deviation(predictions, crop)

    # ---- Step 4: Generate recommendations ----
    recommendations = generate_farm_recommendations(
        soil_ph=soil_ph,
        predicted_yield=predicted_yield,
        avg_yield=avg_yield,
        rainfall_deviation=rainfall_deviation,
    )

    # ---- Step 5: Run risk assessment ----
    risk = assess_farm_risk(
        predicted_yield=predicted_yield,
        avg_yield=avg_yield,
        rainfall_deviation=rainfall_deviation,
        soil_ph=soil_ph,
    )

    # ---- Step 6: Assemble response ----
    data_sources: Dict[str, bool] = {
        "soil_ph_available": soil_ph is not None,
        "predicted_yield_available": predicted_yield is not None,
        "avg_yield_available": avg_yield is not None,
        "rainfall_deviation_available": rainfall_deviation is not None,
        "prediction_count": len(predictions),
    }

    metrics_used: Dict[str, Any] = {
        "soil_ph": soil_ph,
        "predicted_yield": round(predicted_yield, 3) if predicted_yield is not None else None,
        "avg_yield": round(avg_yield, 3) if avg_yield is not None else None,
        "rainfall_deviation": rainfall_deviation,
        "crop": crop,
    }

    return {
        "farm_id": farm_id,
        "farm_name": farm.get("name", ""),
        "crop": crop,
        "recommendations": recommendations,
        "risk_level": risk["risk_level"],
        "risk_score": risk["risk_score"],
        "risk_category": risk["risk_category"],
        "identified_risks": risk["identified_risks"],
        "detected_risk_count": risk["detected_risk_count"],
        "priority_level": risk["priority_level"],
        "priority_reason": risk["priority_reason"],
        "data_sources": data_sources,
        "metrics_used": metrics_used,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": (
            "Advisory is based on stored farm data and prediction history. "
            "Thresholds are general agricultural guidelines. "
            "Consult a local agricultural officer for field-specific advice."
        ),
    }
