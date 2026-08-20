from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine
from app.models import agronomy, farm, prediction, user  # noqa: F401  (register models with Base)
from app.routers import analytics, auth, crops, farms, predictions, recommendations, soil, users, weather

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered crop yield prediction and agricultural productivity "
        "forecasting platform. Provides authentication and role-based "
        "access control, farm/crop/weather/soil data management, an "
        "ML-based yield prediction pipeline, analytics dashboards, and "
        "an automated agronomic recommendation engine."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(farms.router)
app.include_router(crops.router)
app.include_router(weather.router)
app.include_router(soil.router)
app.include_router(predictions.router)
app.include_router(recommendations.router)
app.include_router(analytics.router)
