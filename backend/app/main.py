import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    analytics,
    auth,
    datasets,
    farms,
    predictions,
    reports,
    soil_analysis,
    weather_analysis,
)
from app.api.routes.crop_recommendation import (
    router as crop_recommendation_router,
)
from app.core.config import settings
from app.core.logging_config import configure_logging
from app.middleware.request_logging import (
    request_logging_middleware,
)

# These imports register the SQLAlchemy models for Alembic/model discovery.

configure_logging()

logger = logging.getLogger("yieldsense.application")

cors_origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("YieldSense AI API started successfully")

    yield

    logger.info("YieldSense AI API stopped")


app = FastAPI(
    title="YieldSense AI API",
    description=(
        "Crop Yield Prediction and Agricultural "
        "Productivity Forecasting System"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


app.middleware("http")(request_logging_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(datasets.router)
app.include_router(farms.router)
app.include_router(predictions.router)
app.include_router(weather_analysis.router)
app.include_router(soil_analysis.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(
    crop_recommendation_router,
    prefix="/api",
)

@app.get("/")
def root():
    return {
        "message": "YieldSense AI Backend is running successfully"
    }


@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "healthy",
        "service": "YieldSense AI API",
        "version": "1.0.0",
    }