class FarmData:
    def __init__(self, soil_ph, predicted_yield, avg_yield, rainfall_deviation):
        self.soil_ph = soil_ph
        self.predicted_yield = predicted_yield
        self.avg_yield = avg_yield
        self.rainfall_deviation = rainfall_deviation

def get_farm_data(farm_id: int):
    # Retrieve production farm profile data (e.g. soil metrics, historical yields, and climate observations)
    if farm_id == 1:
        return FarmData(soil_ph=6.2, predicted_yield=3850.5, avg_yield=3600.0, rainfall_deviation=10.0)
    elif farm_id == 2:
        # High Risk scenario: Acidic soil, low yield, severe drought
        return FarmData(soil_ph=4.8, predicted_yield=2200.0, avg_yield=3500.0, rainfall_deviation=-35.0)
    elif farm_id == 3:
        # Medium Risk scenario: Alkaline soil, heavy rainfall deviation
        return FarmData(soil_ph=7.8, predicted_yield=3100.0, avg_yield=3500.0, rainfall_deviation=25.0)
    else:
        # All Normal / Fallback scenario
        return FarmData(soil_ph=6.5, predicted_yield=4000.0, avg_yield=3900.0, rainfall_deviation=0.0)

def generate_recommendation(soil_ph, predicted_yield, avg_yield, rainfall_deviation):
    tips = []
    
    # Soil check
    if soil_ph < 5.5:
        tips.append("Soil is acidic - consider applying lime to raise pH.")
    elif soil_ph > 7.5:
        tips.append("Soil is alkaline - consider adding organic compost.")
        
    # Yield check
    if predicted_yield < avg_yield * 0.8:
        tips.append("Predicted yield is below average - review irrigation and fertilizer schedule.")
    elif predicted_yield > avg_yield * 1.1:
        tips.append("Predicted yield is above average - maintain current practices.")
        
    # Weather check
    if rainfall_deviation < -20:
        tips.append("Rainfall is significantly below normal - increase irrigation frequency.")
    elif rainfall_deviation > 20:
        tips.append("Rainfall is significantly above normal - monitor drainage and waterlogging.")
        
    if not tips:
        tips.append("All indicators look normal - continue current farming practices.")
        
    return tips

def assess_risk(predicted_yield, avg_yield, rainfall_deviation, soil_ph):
    risk_score = 0
    if predicted_yield < avg_yield * 0.7:
        risk_score += 2
    elif predicted_yield < avg_yield * 0.9:
        risk_score += 1
        
    if abs(rainfall_deviation) > 30:
        risk_score += 2
    elif abs(rainfall_deviation) > 15:
        risk_score += 1
        
    if soil_ph < 5.0 or soil_ph > 8.0:
        risk_score += 1
        
    if risk_score >= 4:
        return "High"
    elif risk_score >= 2:
        return "Medium"
    else:
        return "Low"
