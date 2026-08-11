from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "YieldSense AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # SQLite Configuration
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./yieldsense.db"
    
    # MongoDB Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "yieldsense_db"
    
    # Security
    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY_FOR_PRODUCTION" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    class Config:
        case_sensitive = True

settings = Settings()
