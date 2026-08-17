import os
import sqlite3
from contextlib import contextmanager


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'yieldsense_dev.db')}")


def _sqlite_path() -> str:
    return DATABASE_URL.replace("sqlite:///", "", 1)


def using_sqlite() -> bool:
    return DATABASE_URL.startswith("sqlite:///")


@contextmanager
def get_connection():
    if using_sqlite():
        conn = sqlite3.connect(_sqlite_path())
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()
    else:
        import psycopg2
        import psycopg2.extras

        conn = psycopg2.connect(DATABASE_URL)
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()


def initialize_database():
    if using_sqlite():
        statements = [
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'Farmer',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS farmer_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                full_name TEXT,
                phone TEXT,
                address TEXT,
                experience_years INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS farms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                farm_name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                farm_size REAL NOT NULL,
                soil_type TEXT,
                irrigation_type TEXT,
                crops_grown TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS crop_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farm_id INTEGER NOT NULL,
                crop_name TEXT NOT NULL,
                season TEXT,
                area_cultivated REAL NOT NULL,
                production_amount REAL,
                rainfall REAL,
                temperature REAL,
                fertilizer_usage REAL,
                previous_yield REAL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(farm_id) REFERENCES farms(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS soil_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farm_id INTEGER NOT NULL,
                ph_value REAL NOT NULL,
                nitrogen REAL,
                phosphorus REAL,
                potassium REAL,
                organic_matter REAL,
                fertility_level TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(farm_id) REFERENCES farms(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS weather_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farm_id INTEGER NOT NULL,
                rainfall REAL,
                average_temperature REAL,
                humidity REAL,
                climate_condition TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(farm_id) REFERENCES farms(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS historical_farming_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farm_id INTEGER NOT NULL,
                year INTEGER NOT NULL,
                crop_name TEXT NOT NULL,
                yield_amount REAL NOT NULL,
                rainfall REAL,
                temperature REAL,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(farm_id) REFERENCES farms(id) ON DELETE CASCADE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS dataset_uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                status TEXT DEFAULT 'Uploaded',
                row_count INTEGER DEFAULT 0,
                missing_values INTEGER DEFAULT 0,
                columns_found TEXT,
                uploaded_by INTEGER,
                uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE SET NULL
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS prediction_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                crop_name TEXT,
                avg_temp REAL,
                rainfall REAL,
                soil_ph REAL,
                nitrogen REAL,
                phosphorus REAL,
                potassium REAL,
                predicted_yield REAL,
                confidence_score REAL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
            )
            """,
            "CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crop_records(farm_id)",
            "CREATE INDEX IF NOT EXISTS idx_soils_farm_id ON soil_records(farm_id)",
            "CREATE INDEX IF NOT EXISTS idx_weather_farm_id ON weather_records(farm_id)",
            "CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON prediction_logs(user_id)",
        ]
        with get_connection() as conn:
            for statement in statements:
                conn.execute(statement)
        return

    schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as schema_file:
        schema_sql = schema_file.read()
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(schema_sql)


def fetch_one(query: str, params: tuple = ()):
    with get_connection() as conn:
        if using_sqlite():
            row = conn.execute(query, params).fetchone()
            return dict(row) if row else None
        with conn.cursor() as cursor:
            cursor.execute(query.replace("?", "%s"), params)
            if cursor.description is None:
                return None
            columns = [desc[0] for desc in cursor.description]
            row = cursor.fetchone()
            return dict(zip(columns, row)) if row else None


def fetch_all(query: str, params: tuple = ()):
    with get_connection() as conn:
        if using_sqlite():
            rows = conn.execute(query, params).fetchall()
            return [dict(row) for row in rows]
        with conn.cursor() as cursor:
            cursor.execute(query.replace("?", "%s"), params)
            if cursor.description is None:
                return []
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]


def execute(query: str, params: tuple = ()):
    with get_connection() as conn:
        if using_sqlite():
            cursor = conn.execute(query, params)
            return cursor.lastrowid
        with conn.cursor() as cursor:
            postgres_query = query.replace("?", "%s")
            if postgres_query.lstrip().upper().startswith("INSERT") and "RETURNING" not in postgres_query.upper():
                postgres_query = f"{postgres_query} RETURNING id"
            cursor.execute(postgres_query, params)
            if cursor.description:
                return cursor.fetchone()[0]
            return None
