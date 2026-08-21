from sqlalchemy.orm import Session

from app.models.agriculture import StateSoilReference
from app.schemas.soil_analysis import (
    SoilAnalysisOptionsResponse,
    SoilAnalysisResponse,
    SoilAnalysisSummary,
    SoilMetric,
    SoilRecommendation,
)


def get_soil_analysis_options(
    db: Session,
) -> SoilAnalysisOptionsResponse:
    states = (
        db.query(StateSoilReference.state)
        .distinct()
        .order_by(StateSoilReference.state)
        .all()
    )

    return SoilAnalysisOptionsResponse(
        states=[state[0] for state in states],
    )


def classify_nitrogen(value: float) -> str:
    if value < 280:
        return "Low"

    if value <= 450:
        return "Optimal"

    return "High"


def classify_phosphorus(value: float) -> str:
    if value < 20:
        return "Low"

    if value <= 40:
        return "Optimal"

    return "High"


def classify_potassium(value: float) -> str:
    if value < 150:
        return "Low"

    if value <= 300:
        return "Optimal"

    return "High"


def classify_ph(value: float) -> str:
    if value < 6.5:
        return "Acidic"

    if value <= 7.5:
        return "Neutral"

    return "Alkaline"


def build_recommendations(
    nitrogen_status: str,
    phosphorus_status: str,
    potassium_status: str,
    ph_status: str,
) -> list[SoilRecommendation]:
    recommendations = []

    if nitrogen_status == "Low":
        recommendations.append(
            SoilRecommendation(
                title="Nitrogen",
                message="Apply nitrogen-rich fertilizers to improve crop growth.",
            )
        )

    elif nitrogen_status == "High":
        recommendations.append(
            SoilRecommendation(
                title="Nitrogen",
                message=(
                    "Reduce nitrogen fertilizer to avoid "
                    "excessive vegetative growth."
                ),
            )
        )

    if phosphorus_status == "Low":
        recommendations.append(
            SoilRecommendation(
                title="Phosphorus",
                message="Use phosphorus fertilizers to improve root development.",
            )
        )

    elif phosphorus_status == "High":
        recommendations.append(
            SoilRecommendation(
                title="Phosphorus",
                message="Avoid excess phosphorus application.",
            )
        )

    if potassium_status == "Low":
        recommendations.append(
            SoilRecommendation(
                title="Potassium",
                message="Increase potassium fertilizer for better plant resistance.",
            )
        )

    elif potassium_status == "High":
        recommendations.append(
            SoilRecommendation(
                title="Potassium",
                message="Current potassium level is sufficient. Avoid overuse.",
            )
        )

    if ph_status == "Acidic":
        recommendations.append(
            SoilRecommendation(
                title="Soil pH",
                message="Apply agricultural lime to increase soil pH.",
            )
        )

    elif ph_status == "Alkaline":
        recommendations.append(
            SoilRecommendation(
                title="Soil pH",
                message="Apply sulfur or organic matter to lower soil pH.",
            )
        )

    if not recommendations:
        recommendations.append(
            SoilRecommendation(
                title="Overall",
                message="Current soil conditions are suitable for cultivation.",
            )
        )

    return recommendations


def determine_overall_health(
    nitrogen_status: str,
    phosphorus_status: str,
    potassium_status: str,
    ph_status: str,
) -> str:
    healthy = 0

    if nitrogen_status == "Optimal":
        healthy += 1

    if phosphorus_status == "Optimal":
        healthy += 1

    if potassium_status == "Optimal":
        healthy += 1

    if ph_status == "Neutral":
        healthy += 1

    if healthy == 4:
        return "Excellent"

    if healthy >= 3:
        return "Healthy"

    if healthy >= 2:
        return "Moderate"

    return "Poor"


def analyze_soil(
    db: Session,
    state: str,
) -> SoilAnalysisResponse:
    soil = (
        db.query(StateSoilReference)
        .filter(StateSoilReference.state == state)
        .first()
    )

    if soil is None:
        raise ValueError(
            "Soil reference data not found for the selected state."
        )

    nitrogen_status = classify_nitrogen(soil.nitrogen)
    phosphorus_status = classify_phosphorus(soil.phosphorus)
    potassium_status = classify_potassium(soil.potassium)
    ph_status = classify_ph(soil.ph)

    summary = SoilAnalysisSummary(
        nitrogen=SoilMetric(
            average=round(soil.nitrogen, 2),
            status=nitrogen_status,
        ),
        phosphorus=SoilMetric(
            average=round(soil.phosphorus, 2),
            status=phosphorus_status,
        ),
        potassium=SoilMetric(
            average=round(soil.potassium, 2),
            status=potassium_status,
        ),
        ph=SoilMetric(
            average=round(soil.ph, 2),
            status=ph_status,
        ),
    )

    return SoilAnalysisResponse(
        state=soil.state,
        summary=summary,
        overall_health=determine_overall_health(
            nitrogen_status,
            phosphorus_status,
            potassium_status,
            ph_status,
        ),
        recommendations=build_recommendations(
            nitrogen_status,
            phosphorus_status,
            potassium_status,
            ph_status,
        ),
    )