import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "YieldSense AI"
    SECRET_KEY: str = "YIELDSENSE_SUPER_SECURE_PHRASE_2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8
    OPENWEATHER_API_KEY: str = "0615d170e7e7c8a20444af2f8196f1ec"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./yieldsense.db")
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()