"""
YieldSense AI — FastAPI Application Entry Point

Initializes the FastAPI application, middleware, and routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.firebase.client import initialize_firebase


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Initializes Firebase on startup.
    """
    # Startup
    try:
        initialize_firebase()
        print("[Firebase] Firebase initialized successfully")
    except Exception as e:
        print(f"[Firebase] Firebase initialization warning: {e}")
        print("   The app will start, but Firebase-dependent features may not work.")

    yield

    # Shutdown
    print("[Application] Application shutting down")


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routers
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_application()
