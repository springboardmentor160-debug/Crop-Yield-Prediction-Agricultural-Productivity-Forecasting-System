"""
YieldSense AI  -  Health Check Endpoints

Basic health and root endpoints.
"""

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get("/", summary="Root endpoint")
async def root():
    """Root endpoint  -  returns application info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": settings.APP_DESCRIPTION,
        "status": "running",
    }


@router.get("/health", summary="Health check")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
    }
