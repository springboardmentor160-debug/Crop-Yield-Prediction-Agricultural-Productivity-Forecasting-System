"""
YieldSense AI — Agronomic Rule Engine Test Suite

Tests the pure advisory functions:
  - generate_farm_recommendations()
  - assess_farm_risk()

Covers all 11 core agronomic scenarios:
  1. Normal Farm
  2. Acidic Soil
  3. Alkaline Soil
  4. Low Predicted Yield
  5. Very Low Yield
  6. Low Rainfall
  7. High Rainfall
  8. Extreme Rainfall
  9. Poor Soil pH
  10. Compound Multiple Risks
  11. Missing Input Data
"""

import pytest

from app.services.farm_advisory_service import (
    generate_farm_recommendations,
    assess_farm_risk,
    SOIL_ACIDIC_THRESHOLD,
    SOIL_ALKALINE_THRESHOLD,
    SOIL_HIGH_RISK_PH_LOW,
    SOIL_HIGH_RISK_PH_HIGH,
    YIELD_LOW_THRESHOLD,
    YIELD_VERY_LOW_THRESHOLD,
    RAINFALL_WARNING_DEVIATION,
    RAINFALL_HIGH_RISK,
    RAINFALL_MODERATE_RISK,
    RISK_HIGH_SCORE,
)


def _get_rec_texts(recommendations):
    return [r.lower() for r in recommendations]


def test_scenario_1_normal_farm():
    recs = generate_farm_recommendations(
        soil_ph=6.5,
        predicted_yield=3.0,
        avg_yield=3.0,
        rainfall_deviation=0.0,
    )
    assert len(recs) == 1
    assert "all indicators look normal" in recs[0].lower()

    risk = assess_farm_risk(
        predicted_yield=3.0,
        avg_yield=3.0,
        rainfall_deviation=0.0,
        soil_ph=6.5,
    )
    assert risk["risk_level"] == "Low"
    assert risk["risk_score"] == 0
    assert len(risk["identified_risks"]) == 0


def test_scenario_2_acidic_soil():
    acidic_ph = 4.8
    assert acidic_ph < SOIL_ACIDIC_THRESHOLD

    recs = generate_farm_recommendations(
        soil_ph=acidic_ph,
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=None,
    )
    texts = _get_rec_texts(recs)
    assert any("acidic" in t for t in texts)
    assert any("lime" in t for t in texts)
    assert not any("alkaline" in t for t in texts)


def test_scenario_3_alkaline_soil():
    alkaline_ph = 8.2
    assert alkaline_ph > SOIL_ALKALINE_THRESHOLD

    recs = generate_farm_recommendations(
        soil_ph=alkaline_ph,
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=None,
    )
    texts = _get_rec_texts(recs)
    assert any("alkaline" in t for t in texts)
    assert any("compost" in t or "organic" in t for t in texts)
    assert not any("lime" in t for t in texts)


def test_scenario_4_low_predicted_yield():
    avg = 4.0
    predicted = avg * 0.75
    assert predicted < avg * YIELD_LOW_THRESHOLD

    recs = generate_farm_recommendations(
        soil_ph=6.5,
        predicted_yield=predicted,
        avg_yield=avg,
        rainfall_deviation=0.0,
    )
    texts = _get_rec_texts(recs)
    assert any("below" in t for t in texts)
    assert any("irrigation" in t or "fertilizer" in t for t in texts)


def test_scenario_5_very_low_yield():
    avg = 5.0
    predicted = avg * 0.6
    assert predicted < avg * YIELD_VERY_LOW_THRESHOLD

    risk = assess_farm_risk(
        predicted_yield=predicted,
        avg_yield=avg,
        rainfall_deviation=0.0,
        soil_ph=6.5,
    )
    assert risk["risk_score"] >= 2
    yield_risks = [r for r in risk["identified_risks"] if r["type"] == "Yield Risk"]
    assert len(yield_risks) == 1
    assert yield_risks[0]["severity"] == "High"


def test_scenario_6_low_rainfall():
    deviation = -25.0
    assert deviation < -RAINFALL_WARNING_DEVIATION

    recs = generate_farm_recommendations(
        soil_ph=6.5,
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=deviation,
    )
    texts = _get_rec_texts(recs)
    assert any("irrigation" in t for t in texts)
    assert any("below" in t for t in texts)


def test_scenario_7_high_rainfall():
    deviation = 30.0
    assert deviation > RAINFALL_WARNING_DEVIATION

    recs = generate_farm_recommendations(
        soil_ph=6.5,
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=deviation,
    )
    texts = _get_rec_texts(recs)
    assert any("drainage" in t or "waterlog" in t for t in texts)


def test_scenario_8_extreme_rainfall():
    deviation = -35.0
    assert abs(deviation) > RAINFALL_HIGH_RISK

    risk_extreme = assess_farm_risk(
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=deviation,
        soil_ph=6.5,
    )
    assert risk_extreme["risk_score"] >= 2

    moderate_dev = -20.0
    assert abs(moderate_dev) > RAINFALL_MODERATE_RISK
    assert abs(moderate_dev) <= RAINFALL_HIGH_RISK

    risk_moderate = assess_farm_risk(
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=moderate_dev,
        soil_ph=6.5,
    )
    assert risk_moderate["risk_score"] == 1


def test_scenario_9_poor_soil_ph():
    risk_acidic = assess_farm_risk(
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=0.0,
        soil_ph=4.5,
    )
    soil_risks = [r for r in risk_acidic["identified_risks"] if r["type"] == "Soil Risk"]
    assert len(soil_risks) == 1
    assert risk_acidic["risk_score"] >= 1

    risk_alkaline = assess_farm_risk(
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=0.0,
        soil_ph=8.5,
    )
    soil_risks_alk = [r for r in risk_alkaline["identified_risks"] if r["type"] == "Soil Risk"]
    assert len(soil_risks_alk) == 1
    assert risk_alkaline["risk_score"] >= 1


def test_scenario_10_multiple_problems():
    avg = 5.0
    predicted = avg * 0.55

    risk = assess_farm_risk(
        predicted_yield=predicted,
        avg_yield=avg,
        rainfall_deviation=-40.0,
        soil_ph=4.5,
    )
    assert risk["risk_score"] >= RISK_HIGH_SCORE
    assert risk["risk_level"] == "High"
    assert len(risk["identified_risks"]) == 3


def test_scenario_11_missing_data():
    recs = generate_farm_recommendations(
        soil_ph=None,
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=None,
    )
    assert len(recs) == 1
    assert "all indicators look normal" in recs[0].lower()

    risk = assess_farm_risk(
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=None,
        soil_ph=None,
    )
    assert risk["risk_score"] == 0
    assert risk["risk_level"] == "Low"
    assert len(risk["identified_risks"]) == 0


def test_no_double_counting_yield_risk():
    avg = 10.0
    predicted = avg * 0.65
    risk = assess_farm_risk(
        predicted_yield=predicted,
        avg_yield=avg,
        rainfall_deviation=0.0,
        soil_ph=6.5,
    )
    yield_risks = [r for r in risk["identified_risks"] if r["type"] == "Yield Risk"]
    assert len(yield_risks) == 1
    assert risk["risk_score"] == 2


def test_no_double_counting_rainfall_risk():
    risk = assess_farm_risk(
        predicted_yield=None,
        avg_yield=None,
        rainfall_deviation=50.0,
        soil_ph=6.5,
    )
    rainfall_risks = [r for r in risk["identified_risks"] if r["type"] == "Rainfall Risk"]
    assert len(rainfall_risks) == 1
    assert risk["risk_score"] == 2


def test_ph_within_normal_range_no_recommendation():
    for ph in [5.5, 6.0, 6.5, 7.0, 7.5]:
        recs = generate_farm_recommendations(
            soil_ph=ph,
            predicted_yield=None,
            avg_yield=None,
            rainfall_deviation=None,
        )
        texts = _get_rec_texts(recs)
        assert not any("acidic" in t for t in texts)
        assert not any("alkaline" in t for t in texts)


def test_yield_within_normal_range_no_recommendation():
    avg = 4.0
    for ratio in [0.85, 0.90, 0.95, 1.0, 1.05]:
        predicted = avg * ratio
        recs = generate_farm_recommendations(
            soil_ph=6.5,
            predicted_yield=predicted,
            avg_yield=avg,
            rainfall_deviation=0.0,
        )
        texts = _get_rec_texts(recs)
        assert not any("below" in t and "average" in t for t in texts)
        assert not any("above" in t and "average" in t for t in texts)


def test_rainfall_within_normal_range_no_recommendation():
    for dev in [-20, -10, 0, 10, 20]:
        recs = generate_farm_recommendations(
            soil_ph=6.5,
            predicted_yield=None,
            avg_yield=None,
            rainfall_deviation=float(dev),
        )
        texts = _get_rec_texts(recs)
        assert not any("irrigation" in t for t in texts)
        assert not any("drainage" in t for t in texts)


def test_recommendations_never_empty():
    cases = [
        (None, None, None, None),
        (6.5, 3.0, 3.0, 0.0),
        (5.0, None, None, None),
    ]
    for soil_ph, pred, avg, rain_dev in cases:
        recs = generate_farm_recommendations(soil_ph, pred, avg, rain_dev)
        assert len(recs) > 0
