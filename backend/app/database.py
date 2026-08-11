from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
from .core.config import settings

# PostgreSQL
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# MongoDB
mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongodb = mongodb_client[settings.MONGODB_DB_NAME]
