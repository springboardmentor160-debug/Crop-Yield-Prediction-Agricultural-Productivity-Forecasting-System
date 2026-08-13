"""
YieldSense AI - AI Advisor Router
Module 10: AI chat assistant and smart farming advice
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app import models
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/advisor", tags=["AI Advisor"])

class ChatMessage(BaseModel):
    message: str

@router.post("/chat")
def ai_chat(
    msg: ChatMessage,
    current_user: models.User = Depends(get_current_user)
):
    message = msg.message.lower()
    response = ""

    if any(word in message for word in ["crop", "grow", "plant", "what crop"]):
        response = "Based on current soil and weather conditions, I recommend Wheat or Maize for maximum yield. Wheat performs best with 600-900mm rainfall and temperatures between 15-25°C. Maize is more drought-tolerant and can yield 4-6 tons/ha under good conditions."
    elif any(word in message for word in ["fertilizer", "nutrient", "npk", "nitrogen"]):
        response = "For optimal crop growth, I recommend a balanced NPK fertilizer. Apply Urea (46-0-0) at 50kg/ha for nitrogen, DAP (18-46-0) at 25kg/ha for phosphorus, and MOP at 30kg/ha for potassium. Apply at sowing and top-dress at 30 days."
    elif any(word in message for word in ["water", "irrigation", "irrigate"]):
        response = "For efficient irrigation, use drip irrigation to save 40% water. Most crops need 5-10mm of water per day. Irrigate early morning (5-7 AM) to minimize evaporation. Monitor soil moisture — it should be 40-60% field capacity."
    elif any(word in message for word in ["disease", "pest", "sick", "problem"]):
        response = "Common crop diseases include rust, blight, and mildew. Prevention is key: use certified seeds, crop rotation, and balanced fertilization. Monitor weekly for early symptoms. Apply fungicide only when disease threshold is reached."
    elif any(word in message for word in ["yield", "production", "harvest", "predict"]):
        response = "Yield depends on crop variety, soil health, weather, and management. Use our Yield Prediction module for AI-powered forecasts. Average yields: Wheat 3-5 t/ha, Rice 3-5 t/ha, Maize 4-6 t/ha, Soybean 2-3 t/ha."
    elif any(word in message for word in ["weather", "rain", "temperature"]):
        response = "Check our Weather module for real-time weather data and 7-day forecasts. Weather significantly impacts crop yield — optimal temperature for most crops is 20-30°C. Monitor rainfall and supplement with irrigation when needed."
    elif any(word in message for word in ["soil", "ph", "fertility"]):
        response = "Healthy soil is the foundation of good crops. Optimal soil pH is 6.0-7.0. Test soil every season. Add organic matter to improve structure. Balanced NPK nutrition ensures maximum yield. Use our Soil Analysis module for detailed assessment."
    elif any(word in message for word in ["profit", "money", "income", "cost"]):
        response = "Crop profitability depends on yield, market price, and input costs. Typical wheat profit: ₹20,000-40,000/ha. Reduce costs by using drip irrigation, integrated nutrient management, and crop rotation. Check our Reports module for profit estimates."
    else:
        response = f"Hello {current_user.full_name}! I'm your YieldSense AI agricultural advisor. Ask me about crops, fertilizers, irrigation, disease, yield prediction, or soil health. I'm here to help you make the best farming decisions!"

    return {
        "user_message": msg.message,
        "ai_response": response,
        "suggestions": [
            "What crop should I grow this season?",
            "How much fertilizer do I need?",
            "When should I irrigate?",
            "What is the disease risk?",
        ]
    }

@router.get("/tasks")
def get_daily_tasks(current_user: models.User = Depends(get_current_user)):
    return {
        "date": "Today",
        "tasks": [
            {"id": 1, "priority": "high", "icon": "🌾", "task": "Check crop growth stage", "time": "Morning", "done": False},
            {"id": 2, "priority": "high", "icon": "💧", "task": "Irrigation scheduled", "time": "6:00 AM", "done": False},
            {"id": 3, "priority": "medium", "icon": "🧪", "task": "Soil moisture check", "time": "10:00 AM", "done": False},
            {"id": 4, "priority": "medium", "icon": "🌤️", "task": "Review weather forecast", "time": "Afternoon", "done": False},
            {"id": 5, "priority": "low", "icon": "📊", "task": "Update yield prediction", "time": "Evening", "done": False},
            {"id": 6, "priority": "low", "icon": "🦠", "task": "Weekly disease monitoring", "time": "5:00 PM", "done": False},
        ]
    }

@router.get("/insights")
def get_ai_insights(current_user: models.User = Depends(get_current_user)):
    return {
        "insights": [
            {"icon": "🌾", "title": "Optimal Planting Window", "insight": "Next 2 weeks are ideal for wheat sowing based on weather forecast.", "confidence": 88},
            {"icon": "💧", "title": "Water Conservation", "insight": "Switching to drip irrigation can reduce water usage by 35% this season.", "confidence": 92},
            {"icon": "🧪", "title": "Soil Improvement", "insight": "Adding vermicompost can improve soil organic carbon by 0.5% in one season.", "confidence": 85},
            {"icon": "📈", "title": "Yield Prediction", "insight": "Based on current conditions, expect 10-15% higher yield than last season.", "confidence": 79},
            {"icon": "💰", "title": "Profit Opportunity", "insight": "Market prices for soybean are projected to rise in September. Consider planting.", "confidence": 72},
        ]
    }

@router.get("/calendar")
def get_crop_calendar(
    crop_type: str = "wheat",
    current_user: models.User = Depends(get_current_user)
):
    calendars = {
        "wheat": [
            {"month": "October", "activity": "Land Preparation", "type": "sowing", "description": "Plow and prepare field, apply basal fertilizer"},
            {"month": "November", "activity": "Sowing", "type": "sowing", "description": "Sow wheat seeds at 100kg/ha depth 5cm"},
            {"month": "December", "activity": "First Irrigation", "type": "irrigation", "description": "Crown root initiation stage irrigation"},
            {"month": "January", "activity": "Top Dressing", "type": "fertilizer", "description": "Apply urea 50kg/ha as top dressing"},
            {"month": "February", "activity": "Second Irrigation", "type": "irrigation", "description": "Jointing stage irrigation"},
            {"month": "March", "activity": "Disease Monitoring", "type": "protection", "description": "Monitor for rust and apply fungicide if needed"},
            {"month": "April", "activity": "Harvest", "type": "harvest", "description": "Harvest when grain moisture is 14%"},
        ],
        "rice": [
            {"month": "June", "activity": "Nursery Preparation", "type": "sowing", "description": "Prepare nursery beds, sow seeds"},
            {"month": "July", "activity": "Transplanting", "type": "sowing", "description": "Transplant seedlings at 25x25cm spacing"},
            {"month": "August", "activity": "Tillering Stage", "type": "fertilizer", "description": "Apply nitrogen fertilizer"},
            {"month": "September", "activity": "Panicle Initiation", "type": "irrigation", "description": "Maintain 5cm water level"},
            {"month": "October", "activity": "Grain Filling", "type": "protection", "description": "Monitor for blast disease"},
            {"month": "November", "activity": "Harvest", "type": "harvest", "description": "Harvest at 20% moisture content"},
        ],
    }
    calendar = calendars.get(crop_type.lower(), calendars["wheat"])
    return {
        "crop_type": crop_type,
        "season": "2026",
        "calendar": calendar,
        "next_activity": calendar[0] if calendar else None,
    }
