"""
YieldSense AI  -  Application Configuration

Centralizes all environment-driven settings using pydantic-settings.
All configuration is loaded from environment variables or .env file.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Firebase ----
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH: str = "./serviceAccountKey.json"
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_WEB_API_KEY: str = ""

    # ---- API ----
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # ---- CORS ----
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list, ensuring vercel origins are supported."""
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        # Automatically include production and preview Vercel origins if not explicitly listed
        default_vercels = ["https://yield-sense-ai.vercel.app"]
        for v in default_vercels:
            if v not in origins:
                origins.append(v)
        return origins

    # ---- Application Metadata ----
    APP_NAME: str = "YieldSense AI"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = (
        "AI-powered Crop Yield Prediction and Agricultural Productivity Forecasting System"
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance  -  ensures settings are loaded once."""
    return Settings()
