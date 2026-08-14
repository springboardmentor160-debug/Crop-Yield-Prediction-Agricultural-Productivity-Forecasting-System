from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router

from routes.farm import router as farm_router
from routes.dashboard import router as dashboard_router
from routes.recommendation import router as recommendation_router
from routes.analytics import router as analytics_router
from routes.weather import router as weather_router

from routes.predict import router as predict_router

app=FastAPI(title="YieldSense AI")

app.add_middleware(

    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]

)

app.include_router(auth_router)

app.include_router(farm_router)
app.include_router(dashboard_router)

app.include_router(predict_router)
app.include_router(recommendation_router)
app.include_router(analytics_router)
app.include_router(weather_router)

@app.get("/")
def home():

    return {
        "message":"YieldSense Backend Running"
    }