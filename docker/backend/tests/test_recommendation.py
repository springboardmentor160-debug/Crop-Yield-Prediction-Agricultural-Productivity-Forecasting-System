# backend/tests/test_recommendation.py
"""
Covers the Week 6 self-check items directly:
- generate_recommendation() returns sensible, varied tips for 3+ scenarios
- assess_risk() correctly returns Low/Medium/High for different inputs
- a "no problems" farm gets the fallback message, not a blank result
"""
import pytest
from app.recommendation import generate_recommendation, assess_risk, generate_recommendation_and_risk


class TestGenerateRecommendation:
    def test_acidic_soil_flagged(self):
        tips = generate_recommendation(soil_ph=5.0, predicted_yield=5, avg_yield=5, rainfall_deviation=0)
        assert any("acidic" in t.lower() for t in tips)

    def test_alkaline_soil_flagged(self):
        tips = generate_recommendation(soil_ph=8.0, predicted_yield=5, avg_yield=5, rainfall_deviation=0)
        assert any("alkaline" in t.lower() for t in tips)

    def test_below_average_yield_flagged(self):
        tips = generate_recommendation(soil_ph=6.5, predicted_yield=3, avg_yield=5, rainfall_deviation=0)
        assert any("below average" in t.lower() for t in tips)

    def test_above_average_yield_flagged(self):
        tips = generate_recommendation(soil_ph=6.5, predicted_yield=6, avg_yield=5, rainfall_deviation=0)
        assert any("above average" in t.lower() for t in tips)

    def test_low_rainfall_flagged(self):
        tips = generate_recommendation(soil_ph=6.5, predicted_yield=5, avg_yield=5, rainfall_deviation=-25)
        assert any("below normal" in t.lower() for t in tips)

    def test_high_rainfall_flagged(self):
        tips = generate_recommendation(soil_ph=6.5, predicted_yield=5, avg_yield=5, rainfall_deviation=25)
        assert any("above normal" in t.lower() for t in tips)

    def test_no_problems_returns_fallback_not_empty(self):
        # A farm with no problems should never return a blank list.
        tips = generate_recommendation(soil_ph=6.5, predicted_yield=5, avg_yield=5, rainfall_deviation=0)
        assert len(tips) >= 1
        assert "normal" in tips[0].lower()


class TestAssessRisk:
    def test_low_risk(self):
        assert assess_risk(predicted_yield=5, avg_yield=5, rainfall_deviation=0, soil_ph=6.5) == "Low"

    def test_medium_risk(self):
        # yield 15% below avg (1 pt) + rainfall 20% off (1 pt) = score 2 -> Medium
        assert assess_risk(predicted_yield=4.25, avg_yield=5, rainfall_deviation=20, soil_ph=6.5) == "Medium"

    def test_high_risk(self):
        # yield 40% below avg (2 pts) + rainfall 35% off (2 pts) + bad pH (1 pt) = 5 -> High
        assert assess_risk(predicted_yield=3, avg_yield=5, rainfall_deviation=35, soil_ph=4.5) == "High"

    def test_handles_zero_avg_yield_without_crashing(self):
        # Guards against a farm with no prediction history yet
        result = assess_risk(predicted_yield=5, avg_yield=0, rainfall_deviation=0, soil_ph=6.5)
        assert result in ("Low", "Medium", "High")


class TestGenerateRecommendationAndRisk:
    def test_bundles_both_fields(self):
        result = generate_recommendation_and_risk(
            soil_ph=6.5, predicted_yield=5, avg_yield=5, rainfall_deviation=0
        )
        assert "recommendations" in result
        assert "risk_level" in result
        assert isinstance(result["recommendations"], list)
        assert result["risk_level"] in ("Low", "Medium", "High")
