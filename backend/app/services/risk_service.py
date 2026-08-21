"""
YieldSense AI  -  Agricultural Risk Assessment Engine

Detects 10 categories of agricultural risk from environmental and soil parameters.
Returns a structured risk report with severity, reason, and mitigation per risk.

Risk categories:
  1.  Low Rainfall / Drought Risk
  2.  High Rainfall / Flood Risk
  3.  Heat Stress
  4.  Cold Stress
  5.  Compound Drought (low rainfall + high heat)
  6.  Poor Soil pH (too acidic or too alkaline)
  7.  Low Nitrogen
  8.  Low Phosphorus
  9.  Low Potassium
  10. Compound Nutrient Deficiency
"""

from typing import Any, Dict, List, Optional, Tuple


# ============================================================
# Crop reference data (imported from recommendation service)
# ============================================================

CROP_WATER_REQUIREMENTS = {
    "Rice": 1200, "Wheat": 450, "Maize": 500, "Soybean": 450,
    "Cotton": 700, "Sugarcane": 1500, "Potato": 500, "Groundnut": 500,
    "Barley": 350, "Millets": 350, "Sorghum": 400, "Sunflower": 600,
    "Rapeseed": 400, "Mustard": 350, "Lentil": 300, "Chickpea": 400,
    "Jute": 1000, "Coffee": 1200, "Tea": 1500, "Coconut": 1200,
    "Banana": 1200, "Mango": 1000, "Tomato": 600, "Onion": 500,
}

CROP_TEMPERATURE_RANGES = {
    "Rice": (20, 37), "Wheat": (15, 25), "Maize": (18, 32), "Soybean": (20, 30),
    "Cotton": (25, 35), "Sugarcane": (20, 35), "Potato": (15, 25), "Groundnut": (20, 30),
    "Barley": (12, 25), "Millets": (25, 35), "Sorghum": (25, 35), "Sunflower": (20, 28),
    "Rapeseed": (15, 25), "Mustard": (10, 25), "Lentil": (18, 25), "Chickpea": (15, 25),
    "Jute": (24, 37), "Coffee": (15, 28), "Tea": (13, 28), "Coconut": (20, 35),
    "Banana": (20, 35), "Mango": (24, 30), "Tomato": (20, 30), "Onion": (13, 25),
}

CROP_PH_RANGES = {
    "Rice": (5.5, 7.0), "Wheat": (6.0, 7.5), "Maize": (5.8, 7.0),
    "Soybean": (6.0, 7.0), "Cotton": (6.0, 7.5), "Sugarcane": (6.0, 7.5),
    "Potato": (5.0, 6.5), "Groundnut": (5.5, 7.0), "Barley": (6.0, 7.5),
    "Millets": (5.5, 7.5), "Sorghum": (5.5, 7.5), "Sunflower": (5.7, 7.2),
    "Rapeseed": (5.8, 7.0), "Mustard": (6.0, 7.5), "Lentil": (6.0, 7.5),
    "Chickpea": (6.0, 8.0), "Jute": (6.0, 7.5), "Coffee": (4.5, 6.0),
    "Tea": (4.5, 5.5), "Coconut": (5.5, 7.0), "Banana": (5.5, 7.0),
}

CROP_NPK_REQUIREMENTS = {
    "Rice":      {"N": 120, "P": 60, "K": 60},
    "Wheat":     {"N": 120, "P": 60, "K": 40},
    "Maize":     {"N": 150, "P": 75, "K": 75},
    "Soybean":   {"N": 30,  "P": 80, "K": 80},
    "Cotton":    {"N": 120, "P": 60, "K": 60},
    "Sugarcane": {"N": 250, "P": 100, "K": 100},
    "Potato":    {"N": 150, "P": 100, "K": 150},
    "Groundnut": {"N": 25,  "P": 50,  "K": 50},
    "Barley":    {"N": 80,  "P": 40,  "K": 40},
    "Millets":   {"N": 80,  "P": 40,  "K": 40},
    "Mustard":   {"N": 100, "P": 60,  "K": 40},
    "Chickpea":  {"N": 20,  "P": 50,  "K": 50},
    "Lentil":    {"N": 20,  "P": 40,  "K": 40},
    "Banana":    {"N": 200, "P": 60,  "K": 300},
    "Tomato":    {"N": 150, "P": 100, "K": 150},
    "Onion":     {"N": 100, "P": 50,  "K": 100},
}

DEFAULT_NPK = {"N": 100, "P": 50, "K": 50}


def _score_to_severity(score: float) -> str:
    if score >= 75:
        return "Critical"
    elif score >= 50:
        return "High"
    elif score >= 25:
        return "Medium"
    return "Low"


def _detect_rainfall_risk(crop: str, rainfall: float) -> Optional[Dict]:
    water_req = CROP_WATER_REQUIREMENTS.get(crop, 700)
    deficit_pct = ((water_req - rainfall) / water_req * 100) if water_req > 0 else 0

    if deficit_pct >= 60:
        score = min(90, deficit_pct)
        return {
            "name": "Severe Drought Risk",
            "category": "Climate",
            "severity": "Critical",
            "severity_score": score,
            "reason": f"{crop} requires ~{water_req} mm annually but only {rainfall:.0f} mm available  -  a {deficit_pct:.0f}% deficit. Crop failure is likely without irrigation.",
            "mitigation": "Install drip or micro-irrigation immediately. Consider drought-tolerant varieties such as Millets or Sorghum. Apply mulching to reduce soil evaporation.",
            "affected_aspects": ["Yield", "Crop Survival", "Water Stress"],
        }
    elif deficit_pct >= 30:
        score = 40 + deficit_pct * 0.5
        return {
            "name": "Low Rainfall",
            "category": "Climate",
            "severity": "High",
            "severity_score": min(75, score),
            "reason": f"Rainfall ({rainfall:.0f} mm) is {deficit_pct:.0f}% below {crop}'s requirement ({water_req} mm). Supplemental irrigation is essential.",
            "mitigation": "Implement regular irrigation every 5–7 days. Prioritize critical growth stages (germination, flowering, grain filling). Use sprinkler or drip systems.",
            "affected_aspects": ["Yield", "Water Stress"],
        }

    surplus_pct = ((rainfall - water_req) / water_req * 100) if water_req > 0 else 0
    if surplus_pct >= 80:
        return {
            "name": "Flood / Waterlogging Risk",
            "category": "Climate",
            "severity": "High",
            "severity_score": min(85, 50 + surplus_pct * 0.3),
            "reason": f"Rainfall ({rainfall:.0f} mm) exceeds {crop}'s requirement by {surplus_pct:.0f}%. Waterlogging causes root rot, fungal disease, and anaerobic soil conditions.",
            "mitigation": "Install drainage channels or raised beds. Apply fungicide preventively. Avoid nitrogen applications during waterlogged periods. Consider switching to flood-tolerant varieties.",
            "affected_aspects": ["Root Health", "Disease Risk", "Soil Aeration"],
        }
    elif surplus_pct >= 40:
        return {
            "name": "Excess Rainfall",
            "category": "Climate",
            "severity": "Medium",
            "severity_score": 30 + surplus_pct * 0.2,
            "reason": f"Rainfall ({rainfall:.0f} mm) is {surplus_pct:.0f}% above {crop}'s requirement. Excess moisture may increase fungal disease pressure and nutrient leaching.",
            "mitigation": "Ensure field drainage is functional. Apply fungicide during extended wet periods. Monitor for waterlogging in low-lying areas.",
            "affected_aspects": ["Disease Risk", "Nutrient Loss"],
        }
    return None


def _detect_temperature_risk(crop: str, temperature: float) -> Optional[Dict]:
    temp_range = CROP_TEMPERATURE_RANGES.get(crop, (15, 35))
    t_min, t_max = temp_range

    heat_excess = temperature - t_max
    cold_excess = t_min - temperature

    if heat_excess >= 8:
        return {
            "name": "Severe Heat Stress",
            "category": "Climate",
            "severity": "Critical",
            "severity_score": min(90, 60 + heat_excess * 3),
            "reason": f"Temperature ({temperature:.1f}°C) is {heat_excess:.1f}°C above the critical threshold for {crop} ({t_max}°C). Photosynthesis halts, pollen sterility occurs, and yield losses of 30–50% are expected.",
            "mitigation": "Apply shading nets (30–50% shade) during peak hours. Increase irrigation frequency (irrigate twice daily). Use anti-transpirant sprays (kaolin clay). Consider transplanting to cooler seasons.",
            "affected_aspects": ["Flowering", "Grain Setting", "Photosynthesis", "Yield"],
        }
    elif heat_excess >= 3:
        return {
            "name": "Heat Stress",
            "category": "Climate",
            "severity": "High",
            "severity_score": min(70, 40 + heat_excess * 5),
            "reason": f"Temperature ({temperature:.1f}°C) exceeds {crop}'s optimal maximum ({t_max}°C) by {heat_excess:.1f}°C. Reproductive stage damage and yield reduction (10–25%) expected.",
            "mitigation": "Increase irrigation during hottest periods. Apply potassium to improve heat tolerance. Use mulching to reduce soil temperature. Shift sowing date to avoid peak temperatures.",
            "affected_aspects": ["Yield", "Reproductive Success"],
        }

    if cold_excess >= 8:
        return {
            "name": "Cold / Frost Stress",
            "category": "Climate",
            "severity": "Critical",
            "severity_score": min(90, 60 + cold_excess * 3),
            "reason": f"Temperature ({temperature:.1f}°C) is {cold_excess:.1f}°C below the critical minimum for {crop} ({t_min}°C). Frost damage, tissue death, and crop failure are likely.",
            "mitigation": "Use frost protection (row covers, windbreaks, overhead irrigation for freeze protection). Delay sowing until temperatures stabilize. Switch to cold-tolerant varieties immediately.",
            "affected_aspects": ["Crop Survival", "Germination", "Tissue Health"],
        }
    elif cold_excess >= 3:
        return {
            "name": "Cold Stress",
            "category": "Climate",
            "severity": "High",
            "severity_score": min(65, 35 + cold_excess * 5),
            "reason": f"Temperature ({temperature:.1f}°C) is below {crop}'s optimal minimum ({t_min}°C). Growth rate slows, nutrient uptake is reduced, and seedling mortality increases.",
            "mitigation": "Apply potassium and phosphorus to improve cold tolerance. Use plastic mulching for soil warming. Delay sowing by 1–2 weeks to allow temperatures to rise.",
            "affected_aspects": ["Growth Rate", "Nutrient Uptake", "Seedling Survival"],
        }
    return None


def _detect_ph_risk(crop: str, soil_ph: float) -> Optional[Dict]:
    ph_range = CROP_PH_RANGES.get(crop, (6.0, 7.5))
    ph_min, ph_max = ph_range

    if soil_ph < ph_min:
        deviation = ph_min - soil_ph
        if deviation >= 1.5:
            severity = "Critical"
            score = min(85, 50 + deviation * 20)
        elif deviation >= 0.5:
            severity = "High"
            score = min(65, 30 + deviation * 25)
        else:
            severity = "Medium"
            score = 20 + deviation * 20
        return {
            "name": "Acidic Soil",
            "category": "Soil",
            "severity": severity,
            "severity_score": score,
            "reason": f"Soil pH ({soil_ph:.1f}) is below {crop}'s optimal minimum ({ph_min}). Acidic conditions cause aluminum and manganese toxicity, reduce phosphorus availability, and harm microbial activity.",
            "mitigation": f"Apply agricultural lime (CaCO3) at 2–5 tons/ha to raise pH to {ph_min}–{ph_max}. Test soil pH after 4–6 weeks. Grow cover crops like clover to improve soil chemistry.",
            "affected_aspects": ["Nutrient Availability", "Microbial Activity", "Root Health"],
        }

    if soil_ph > ph_max:
        deviation = soil_ph - ph_max
        if deviation >= 1.5:
            severity = "Critical"
            score = min(85, 50 + deviation * 20)
        elif deviation >= 0.5:
            severity = "High"
            score = min(65, 30 + deviation * 25)
        else:
            severity = "Medium"
            score = 20 + deviation * 20
        return {
            "name": "Alkaline Soil",
            "category": "Soil",
            "severity": severity,
            "severity_score": score,
            "reason": f"Soil pH ({soil_ph:.1f}) exceeds {crop}'s optimal maximum ({ph_max}). Alkaline conditions lock up iron, manganese, zinc, and phosphorus  -  causing deficiency symptoms even with adequate fertilizer applications.",
            "mitigation": f"Apply elemental sulfur (200–400 kg/ha) or gypsum to lower pH to {ph_min}–{ph_max}. Use ammonium sulfate fertilizers. Apply chelated micronutrients (Fe, Zn, Mn) as foliar spray.",
            "affected_aspects": ["Micronutrient Availability", "Phosphorus Lock-up", "Crop Color"],
        }
    return None


def _detect_npk_risks(crop: str, n: float, p: float, k: float) -> List[Dict]:
    risks = []
    req = CROP_NPK_REQUIREMENTS.get(crop, DEFAULT_NPK)

    nutrient_configs = [
        {
            "name": "Low Nitrogen",
            "current": n, "target": req["N"],
            "critical_pct": 35, "high_pct": 55,
            "reason_template": "Nitrogen is the primary macronutrient driving vegetative growth, chlorophyll, and protein synthesis. Current level ({:.0f} kg/ha) is {:.0f}% of {crop}'s requirement ({:.0f} kg/ha).",
            "mitigation": "Apply urea (46% N) or ammonium nitrate in 2–3 split doses. First dose at sowing, second at tillering/branching stage, third at flowering if deficiency persists. Consider fertigation through drip irrigation.",
            "affected": ["Leaf Greenness", "Growth Rate", "Protein Content", "Yield"],
        },
        {
            "name": "Low Phosphorus",
            "current": p, "target": req["P"],
            "critical_pct": 35, "high_pct": 55,
            "reason_template": "Phosphorus is critical for root development, energy transfer (ATP), and early crop establishment. Current level ({:.0f} kg/ha) is {:.0f}% of {crop}'s requirement ({:.0f} kg/ha).",
            "mitigation": "Apply DAP (di-ammonium phosphate) or SSP (single superphosphate) as a basal dose before sowing. Phosphorus is most effective when placed near the seed row. Organic matter addition also improves phosphorus availability.",
            "affected": ["Root Development", "Seedling Vigor", "Maturity", "Grain Filling"],
        },
        {
            "name": "Low Potassium",
            "current": k, "target": req["K"],
            "critical_pct": 35, "high_pct": 55,
            "reason_template": "Potassium regulates water use, disease resistance, and grain quality. Current level ({:.0f} kg/ha) is {:.0f}% of {crop}'s requirement ({:.0f} kg/ha).",
            "mitigation": "Apply Muriate of Potash (MOP, 60% K2O) or Sulfate of Potash (SOP). Apply as basal dose or in two splits. Potassium uptake is reduced in acidic or waterlogged soils.",
            "affected": ["Water Use Efficiency", "Disease Resistance", "Grain Quality", "Drought Tolerance"],
        },
    ]

    for nc in nutrient_configs:
        current = nc["current"]
        target = nc["target"]
        pct = (current / target * 100) if target > 0 else 100

        if pct <= nc["critical_pct"]:
            severity = "Critical"
            score = min(85, 60 + (nc["critical_pct"] - pct) * 0.8)
        elif pct <= nc["high_pct"]:
            severity = "High"
            score = min(65, 35 + (nc["high_pct"] - pct) * 0.9)
        elif pct <= 75:
            severity = "Medium"
            score = 20 + (75 - pct) * 0.5
        else:
            continue  # Adequate

        # Format reason string  -  pass crop as keyword arg to resolve {crop} placeholder
        reason = nc["reason_template"].format(current, pct, target, crop=crop)

        risks.append({
            "name": nc["name"],
            "category": "Nutrient",
            "severity": severity,
            "severity_score": score,
            "reason": reason,
            "mitigation": nc["mitigation"],
            "affected_aspects": nc["affected"],
        })

    return risks


def _detect_compound_risks(detected_risks: List[Dict]) -> Optional[Dict]:
    """Detect compounding risk when multiple moderate risks co-exist."""
    medium_or_above = [r for r in detected_risks if r["severity"] in ("Medium", "High", "Critical")]
    if len(medium_or_above) >= 3:
        names = ", ".join(r["name"] for r in medium_or_above[:4])
        return {
            "name": "Compound Agricultural Risk",
            "category": "Compound",
            "severity": "High",
            "severity_score": min(80, 50 + len(medium_or_above) * 5),
            "reason": f"Multiple co-existing risks ({names}) create a compounding effect. Individual risks that are individually manageable become critical when combined.",
            "mitigation": "Prioritize addressing climate risks first (irrigation/temperature), then soil pH correction, then nutrient management. Create a 30-60-90 day action plan with local agricultural extension support.",
            "affected_aspects": ["Overall Crop Health", "Yield", "Profitability"],
        }
    return None


def _compute_overall_risk(risks: List[Dict]) -> Tuple[str, float, str, str, str, str]:
    """Compute overall risk level, score, category, priority, color."""
    if not risks:
        return "Low", 0.0, "Stable", "Monitor", "No significant risks detected.", "green"

    # Weighted average (highest scores carry more weight)
    scores = sorted([r["severity_score"] for r in risks], reverse=True)
    top_weight = 0.5
    rest_weight = 0.5 / max(1, len(scores) - 1)
    weighted_score = scores[0] * top_weight + sum(s * rest_weight for s in scores[1:])
    weighted_score = round(min(100, weighted_score), 1)

    # Dominant category
    categories = [r["category"] for r in risks]
    category_counts = {}
    for c in categories:
        category_counts[c] = category_counts.get(c, 0) + 1
    dominant_category = max(category_counts, key=category_counts.get, default="Compound")

    # Overall level
    if weighted_score >= 70:
        level = "Critical"
        priority = "Immediate Action"
        priority_reason = "Critical risks detected that require immediate intervention to prevent crop failure."
        color = "red"
    elif weighted_score >= 45:
        level = "High"
        priority = "Act Now"
        priority_reason = "High-priority risks identified. Corrective action within 1–2 weeks is essential."
        color = "orange"
    elif weighted_score >= 20:
        level = "Medium"
        priority = "Act Soon"
        priority_reason = "Moderate risks present. Plan corrective actions within the next 3–4 weeks."
        color = "yellow"
    else:
        level = "Low"
        priority = "Monitor"
        priority_reason = "Low risk profile. Continue standard monitoring and good agronomic practices."
        color = "green"

    return level, weighted_score, dominant_category, priority, priority_reason, color


# ============================================================
# Public Service Function
# ============================================================

def assess_risk(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the full agricultural risk assessment.

    Args:
        input_data: Dict with crop, temperature, annual_rainfall, humidity,
                    soil_ph, nitrogen, phosphorus, potassium, etc.

    Returns:
        Full risk assessment dict.
    """
    crop = input_data.get("crop", "Rice").strip().title()
    temperature = float(input_data.get("temperature", 25))
    rainfall = float(input_data.get("annual_rainfall", 1000))
    humidity = float(input_data.get("humidity", 60))
    soil_ph = float(input_data.get("soil_ph", 6.5))
    nitrogen = float(input_data.get("nitrogen", 80))
    phosphorus = float(input_data.get("phosphorus", 40))
    potassium = float(input_data.get("potassium", 35))

    detected_risks = []

    # Run individual risk detectors
    rainfall_risk = _detect_rainfall_risk(crop, rainfall)
    if rainfall_risk:
        detected_risks.append(rainfall_risk)

    temp_risk = _detect_temperature_risk(crop, temperature)
    if temp_risk:
        detected_risks.append(temp_risk)

    ph_risk = _detect_ph_risk(crop, soil_ph)
    if ph_risk:
        detected_risks.append(ph_risk)

    npk_risks = _detect_npk_risks(crop, nitrogen, phosphorus, potassium)
    detected_risks.extend(npk_risks)

    # Check compound risk
    compound = _detect_compound_risks(detected_risks)
    if compound:
        detected_risks.append(compound)

    # Sort by severity score
    detected_risks.sort(key=lambda r: r["severity_score"], reverse=True)

    # Compute overall
    level, score, category, priority, priority_reason, color = _compute_overall_risk(detected_risks)

    # Build plain-language warnings and mitigations
    warnings = []
    mitigations = []
    for risk in detected_risks:
        if risk["severity"] in ("High", "Critical"):
            warnings.append(f"[{risk['severity']}] {risk['name']}: {risk['reason'][:120]}...")
        mitigations.append(risk["mitigation"])

    return {
        "overall_risk_level": level,
        "risk_score": score,
        "risk_category": category,
        "risks": detected_risks,
        "warnings": warnings,
        "mitigations": mitigations[:5],
        "priority_level": priority,
        "priority_reason": priority_reason,
        "crop": crop,
        "detected_risk_count": len(detected_risks),
        "risk_color": color,
    }
