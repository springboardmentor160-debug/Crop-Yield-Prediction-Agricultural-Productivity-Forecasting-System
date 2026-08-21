"""
Central application configuration.

All environment-driven settings live here so the rest of the codebase
never reads os.environ directly. Values fall back to sane development
defaults so the app runs out-of-the-box on a fresh clone.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "YieldSense AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./yieldsense.db"

    # Security / JWT
    SECRET_KEY: str = "change-this-secret-key-in-production-yieldsense-ai-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8   # 8 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # ML
    MODEL_ARTIFACT_DIR: str = "app/ml/artifacts"
    YIELD_MODEL_FILENAME: str = "yield_model.joblib"
    RISK_MODEL_FILENAME: str = "risk_model.joblib"


settings = Settings()
