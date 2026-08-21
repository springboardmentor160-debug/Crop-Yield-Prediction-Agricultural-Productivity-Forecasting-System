"""
Rule-based agricultural recommendation engine.

Consumes the latest soil/weather snapshot and the yield-prediction
output to generate concrete, prioritised recommendations across
fertilizer, irrigation, pest/disease, and general planning categories -
the "7. Recommendations" stage of the architecture diagram.
"""
from __future__ import annotations

from app.ml.predictor import PredictionInput, PredictionOutput


def generate_recommendations(inp: PredictionInput, out: PredictionOutput) -> list[dict]:
    recs: list[dict] = []

    if inp.nitrogen_ppm < 20:
        recs.append({
            "category": "fertilizer",
            "priority": "High",
            "title": "Apply nitrogen-rich fertilizer",
            "description": (
                f"Soil nitrogen is {inp.nitrogen_ppm:.0f} ppm, below the 20 ppm threshold. "
                "Apply a split dose of urea or ammonium sulfate at sowing and top-dress at the "
                "vegetative stage to support canopy growth."
            ),
        })
    if inp.phosphorus_ppm < 15:
        recs.append({
            "category": "fertilizer",
            "priority": "Medium",
            "title": "Boost phosphorus for root development",
            "description": (
                f"Phosphorus is {inp.phosphorus_ppm:.0f} ppm. Apply DAP or single super phosphate "
                "at planting to strengthen early root establishment."
            ),
        })
    if inp.potassium_ppm < 20:
        recs.append({
            "category": "fertilizer",
            "priority": "Medium",
            "title": "Supplement potassium for stress tolerance",
            "description": (
                f"Potassium is {inp.potassium_ppm:.0f} ppm. Apply muriate of potash to improve "
                "drought and disease resilience during the reproductive stage."
            ),
        })
    if inp.ph_level < 5.5:
        recs.append({
            "category": "fertilizer",
            "priority": "High",
            "title": "Correct acidic soil with lime",
            "description": (
                f"Soil pH is {inp.ph_level:.1f} (acidic). Apply agricultural lime several weeks "
                "before planting to raise pH into the 6.0-7.0 optimal range."
            ),
        })
    elif inp.ph_level > 7.8:
        recs.append({
            "category": "fertilizer",
            "priority": "Medium",
            "title": "Correct alkaline soil with gypsum/sulfur",
            "description": (
                f"Soil pH is {inp.ph_level:.1f} (alkaline). Incorporate elemental sulfur or gypsum "
                "to improve nutrient availability."
            ),
        })

    if inp.irrigation_type == "Rainfed" and inp.rainfall_mm < 350:
        recs.append({
            "category": "irrigation",
            "priority": "High",
            "title": "Introduce supplemental irrigation",
            "description": (
                f"Recorded rainfall is only {inp.rainfall_mm:.0f} mm on a rainfed plot. Consider "
                "drip or sprinkler irrigation at critical growth stages to reduce drought stress."
            ),
        })
    elif inp.irrigation_type == "Flood":
        recs.append({
            "category": "irrigation",
            "priority": "Low",
            "title": "Consider upgrading to drip irrigation",
            "description": (
                "Flood irrigation uses significantly more water than drip systems and can "
                "increase nutrient leaching. A drip system typically improves water-use "
                "efficiency by 30-50%."
            ),
        })

    if inp.humidity_pct > 88:
        recs.append({
            "category": "pest",
            "priority": "High",
            "title": "Monitor for fungal disease",
            "description": (
                f"Humidity is {inp.humidity_pct:.0f}%, favourable for fungal pathogens. Scout the "
                "crop weekly and consider a preventive fungicide application if lesions appear."
            ),
        })
    if inp.temperature_c > 34:
        recs.append({
            "category": "pest",
            "priority": "Medium",
            "title": "Watch for heat-stress pests",
            "description": (
                "Elevated temperatures increase pressure from aphids and mites. Increase "
                "field scouting frequency during the hottest part of the day."
            ),
        })

    if inp.organic_matter_pct < 1.0:
        recs.append({
            "category": "general",
            "priority": "Medium",
            "title": "Improve soil organic matter",
            "description": (
                f"Organic matter is {inp.organic_matter_pct:.1f}%. Incorporate compost, farmyard "
                "manure, or a cover crop rotation to improve long-term soil structure and "
                "water retention."
            ),
        })

    if out.risk_level == "Low" and not recs:
        recs.append({
            "category": "general",
            "priority": "Low",
            "title": "Conditions are favourable",
            "description": (
                "Current soil and weather indicators are within optimal ranges for this crop. "
                "Maintain the existing management plan and continue routine monitoring."
            ),
        })

    return recs
