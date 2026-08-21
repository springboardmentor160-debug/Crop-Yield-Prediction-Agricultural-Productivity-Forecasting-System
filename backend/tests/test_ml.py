import pytest
from services.ml_service import predict_yield, recommend_crop

def test_predict_yield_valid_input():
    # Provide expected inputs: Area, Crop, Rainfall, Temp
    result = predict_yield("India", "Rice", 2.0, 25.0)
    assert isinstance(result, float)
    assert result >= 0.0

def test_recommend_crop_valid_input():
    # Provide inputs: n, p, k, temp, humidity, ph, rainfall
    result = recommend_crop(90, 42, 43, 20.8, 82.0, 6.5, 202.9)
    assert isinstance(result, dict)
    assert "recommended_crop" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], float)

def test_invalid_yield_input():
    result = predict_yield("Unknown", "UnknownCrop", -10, -500)
    assert isinstance(result, float)
