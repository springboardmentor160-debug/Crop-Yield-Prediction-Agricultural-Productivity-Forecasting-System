from __future__ import annotations

from collections.abc import Sequence

from fastapi import HTTPException, status
from sqlalchemy import distinct, select
from sqlalchemy.orm import Session

from app.models.agriculture import StateWeatherReference
from app.schemas.weather_analysis import (
    WeatherAnalysisOptionsResponse,
    WeatherAnalysisRecord,
    WeatherAnalysisResponse,
    WeatherAnalysisSummary,
    WeatherMetricAssessment,
    WeatherMetricSummary,
    WeatherRiskAssessment,
    WeatherTrend,
)


def round_value(
    value: float,
    digits: int = 2,
) -> float:
    return round(float(value), digits)


def calculate_percentage_change(
    start_value: float,
    end_value: float,
) -> float:
    if start_value == 0:
        return 0.0

    change = (
        (end_value - start_value)
        / abs(start_value)
    ) * 100

    return round_value(change)


def get_direction(
    change: float,
    stable_threshold: float,
) -> str:
    if abs(change) <= stable_threshold:
        return "stable"

    if change > 0:
        return "increasing"

    return "decreasing"


def build_metric_summary(
    values: Sequence[float],
) -> WeatherMetricSummary:
    if not values:
        return WeatherMetricSummary(
            average=0.0,
            minimum=0.0,
            maximum=0.0,
        )

    return WeatherMetricSummary(
        average=round_value(
            sum(values) / len(values)
        ),
        minimum=round_value(min(values)),
        maximum=round_value(max(values)),
    )


def assess_temperature(
    average_temperature: float,
    temperature_change: float,
) -> WeatherMetricAssessment:
    if average_temperature < 15:
        return WeatherMetricAssessment(
            status="Cool",
            risk_level="Medium",
            message=(
                "Low average temperatures may slow crop "
                "growth and delay crop development."
            ),
        )

    if average_temperature <= 30:
        if temperature_change > 1.5:
            return WeatherMetricAssessment(
                status="Suitable but warming",
                risk_level="Medium",
                message=(
                    "Temperature is generally suitable, "
                    "but the warming trend may increase "
                    "crop water requirements."
                ),
            )

        return WeatherMetricAssessment(
            status="Suitable",
            risk_level="Low",
            message=(
                "Average temperature conditions are "
                "generally suitable for crop growth."
            ),
        )

    if average_temperature <= 35:
        return WeatherMetricAssessment(
            status="Warm",
            risk_level="Medium",
            message=(
                "Warm conditions may increase evaporation "
                "and crop irrigation requirements."
            ),
        )

    return WeatherMetricAssessment(
        status="Very hot",
        risk_level="High",
        message=(
            "Very high temperatures may cause crop heat "
            "stress, moisture loss and reduced productivity."
        ),
    )


def assess_rainfall(
    average_rainfall: float,
    rainfall_change_percent: float,
) -> WeatherMetricAssessment:
    if average_rainfall < 500:
        return WeatherMetricAssessment(
            status="Low rainfall",
            risk_level="High",
            message=(
                "Rainfall is low and irrigation planning "
                "may be necessary to reduce water stress."
            ),
        )

    if average_rainfall < 800:
        return WeatherMetricAssessment(
            status="Moderate rainfall",
            risk_level="Medium",
            message=(
                "Rainfall may support crop growth, but "
                "supplementary irrigation could be required."
            ),
        )

    if average_rainfall <= 1600:
        if rainfall_change_percent < -15:
            return WeatherMetricAssessment(
                status="Suitable but decreasing",
                risk_level="Medium",
                message=(
                    "Average rainfall is generally suitable, "
                    "but the decreasing trend should be "
                    "considered during irrigation planning."
                ),
            )

        return WeatherMetricAssessment(
            status="Suitable rainfall",
            risk_level="Low",
            message=(
                "Rainfall conditions are generally suitable "
                "for agricultural production."
            ),
        )

    return WeatherMetricAssessment(
        status="High rainfall",
        risk_level="Medium",
        message=(
            "High rainfall may increase waterlogging, soil "
            "erosion and crop disease risks."
        ),
    )


def assess_humidity(
    average_humidity: float,
    humidity_change: float,
) -> WeatherMetricAssessment:
    if average_humidity < 40:
        return WeatherMetricAssessment(
            status="Dry",
            risk_level="Medium",
            message=(
                "Low humidity may increase crop moisture "
                "loss and irrigation requirements."
            ),
        )

    if average_humidity <= 75:
        if humidity_change > 8:
            return WeatherMetricAssessment(
                status="Suitable but increasing",
                risk_level="Medium",
                message=(
                    "Humidity is generally suitable, but the "
                    "increasing trend may require crop disease "
                    "monitoring."
                ),
            )

        return WeatherMetricAssessment(
            status="Suitable",
            risk_level="Low",
            message=(
                "Humidity conditions are generally suitable "
                "for crop growth."
            ),
        )

    return WeatherMetricAssessment(
        status="High humidity",
        risk_level="High",
        message=(
            "High humidity may increase fungal disease, "
            "pest and crop infection risks."
        ),
    )


def build_overall_assessment(
    temperature: WeatherMetricAssessment,
    rainfall: WeatherMetricAssessment,
    humidity: WeatherMetricAssessment,
) -> WeatherRiskAssessment:
    risk_priority = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
    }

    assessments = [
        temperature,
        rainfall,
        humidity,
    ]

    overall_risk = max(
        assessments,
        key=lambda item: risk_priority.get(
            item.risk_level,
            1,
        ),
    ).risk_level

    if overall_risk == "Low":
        overall_status = "Favourable"
        overall_message = (
            "The selected weather conditions are generally "
            "favourable for agricultural production."
        )
    elif overall_risk == "Medium":
        overall_status = "Moderately favourable"
        overall_message = (
            "The selected weather conditions are usable, "
            "but irrigation, crop health and seasonal "
            "conditions should be monitored."
        )
    else:
        overall_status = "Risky"
        overall_message = (
            "The selected weather conditions contain one "
            "or more significant agricultural risks that "
            "require preventive planning."
        )

    return WeatherRiskAssessment(
        temperature=temperature,
        rainfall=rainfall,
        humidity=humidity,
        overall_risk_level=overall_risk,
        overall_status=overall_status,
        overall_message=overall_message,
    )


def get_weather_analysis_options(
    db: Session,
) -> WeatherAnalysisOptionsResponse:
    state_result = db.execute(
        select(
            distinct(StateWeatherReference.state)
        ).order_by(StateWeatherReference.state)
    )

    states = [
        state
        for state in state_result.scalars().all()
        if state
    ]

    year_result = db.execute(
        select(
            distinct(StateWeatherReference.year)
        ).order_by(StateWeatherReference.year)
    )

    years = [
        int(year)
        for year in year_result.scalars().all()
        if year is not None
    ]

    return WeatherAnalysisOptionsResponse(
        states=states,
        years=years,
        minimum_year=min(years) if years else None,
        maximum_year=max(years) if years else None,
    )


def analyze_weather(
    db: Session,
    state: str,
    start_year: int,
    end_year: int,
) -> WeatherAnalysisResponse:
    normalized_state = state.strip()

    statement = (
        select(StateWeatherReference)
        .where(
            StateWeatherReference.state
            == normalized_state,
            StateWeatherReference.year
            >= start_year,
            StateWeatherReference.year
            <= end_year,
        )
        .order_by(StateWeatherReference.year)
    )

    result = db.execute(statement)

    weather_rows = list(
        result.scalars().all()
    )

    if not weather_rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No weather records were found for "
                f"{normalized_state} between "
                f"{start_year} and {end_year}."
            ),
        )

    records = [
        WeatherAnalysisRecord(
            year=row.year,
            avg_temp_c=round_value(
                row.avg_temp_c
            ),
            total_rainfall_mm=round_value(
                row.total_rainfall_mm
            ),
            avg_humidity_percent=round_value(
                row.avg_humidity_percent
            ),
        )
        for row in weather_rows
    ]

    temperature_values = [
        record.avg_temp_c
        for record in records
    ]

    rainfall_values = [
        record.total_rainfall_mm
        for record in records
    ]

    humidity_values = [
        record.avg_humidity_percent
        for record in records
    ]

    summary = WeatherAnalysisSummary(
        temperature=build_metric_summary(
            temperature_values
        ),
        rainfall=build_metric_summary(
            rainfall_values
        ),
        humidity=build_metric_summary(
            humidity_values
        ),
    )

    first_record = records[0]
    last_record = records[-1]

    temperature_change = round_value(
        last_record.avg_temp_c
        - first_record.avg_temp_c
    )

    rainfall_change = round_value(
        last_record.total_rainfall_mm
        - first_record.total_rainfall_mm
    )

    rainfall_change_percent = (
        calculate_percentage_change(
            first_record.total_rainfall_mm,
            last_record.total_rainfall_mm,
        )
    )

    humidity_change = round_value(
        last_record.avg_humidity_percent
        - first_record.avg_humidity_percent
    )

    trend = WeatherTrend(
        start_year=first_record.year,
        end_year=last_record.year,
        temperature_change_c=temperature_change,
        rainfall_change_mm=rainfall_change,
        rainfall_change_percent=(
            rainfall_change_percent
        ),
        humidity_change_percent=humidity_change,
        temperature_direction=get_direction(
            temperature_change,
            stable_threshold=0.2,
        ),
        rainfall_direction=get_direction(
            rainfall_change_percent,
            stable_threshold=3.0,
        ),
        humidity_direction=get_direction(
            humidity_change,
            stable_threshold=2.0,
        ),
    )

    temperature_assessment = (
        assess_temperature(
            summary.temperature.average,
            temperature_change,
        )
    )

    rainfall_assessment = assess_rainfall(
        summary.rainfall.average,
        rainfall_change_percent,
    )

    humidity_assessment = assess_humidity(
        summary.humidity.average,
        humidity_change,
    )

    assessment = build_overall_assessment(
        temperature=temperature_assessment,
        rainfall=rainfall_assessment,
        humidity=humidity_assessment,
    )

    return WeatherAnalysisResponse(
        state=normalized_state,
        start_year=first_record.year,
        end_year=last_record.year,
        total_records=len(records),
        summary=summary,
        trend=trend,
        assessment=assessment,
        records=records,
    )