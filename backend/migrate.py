import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234567890@localhost:5432/postgres")

sql = """
CREATE TABLE IF NOT EXISTS weather_observations (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    temperature NUMERIC(5,2),
    humidity NUMERIC(5,2),
    rainfall NUMERIC(6,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS yield_predictions (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    predicted_yield NUMERIC(10,2),
    yield_unit VARCHAR(20),
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    recommended_crop VARCHAR(100),
    confidence NUMERIC(5,2),
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_assessments (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    risk_level VARCHAR(50),
    risk_factors TEXT,
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute(sql)
conn.commit()
cur.close()
conn.close()
print("Migration applied")
