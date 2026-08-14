from fastapi import APIRouter

router = APIRouter()


def soil_status(
    soil_type,
    crop_type,
    soil_ph,
    nitrogen,
    phosphorus,
    potassium
):

    # ---------------- Soil Health ---------------- #

    if 6.0 <= soil_ph <= 7.5:
        soil_health = "Good"
        ph_status = "Optimal"

    elif 5.5 <= soil_ph < 6.0:
        soil_health = "Moderate"
        ph_status = "Slightly Acidic"

    elif 7.5 < soil_ph <= 8.0:
        soil_health = "Moderate"
        ph_status = "Slightly Alkaline"

    elif soil_ph < 5.5:
        soil_health = "Poor"
        ph_status = "Acidic"

    else:
        soil_health = "Poor"
        ph_status = "Highly Alkaline"

    # ---------------- Nitrogen ---------------- #

    if nitrogen < 40:
        nitrogen_status = "Low"
    elif nitrogen <= 80:
        nitrogen_status = "Medium"
    else:
        nitrogen_status = "High"

    # ---------------- Phosphorus ---------------- #

    if phosphorus < 20:
        phosphorus_status = "Low"
    elif phosphorus <= 45:
        phosphorus_status = "Medium"
    else:
        phosphorus_status = "High"

    # ---------------- Potassium ---------------- #

    if potassium < 40:
        potassium_status = "Low"
    elif potassium <= 80:
        potassium_status = "Medium"
    else:
        potassium_status = "High"

    # ---------------- Fertilizer ---------------- #

    fertilizers = []

    if nitrogen_status == "Low":
        fertilizers.append("Nitrogen")

    if phosphorus_status == "Low":
        fertilizers.append("Phosphorus")

    if potassium_status == "Low":
        fertilizers.append("Potassium")

    if len(fertilizers) == 0:
        fertilizer = "Balanced NPK fertilizer is sufficient."

    elif len(fertilizers) == 1:
        fertilizer = f"Apply {fertilizers[0]} fertilizer."

    else:
        fertilizer = (
            "Apply "
            + ", ".join(fertilizers)
            + " fertilizers."
        )

    # ---------------- Irrigation ---------------- #

    if soil_ph < 5.5:
        irrigation = "Increase irrigation"

    elif soil_ph > 8:
        irrigation = "Reduce irrigation"

    else:
        irrigation = "Moderate irrigation"

    # ---------------- Crop Suitability ---------------- #

    if soil_health == "Good":

        crop_suitability = (
            f"{crop_type} is suitable for this soil."
        )

    elif soil_health == "Moderate":

        crop_suitability = (
            f"{crop_type} can be cultivated with proper soil management."
        )

    else:

        crop_suitability = (
            f"Soil improvement is recommended before cultivating {crop_type}."
        )

    return {

        "soil_health": soil_health,

        "ph_status": ph_status,

        "nitrogen_status": nitrogen_status,

        "phosphorus_status": phosphorus_status,

        "potassium_status": potassium_status,

        "fertilizer": fertilizer,

        "irrigation": irrigation,

        "crop_suitability": crop_suitability

    }