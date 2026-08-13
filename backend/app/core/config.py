from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "YieldSense AI"
    SECRET_KEY: str = "YIELDSENSE_SUPER_SECURE_PHRASE_2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8

    # PostgreSQL Connection
    DATABASE_URL: str = "postgresql://postgres:123456@localhost:5432/yieldsense"

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()