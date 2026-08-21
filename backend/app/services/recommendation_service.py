"""
YieldSense AI  -  Recommendation Engine Service

Rule-based agricultural recommendation engine.
Architecture uses a Strategy pattern  -  future AI models can replace
the RuleEngine strategy without changing the API or service interface.

Recommendation categories:
  1. Crop alternatives based on soil/climate
  2. Fertilizer corrections (NPK)
  3. Irrigation advice (rainfall vs crop requirement)
  4. Harvest timing suggestions
  5. Season planning (optimal sowing windows)
  6. Best farming practices
  7. Yield improvement actions
"""

from typing import Any, Dict, List, Optional


# ============================================================
# Crop Knowledge Base
# ============================================================

CROP_WATER_REQUIREMENTS = {
    "Rice": 1200, "Wheat": 450, "Maize": 500, "Soybean": 450,
    "Cotton": 700, "Sugarcane": 1500, "Potato": 500, "Groundnut": 500,
    "Barley": 350, "Millets": 350, "Sorghum": 400, "Sunflower": 600,
    "Rapeseed": 400, "Mustard": 350, "Lentil": 300, "Chickpea": 400,
    "Jute": 1000, "Coffee": 1200, "Tea": 1500, "Coconut": 1200,
    "Banana": 1200, "Mango": 1000, "Tomato": 600, "Onion": 500,
    "Garlic": 400, "Ginger": 1500, "Turmeric": 1200, "Pepper": 1200,
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

SEASON_CROP_MAP = {
    "Kharif": ["Rice", "Maize", "Cotton", "Soybean", "Groundnut", "Sugarcane", "Jute", "Millets", "Sorghum"],
    "Rabi": ["Wheat", "Barley", "Mustard", "Rapeseed", "Lentil", "Chickpea", "Potato", "Onion"],
    "Annual": ["Sugarcane", "Banana", "Coconut", "Coffee", "Tea", "Turmeric", "Ginger"],
}

# Crop NPK requirements (approximate kg/ha for optimal growth)
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

SOWING_WINDOWS = {
    "Kharif":  "June – July (monsoon onset)",
    "Rabi":    "October – November (post-monsoon)",
    "Annual":  "Year-round (crop-dependent)",
    "Summer":  "February – March",
    "Zaid":    "March – June",
}

HARVEST_WINDOWS = {
    "Kharif":  "October – November",
    "Rabi":    "March – April",
    "Annual":  "Varies by crop and region",
    "Summer":  "May – June",
}


# ============================================================
# Strategy Interface (AI-ready)
# ============================================================

class RecommendationStrategy:
    """
    Base strategy interface for recommendation engines.
    Swap this with an AI model strategy in the future without
    changing the service layer.
    """

    def generate(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


# ============================================================
# Rule-Based Strategy
# ============================================================

class RuleBasedStrategy(RecommendationStrategy):
    """Agronomic rule-based recommendation strategy."""

    def generate(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        crop = input_data.get("crop", "Rice")
        temperature = input_data.get("temperature", 25.0)
        annual_rainfall = input_data.get("annual_rainfall", 1000.0)
        humidity = input_data.get("humidity", 60.0)
        soil_ph = input_data.get("soil_ph", 6.5)
        nitrogen = input_data.get("nitrogen", 80.0)
        phosphorus = input_data.get("phosphorus", 40.0)
        potassium = input_data.get("potassium", 35.0)
        predicted_yield = input_data.get("predicted_yield")
        season = input_data.get("season", "Kharif")
        area = input_data.get("area")

        crop_key = crop.strip().title()

        crop_recommendations = self._recommend_crops(
            temperature, annual_rainfall, soil_ph, season, crop_key
        )
        fertilizer_recommendations = self._recommend_fertilizers(
            crop_key, nitrogen, phosphorus, potassium
        )
        irrigation_advice, irrigation_frequency, irrigation_reason = self._irrigation_advice(
            crop_key, annual_rainfall, temperature, humidity
        )
        harvest_suggestions = self._harvest_suggestions(crop_key, season, predicted_yield, area)
        season_planning, sowing_window, harvest_window = self._season_planning(season, crop_key)
        best_practices = self._best_practices(crop_key, soil_ph, nitrogen, phosphorus, potassium, temperature)
        yield_tips, improvement_estimate = self._yield_improvement_tips(
            crop_key, nitrogen, phosphorus, potassium, soil_ph, predicted_yield
        )
        reasons = self._build_reasons(
            crop_key, temperature, annual_rainfall, soil_ph, nitrogen, phosphorus, potassium
        )

        return {
            "crop_recommendations": crop_recommendations,
            "fertilizer_recommendations": fertilizer_recommendations,
            "irrigation_advice": irrigation_advice,
            "irrigation_frequency": irrigation_frequency,
            "irrigation_reason": irrigation_reason,
            "harvest_suggestions": harvest_suggestions,
            "season_planning": season_planning,
            "optimal_sowing_window": sowing_window,
            "expected_harvest_window": harvest_window,
            "best_practices": best_practices,
            "yield_improvement_tips": yield_tips,
            "estimated_yield_improvement": improvement_estimate,
            "reasons": reasons,
            "confidence": "High",
        }

    def _recommend_crops(self, temp: float, rainfall: float, ph: float, season: str, current_crop: str) -> List[Dict]:
        """Find suitable alternative crops based on environmental conditions."""
        suitable = []
        season_crops = SEASON_CROP_MAP.get(season, [])

        for crop_name, ph_range in CROP_PH_RANGES.items():
            if crop_name == current_crop:
                continue
            if crop_name not in season_crops:
                continue

            ph_ok = ph_range[0] <= ph <= ph_range[1]
            water_req = CROP_WATER_REQUIREMENTS.get(crop_name, 600)
            rainfall_ok = abs(rainfall - water_req) < water_req * 0.4
            temp_range = CROP_TEMPERATURE_RANGES.get(crop_name, (15, 35))
            temp_ok = temp_range[0] <= temp <= temp_range[1]

            match_count = sum([ph_ok, rainfall_ok, temp_ok])
            if match_count >= 2:
                suitability = "Excellent" if match_count == 3 else "Good"
                reasons = []
                if ph_ok:
                    reasons.append(f"soil pH {ph:.1f} is ideal for {crop_name}")
                if rainfall_ok:
                    reasons.append(f"rainfall {rainfall:.0f}mm matches {crop_name} needs")
                if temp_ok:
                    reasons.append(f"temperature {temp:.1f}°C suits {crop_name}")

                suitable.append({
                    "crop": crop_name,
                    "suitability": suitability,
                    "reason": "; ".join(reasons) + ".",
                })

        suitable.sort(key=lambda x: (0 if x["suitability"] == "Excellent" else 1))
        return suitable[:4]

    def _recommend_fertilizers(self, crop: str, n: float, p: float, k: float) -> List[Dict]:
        """Recommend fertilizer corrections based on NPK deficiencies."""
        recommendations = []
        crop_req = CROP_NPK_REQUIREMENTS.get(crop, {"N": 100, "P": 50, "K": 50})

        nutrient_map = {
            "Nitrogen": {"current": n, "target": crop_req["N"], "symbol": "N",
                         "source": "Urea (46% N) or Ammonium Nitrate (34% N)"},
            "Phosphorus": {"current": p, "target": crop_req["P"], "symbol": "P",
                           "source": "DAP (18% N, 46% P2O5) or SSP"},
            "Potassium": {"current": k, "target": crop_req["K"], "symbol": "K",
                          "source": "Muriate of Potash (60% K2O) or SOP"},
        }

        for nutrient, info in nutrient_map.items():
            current = info["current"]
            target = info["target"]
            deficit = target - current
            pct = (current / target * 100) if target > 0 else 100

            if pct < 50:
                status = "Critically Low"
                rate = f"Apply {deficit:.0f} kg/ha of {info['source']}"
                reason = f"{crop} requires ~{target:.0f} kg/ha {nutrient}, current {current:.0f} kg/ha is severely deficient  -  will significantly limit yield."
            elif pct < 75:
                status = "Low"
                rate = f"Apply {deficit * 0.8:.0f} kg/ha of {info['source']}"
                reason = f"{crop} needs ~{target:.0f} kg/ha {nutrient}, current level {current:.0f} kg/ha is insufficient for optimal yield."
            elif pct > 150:
                status = "Excess"
                rate = f"Reduce application. Skip {nutrient} fertilizer for next cycle."
                reason = f"Excess {nutrient} ({current:.0f} kg/ha) can cause toxicity, runoff, and environmental damage."
            else:
                status = "Adequate"
                rate = f"Maintain current {nutrient} levels."
                reason = f"{nutrient} level ({current:.0f} kg/ha) is adequate for {crop} requirements (~{target:.0f} kg/ha)."

            recommendations.append({
                "nutrient": nutrient,
                "current_level": current,
                "target_level": target,
                "recommendation": status,
                "reason": reason,
                "application_rate": rate,
            })

        return recommendations

    def _irrigation_advice(self, crop: str, rainfall: float, temp: float, humidity: float):
        """Generate irrigation recommendations based on rainfall and crop water needs."""
        water_req = CROP_WATER_REQUIREMENTS.get(crop, 600)
        deficit = water_req - rainfall

        if deficit <= 0:
            advice = f"Rainfall ({rainfall:.0f} mm) meets or exceeds {crop}'s annual water requirement ({water_req} mm)."
            frequency = "Only supplemental irrigation needed during dry spells."
            reason = "Natural rainfall is sufficient. Excess water may require drainage management."
        elif deficit <= 200:
            advice = f"Moderate irrigation needed to supplement rainfall."
            frequency = "Irrigate every 7–10 days during dry periods, focusing on critical growth stages (flowering, grain filling)."
            reason = f"{crop} requires {water_req} mm but receives only {rainfall:.0f} mm. A deficit of {deficit:.0f} mm must be compensated."
        elif deficit <= 500:
            advice = f"Regular irrigation is essential for {crop} cultivation."
            frequency = "Irrigate every 4–6 days. Use drip or sprinkler irrigation for water efficiency."
            reason = f"Significant water deficit of {deficit:.0f} mm. Without irrigation, yield will be substantially reduced."
        else:
            advice = f"Heavy irrigation infrastructure required. Consider drought-tolerant alternatives."
            frequency = "Daily irrigation may be needed. Drip irrigation is strongly recommended."
            reason = f"Severe water deficit of {deficit:.0f} mm. Growing {crop} in this rainfall zone is resource-intensive."

        # Humidity adjustment
        if humidity > 80:
            advice += " High humidity increases disease risk  -  avoid overhead irrigation."
        elif humidity < 40:
            advice += " Low humidity increases evapotranspiration  -  irrigate early morning or evening."

        return advice, frequency, reason

    def _harvest_suggestions(self, crop: str, season: str, predicted_yield: Optional[float], area: Optional[float]) -> List[str]:
        """Provide harvest timing and method suggestions."""
        suggestions = []

        harvest_timing = HARVEST_WINDOWS.get(season, "varies by season")
        suggestions.append(f"Plan harvest during {harvest_timing} for the {season} season.")

        if crop in ["Rice", "Wheat", "Barley", "Maize"]:
            suggestions.append("Monitor grain moisture content  -  harvest when moisture drops to 20–25% for cereals.")
            suggestions.append("Use combine harvester for large areas (>5 ha) to reduce post-harvest losses.")
            suggestions.append("Thresh and dry grain immediately after harvest to prevent mold and aflatoxin.")
        elif crop in ["Cotton"]:
            suggestions.append("Pick cotton in 2–3 rounds as bolls open progressively over 3–4 weeks.")
            suggestions.append("Harvest early morning when fiber quality is highest.")
        elif crop in ["Potato", "Onion", "Garlic"]:
            suggestions.append("Allow the crop to cure for 7–14 days post-harvest before storage.")
            suggestions.append("Harvest during dry weather to prevent fungal infection in storage.")
        elif crop in ["Sugarcane"]:
            suggestions.append("Harvest at peak sucrose concentration  -  typically 12–18 months after planting.")
            suggestions.append("Coordinate with nearest mill for timely crushing to avoid sucrose loss.")
        else:
            suggestions.append(f"Monitor {crop} for maturity indicators specific to the variety.")
            suggestions.append("Harvest during dry weather conditions to maintain quality.")

        if predicted_yield and area:
            total = predicted_yield * area
            suggestions.append(
                f"Based on predicted yield of {predicted_yield:.2f} tons/ha, plan storage for approximately {total:.1f} tons total."
            )

        return suggestions

    def _season_planning(self, season: str, crop: str):
        """Provide season planning and sowing window recommendations."""
        sowing = SOWING_WINDOWS.get(season, "Consult local agricultural calendar")
        harvest = HARVEST_WINDOWS.get(season, "Varies")

        planning_notes = []
        planning_notes.append(f"Optimal sowing window for {season} crops: {sowing}.")
        planning_notes.append(f"Soil preparation should begin 2–3 weeks before sowing.")

        if season == "Kharif":
            planning_notes.append("Ensure seeds are ready before monsoon onset. Delay in sowing can reduce yield by 10–20%.")
        elif season == "Rabi":
            planning_notes.append("Pre-rabi soil testing recommended. Irrigation infrastructure must be in place before sowing.")
        else:
            planning_notes.append("Annual crops require long-term irrigation planning and soil management.")

        return " ".join(planning_notes), sowing, harvest

    def _best_practices(self, crop: str, ph: float, n: float, p: float, k: float, temp: float) -> List[str]:
        """Generate actionable best farming practices."""
        practices = []

        # pH management
        if ph < 5.5:
            practices.append("Apply agricultural lime (CaCO3) at 2–4 tons/ha to raise soil pH above 6.0 before sowing.")
        elif ph > 8.0:
            practices.append("Apply elemental sulfur or gypsum to lower soil pH. Organic matter amendment also helps.")
        else:
            practices.append("Maintain soil pH through regular soil testing (every 2 years) and targeted amendments.")

        # Organic matter
        practices.append("Apply 5–10 tons/ha of farmyard manure or compost before sowing to improve soil structure and microbial activity.")

        # Crop rotation
        if crop in ["Rice", "Wheat", "Maize"]:
            practices.append(f"Rotate {crop} with legumes (soybean, chickpea) to restore nitrogen naturally and break pest cycles.")
        elif crop in ["Soybean", "Chickpea", "Lentil", "Groundnut"]:
            practices.append(f"{crop} is a legume  -  it fixes atmospheric nitrogen. Follow with a cereal crop (wheat/rice) to utilize residual nitrogen.")

        # Temperature stress
        if temp > 35:
            practices.append("Use reflective mulching or shading nets during extreme heat to protect young seedlings.")
        elif temp < 15:
            practices.append("Use cold-tolerant varieties and protect seedlings from frost with row covers or irrigation.")

        # Integrated Pest Management
        practices.append("Use Integrated Pest Management (IPM): combine biological control, resistant varieties, and targeted pesticide use to reduce chemical inputs by 30–50%.")

        # Water management
        practices.append("Adopt micro-irrigation (drip or sprinkler) to improve water use efficiency by 30–50% compared to flood irrigation.")

        return practices[:5]

    def _yield_improvement_tips(self, crop: str, n: float, p: float, k: float,
                                ph: float, predicted_yield: Optional[float]):
        """Generate measurable yield improvement suggestions."""
        tips = []
        improvement_parts = []

        crop_req = CROP_NPK_REQUIREMENTS.get(crop, {"N": 100, "P": 50, "K": 50})

        if n < crop_req["N"] * 0.6:
            tips.append(f"Correcting nitrogen deficiency to optimal levels ({crop_req['N']} kg/ha) can improve yield by 15–25%.")
            improvement_parts.append("N: +15-25%")
        if p < crop_req["P"] * 0.6:
            tips.append(f"Increasing phosphorus to {crop_req['P']} kg/ha improves root development and early crop establishment (+10–15% yield).")
            improvement_parts.append("P: +10-15%")
        if k < crop_req["K"] * 0.6:
            tips.append(f"Raising potassium to {crop_req['K']} kg/ha improves drought tolerance and grain quality (+8–12% yield).")
            improvement_parts.append("K: +8-12%")

        if not (5.5 <= ph <= 7.5):
            tips.append("Correcting soil pH to 6.0–7.0 can improve nutrient availability by 20–30%, directly increasing yield.")
            improvement_parts.append("pH fix: +10-20%")

        tips.append("Using certified high-yielding varieties (HYVs) can increase output by 20–40% compared to local varieties.")
        tips.append("Splitting fertilizer applications (3–4 doses) instead of a single basal dose reduces nutrient loss by 15–20%.")
        tips.append("Precision agriculture tools (soil sensors, drone monitoring) can optimize input timing and reduce waste by 15–25%.")

        if improvement_parts:
            estimate = f"Potential total yield improvement: {', '.join(improvement_parts)} (compounding effects)."
        else:
            estimate = "Current nutrient profile is well-balanced. Focus on variety selection and precision timing for yield gains."

        return tips[:5], estimate

    def _build_reasons(self, crop: str, temp: float, rainfall: float, ph: float,
                       n: float, p: float, k: float) -> List[str]:
        """Build explanation reasons for the overall recommendation set."""
        reasons = []
        water_req = CROP_WATER_REQUIREMENTS.get(crop, 600)
        ph_range = CROP_PH_RANGES.get(crop, (6.0, 7.5))
        temp_range = CROP_TEMPERATURE_RANGES.get(crop, (15, 35))

        # Rainfall assessment
        deficit = water_req - rainfall
        if abs(deficit) < water_req * 0.2:
            reasons.append(f"Rainfall ({rainfall:.0f} mm) closely matches {crop}'s water requirement ({water_req} mm)  -  good environmental match.")
        elif deficit > 0:
            reasons.append(f"Annual rainfall ({rainfall:.0f} mm) is {deficit:.0f} mm below {crop}'s requirement ({water_req} mm)  -  irrigation needed.")
        else:
            reasons.append(f"Rainfall ({rainfall:.0f} mm) exceeds {crop}'s requirement ({water_req} mm)  -  drainage management may be needed.")

        # Temperature
        if temp_range[0] <= temp <= temp_range[1]:
            reasons.append(f"Temperature ({temp:.1f}°C) is within optimal range for {crop} ({temp_range[0]}–{temp_range[1]}°C).")
        else:
            reasons.append(f"Temperature ({temp:.1f}°C) is outside optimal range for {crop} ({temp_range[0]}–{temp_range[1]}°C)  -  stress management recommended.")

        # Soil pH
        if ph_range[0] <= ph <= ph_range[1]:
            reasons.append(f"Soil pH ({ph:.1f}) is within the optimal range for {crop} ({ph_range[0]}–{ph_range[1]}).")
        else:
            reasons.append(f"Soil pH ({ph:.1f}) is outside {crop}'s optimal range ({ph_range[0]}–{ph_range[1]})  -  nutrient availability is impaired.")

        # NPK summary
        crop_req = CROP_NPK_REQUIREMENTS.get(crop, {"N": 100, "P": 50, "K": 50})
        deficients = []
        if n < crop_req["N"] * 0.75:
            deficients.append(f"N ({n:.0f}/{crop_req['N']} kg/ha)")
        if p < crop_req["P"] * 0.75:
            deficients.append(f"P ({p:.0f}/{crop_req['P']} kg/ha)")
        if k < crop_req["K"] * 0.75:
            deficients.append(f"K ({k:.0f}/{crop_req['K']} kg/ha)")

        if deficients:
            reasons.append(f"Nutrient deficiencies detected: {', '.join(deficients)}  -  fertilizer corrections recommended.")
        else:
            reasons.append(f"NPK levels are generally adequate for {crop} cultivation at this time.")

        return reasons


# ============================================================
# Public Service Function
# ============================================================

def generate_recommendations(input_data: Dict[str, Any], strategy: Optional[RecommendationStrategy] = None) -> Dict[str, Any]:
    """
    Generate agricultural recommendations using the specified strategy.

    Args:
        input_data: Prediction parameters (crop, temp, rainfall, NPK, etc.)
        strategy: Optional custom strategy. Defaults to RuleBasedStrategy.
                  Pass an alternative strategy here if configured.

    Returns:
        Full recommendation response dict.
    """
    if strategy is None:
        strategy = RuleBasedStrategy()
    return strategy.generate(input_data)
