from pydantic import BaseModel


# -----------------------------
# User Registration
# -----------------------------
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str


# -----------------------------
# User Login
# -----------------------------
class UserLogin(BaseModel):
    email: str
    password: str


# -----------------------------
# Prediction Input
# -----------------------------
class PredictionInput(BaseModel):
    area: str
    crop_type: str
    year: int
    average_rain_fall_mm_per_year: float
    pesticides_tonnes: float
    avg_temp: float
    ph: float


# -----------------------------
# Save Prediction
# -----------------------------
class PredictionCreate(BaseModel):
    user_email: str
    crop: str
    rainfall: float
    pesticides: float
    temperature: float
    ph: float
    estimated_yield: float
    risk: str
    recommendation: str