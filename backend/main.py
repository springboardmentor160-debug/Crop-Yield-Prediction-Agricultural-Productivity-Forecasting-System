import os
import shutil
import uuid
from pathlib import Path
from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth_handler import create_access_token, get_current_user, hash_password, verify_password, require_admin
from app.db import execute, fetch_one, fetch_all, initialize_database
from app.analytics import analyze_soil, analyze_weather
from app.ml_service import ModelUnavailableError, load_model_artifact, predict_yield
from app.models import (
    CropRecordCreateRequest,
    FarmCreateRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    FarmerProfileRequest,
    SoilRecordCreateRequest,
    WeatherRecordCreateRequest,
    HistoricalRecordCreateRequest,
    YieldPredictionRequest,
    WeatherAnalysisRequest,
    SoilAnalysisRequest,
    UserRoleUpdateRequest,
)
from preprocess import run_agri_preprocessing_pipeline

app = FastAPI(
    title="YieldSense AI Core Services",
    description="Core backend services for crop yield forecasting workflows, data collection, and dataset preprocessing.",
    version="1.0.0",
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import analytics_summary, predict, weather, soil, recommendations, reports
app.include_router(predict.router)
app.include_router(weather.router)
app.include_router(soil.router)
app.include_router(recommendations.router)
app.include_router(reports.router)
app.include_router(analytics_summary.router)




@app.on_event("startup")
def startup_event():
    initialize_database()
    (DATA_DIR / "raw").mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "processed").mkdir(parents=True, exist_ok=True)


@app.get("/api/v1/health")
def health_check():
    try:
        # Verify the configured database is reachable rather than reporting a
        # successful connection solely because the web process is running.
        fetch_one("SELECT 1 AS database_ready")
        database_status = "ready"
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}") from exc

    model_status = "ready"
    try:
        artifact = load_model_artifact()
        model_type = artifact.get("model_type", artifact["model"].__class__.__name__)
    except ModelUnavailableError:
        model_status = "missing"
        model_type = None

    return {
        "status": "healthy",
        "service": "YieldSense AI Core Platform",
        "database_status": database_status,
        "model_status": model_status,
        "model_type": model_type,
    }


def require_farm_access(farm_id: int, current_user: dict, *, allow_expert: bool = True) -> dict:
    """Return a farm only when the caller is its owner or has a privileged role."""
    farm = fetch_one("SELECT * FROM farms WHERE id = ?", (farm_id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    privileged = {"Admin"}
    if allow_expert:
        privileged.add("Agriculture Expert")
    if farm["user_id"] != int(current_user["sub"]) and current_user.get("role") not in privileged:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
    return farm


# --- Authentication and Profiles ---

@app.post("/api/v1/register", response_model=TokenResponse)
def register_user(payload: RegisterRequest):
    existing = fetch_one("SELECT id FROM users WHERE email = ?", (payload.email,))
    if existing:
        raise HTTPException(status_code=409, detail="Email is already registered")

    password_hash = hash_password(payload.password)
    role = "Farmer"
    user_id = execute(
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
        (payload.email, password_hash, role),
    )
    token = create_access_token({"sub": str(user_id), "email": payload.email, "role": role})
    return TokenResponse(access_token=token, role=role)


@app.post("/api/v1/login", response_model=TokenResponse)
def login_user(payload: LoginRequest):
    user = fetch_one("SELECT id, email, password_hash, role FROM users WHERE email = ?", (payload.email,))
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["id"]), "email": user["email"], "role": user["role"]})
    return TokenResponse(access_token=token, role=user["role"])


@app.get("/api/v1/me")
def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user


@app.get("/api/v1/profile")
def get_farmer_profile(current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    profile = fetch_one("SELECT * FROM farmer_profiles WHERE user_id = ?", (user_id,))
    if not profile:
        return {"user_id": user_id, "full_name": "", "phone": "", "address": "", "experience_years": 0}
    return profile


@app.post("/api/v1/profile")
def create_or_update_profile(payload: FarmerProfileRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    existing = fetch_one("SELECT id FROM farmer_profiles WHERE user_id = ?", (user_id,))
    if existing:
        execute(
            """
            UPDATE farmer_profiles
            SET full_name = ?, phone = ?, address = ?, experience_years = ?
            WHERE user_id = ?
            """,
            (payload.full_name, payload.phone, payload.address, payload.experience_years, user_id),
        )
        message = "Profile updated successfully"
    else:
        execute(
            """
            INSERT INTO farmer_profiles (user_id, full_name, phone, address, experience_years)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, payload.full_name, payload.phone, payload.address, payload.experience_years),
        )
        message = "Profile created successfully"
    return {"message": message}


# --- Farms Management ---

@app.get("/api/v1/farms")
def list_farms(current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    # Admins and Experts can see all farms
    if current_user.get("role") in ["Admin", "Agriculture Expert"]:
        return fetch_all("SELECT * FROM farms ORDER BY created_at DESC")
    return fetch_all("SELECT * FROM farms WHERE user_id = ? ORDER BY created_at DESC", (user_id,))


@app.post("/api/v1/farms")
def create_farm(payload: FarmCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    farm_id = execute(
        """
        INSERT INTO farms (user_id, farm_name, latitude, longitude, farm_size, soil_type, irrigation_type, crops_grown)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            payload.farm_name,
            payload.latitude,
            payload.longitude,
            payload.farm_size,
            payload.soil_type,
            payload.irrigation_type,
            payload.crops_grown,
        ),
    )
    return {"id": farm_id, "message": "Farm profile created successfully"}


@app.put("/api/v1/farms/{id}")
def update_farm(id: int, payload: FarmCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    farm = fetch_one("SELECT * FROM farms WHERE id = ?", (id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this farm")

    execute(
        """
        UPDATE farms
        SET farm_name = ?, latitude = ?, longitude = ?, farm_size = ?, soil_type = ?, irrigation_type = ?, crops_grown = ?
        WHERE id = ?
        """,
        (
            payload.farm_name,
            payload.latitude,
            payload.longitude,
            payload.farm_size,
            payload.soil_type,
            payload.irrigation_type,
            payload.crops_grown,
            id,
        ),
    )
    return {"message": "Farm updated successfully"}


@app.delete("/api/v1/farms/{id}")
def delete_farm(id: int, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    farm = fetch_one("SELECT * FROM farms WHERE id = ?", (id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this farm")

    execute("DELETE FROM farms WHERE id = ?", (id,))
    return {"message": "Farm deleted successfully"}


# --- Crop Records Management ---

@app.get("/api/v1/crops")
def list_crops(farm_id: int | None = None, current_user: dict = Depends(get_current_user)):
    if farm_id:
        require_farm_access(farm_id, current_user)
        return fetch_all("SELECT * FROM crop_records WHERE farm_id = ? ORDER BY created_at DESC", (farm_id,))
    
    user_id = int(current_user["sub"])
    if current_user.get("role") in ["Admin", "Agriculture Expert"]:
        return fetch_all("SELECT * FROM crop_records ORDER BY created_at DESC")
    return fetch_all(
        """
        SELECT cr.* FROM crop_records cr 
        JOIN farms f ON cr.farm_id = f.id 
        WHERE f.user_id = ? 
        ORDER BY cr.created_at DESC
        """,
        (user_id,),
    )


@app.post("/api/v1/crops")
def create_crop_record(payload: CropRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    farm = fetch_one("SELECT user_id FROM farms WHERE id = ?", (payload.farm_id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != user_id and current_user.get("role") not in ["Admin", "Agriculture Expert"]:
        raise HTTPException(status_code=403, detail="Not authorized to add crops to this farm")

    crop_id = execute(
        """
        INSERT INTO crop_records (farm_id, crop_name, season, area_cultivated, production_amount, rainfall, temperature, fertilizer_usage, previous_yield)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.farm_id,
            payload.crop_name,
            payload.season,
            payload.area_cultivated,
            payload.production_amount,
            payload.rainfall,
            payload.temperature,
            payload.fertilizer_usage,
            payload.previous_yield,
        ),
    )
    return {"id": crop_id, "message": "Crop record added successfully"}


@app.put("/api/v1/crops/{id}")
def update_crop_record(id: int, payload: CropRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    crop = fetch_one("SELECT f.user_id FROM crop_records cr JOIN farms f ON cr.farm_id = f.id WHERE cr.id = ?", (id,))
    if not crop:
        raise HTTPException(status_code=404, detail="Crop record not found")
    if crop["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this record")
    require_farm_access(payload.farm_id, current_user)

    execute(
        """
        UPDATE crop_records
        SET farm_id = ?, crop_name = ?, season = ?, area_cultivated = ?, production_amount = ?, rainfall = ?, temperature = ?, fertilizer_usage = ?, previous_yield = ?
        WHERE id = ?
        """,
        (
            payload.farm_id,
            payload.crop_name,
            payload.season,
            payload.area_cultivated,
            payload.production_amount,
            payload.rainfall,
            payload.temperature,
            payload.fertilizer_usage,
            payload.previous_yield,
            id,
        ),
    )
    return {"message": "Crop record updated successfully"}


@app.delete("/api/v1/crops/{id}")
def delete_crop_record(id: int, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    crop = fetch_one("SELECT f.user_id FROM crop_records cr JOIN farms f ON cr.farm_id = f.id WHERE cr.id = ?", (id,))
    if not crop:
        raise HTTPException(status_code=404, detail="Crop record not found")
    if crop["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this record")

    execute("DELETE FROM crop_records WHERE id = ?", (id,))
    return {"message": "Crop record deleted successfully"}


# --- Soil Records Management ---

@app.get("/api/v1/soils")
def list_soil_records(farm_id: int | None = None, current_user: dict = Depends(get_current_user)):
    if farm_id:
        require_farm_access(farm_id, current_user)
        return fetch_all("SELECT * FROM soil_records WHERE farm_id = ? ORDER BY created_at DESC", (farm_id,))
    
    user_id = int(current_user["sub"])
    if current_user.get("role") in ["Admin", "Agriculture Expert"]:
        return fetch_all("SELECT * FROM soil_records ORDER BY created_at DESC")
    return fetch_all(
        """
        SELECT sr.* FROM soil_records sr
        JOIN farms f ON sr.farm_id = f.id
        WHERE f.user_id = ?
        ORDER BY sr.created_at DESC
        """,
        (user_id,),
    )


@app.post("/api/v1/soils")
def create_soil_record(payload: SoilRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    farm = fetch_one("SELECT user_id FROM farms WHERE id = ?", (payload.farm_id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != user_id and current_user.get("role") not in ["Admin", "Agriculture Expert"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    soil_id = execute(
        """
        INSERT INTO soil_records (farm_id, ph_value, nitrogen, phosphorus, potassium, organic_matter, fertility_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.farm_id,
            payload.ph_value,
            payload.nitrogen,
            payload.phosphorus,
            payload.potassium,
            payload.organic_matter,
            payload.fertility_level,
        ),
    )
    return {"id": soil_id, "message": "Soil record created successfully"}


@app.put("/api/v1/soils/{id}")
def update_soil_record(id: int, payload: SoilRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    soil = fetch_one("SELECT f.user_id FROM soil_records sr JOIN farms f ON sr.farm_id = f.id WHERE sr.id = ?", (id,))
    if not soil:
        raise HTTPException(status_code=404, detail="Soil record not found")
    if soil["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    require_farm_access(payload.farm_id, current_user)

    execute(
        """
        UPDATE soil_records
        SET farm_id = ?, ph_value = ?, nitrogen = ?, phosphorus = ?, potassium = ?, organic_matter = ?, fertility_level = ?
        WHERE id = ?
        """,
        (
            payload.farm_id,
            payload.ph_value,
            payload.nitrogen,
            payload.phosphorus,
            payload.potassium,
            payload.organic_matter,
            payload.fertility_level,
            id,
        ),
    )
    return {"message": "Soil record updated successfully"}


@app.delete("/api/v1/soils/{id}")
def delete_soil_record(id: int, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    soil = fetch_one("SELECT f.user_id FROM soil_records sr JOIN farms f ON sr.farm_id = f.id WHERE sr.id = ?", (id,))
    if not soil:
        raise HTTPException(status_code=404, detail="Soil record not found")
    if soil["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    execute("DELETE FROM soil_records WHERE id = ?", (id,))
    return {"message": "Soil record deleted successfully"}


# --- Weather Records Management ---

@app.get("/api/v1/weather")
def list_weather_records(farm_id: int | None = None, current_user: dict = Depends(get_current_user)):
    if farm_id:
        require_farm_access(farm_id, current_user)
        return fetch_all("SELECT * FROM weather_records WHERE farm_id = ? ORDER BY created_at DESC", (farm_id,))

    user_id = int(current_user["sub"])
    if current_user.get("role") in ["Admin", "Agriculture Expert"]:
        return fetch_all("SELECT * FROM weather_records ORDER BY created_at DESC")
    return fetch_all(
        """
        SELECT wr.* FROM weather_records wr
        JOIN farms f ON wr.farm_id = f.id
        WHERE f.user_id = ?
        ORDER BY wr.created_at DESC
        """,
        (user_id,),
    )


@app.post("/api/v1/weather")
def create_weather_record(payload: WeatherRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    farm = fetch_one("SELECT user_id FROM farms WHERE id = ?", (payload.farm_id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != user_id and current_user.get("role") not in ["Admin", "Agriculture Expert"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    weather_id = execute(
        """
        INSERT INTO weather_records (farm_id, rainfall, average_temperature, humidity, climate_condition)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            payload.farm_id,
            payload.rainfall,
            payload.average_temperature,
            payload.humidity,
            payload.climate_condition,
        ),
    )
    return {"id": weather_id, "message": "Weather record created successfully"}


@app.put("/api/v1/weather/{id}")
def update_weather_record(id: int, payload: WeatherRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    weather = fetch_one("SELECT f.user_id FROM weather_records wr JOIN farms f ON wr.farm_id = f.id WHERE wr.id = ?", (id,))
    if not weather:
        raise HTTPException(status_code=404, detail="Weather record not found")
    if weather["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    require_farm_access(payload.farm_id, current_user)

    execute(
        """
        UPDATE weather_records
        SET farm_id = ?, rainfall = ?, average_temperature = ?, humidity = ?, climate_condition = ?
        WHERE id = ?
        """,
        (
            payload.farm_id,
            payload.rainfall,
            payload.average_temperature,
            payload.humidity,
            payload.climate_condition,
            id,
        ),
    )
    return {"message": "Weather record updated successfully"}


@app.delete("/api/v1/weather/{id}")
def delete_weather_record(id: int, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    weather = fetch_one("SELECT f.user_id FROM weather_records wr JOIN farms f ON wr.farm_id = f.id WHERE wr.id = ?", (id,))
    if not weather:
        raise HTTPException(status_code=404, detail="Weather record not found")
    if weather["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    execute("DELETE FROM weather_records WHERE id = ?", (id,))
    return {"message": "Weather record deleted successfully"}


# --- Historical Farming Records ---

@app.get("/api/v1/historical")
def list_historical_records(farm_id: int | None = None, current_user: dict = Depends(get_current_user)):
    if farm_id:
        require_farm_access(farm_id, current_user)
        return fetch_all("SELECT * FROM historical_farming_records WHERE farm_id = ? ORDER BY year DESC", (farm_id,))

    user_id = int(current_user["sub"])
    if current_user.get("role") in ["Admin", "Agriculture Expert"]:
        return fetch_all("SELECT * FROM historical_farming_records ORDER BY year DESC")
    return fetch_all(
        """
        SELECT hr.* FROM historical_farming_records hr
        JOIN farms f ON hr.farm_id = f.id
        WHERE f.user_id = ?
        ORDER BY hr.year DESC
        """,
        (user_id,),
    )


@app.post("/api/v1/historical")
def create_historical_record(payload: HistoricalRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    farm = fetch_one("SELECT user_id FROM farms WHERE id = ?", (payload.farm_id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != user_id and current_user.get("role") not in ["Admin", "Agriculture Expert"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    record_id = execute(
        """
        INSERT INTO historical_farming_records (farm_id, year, crop_name, yield_amount, rainfall, temperature, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.farm_id,
            payload.year,
            payload.crop_name,
            payload.yield_amount,
            payload.rainfall,
            payload.temperature,
            payload.notes,
        ),
    )
    return {"id": record_id, "message": "Historical record created successfully"}


@app.put("/api/v1/historical/{id}")
def update_historical_record(id: int, payload: HistoricalRecordCreateRequest, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    record = fetch_one("SELECT f.user_id FROM historical_farming_records hr JOIN farms f ON hr.farm_id = f.id WHERE hr.id = ?", (id,))
    if not record:
        raise HTTPException(status_code=404, detail="Historical record not found")
    if record["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    require_farm_access(payload.farm_id, current_user)

    execute(
        """
        UPDATE historical_farming_records
        SET farm_id = ?, year = ?, crop_name = ?, yield_amount = ?, rainfall = ?, temperature = ?, notes = ?
        WHERE id = ?
        """,
        (
            payload.farm_id,
            payload.year,
            payload.crop_name,
            payload.yield_amount,
            payload.rainfall,
            payload.temperature,
            payload.notes,
            id,
        ),
    )
    return {"message": "Historical record updated successfully"}


@app.delete("/api/v1/historical/{id}")
def delete_historical_record(id: int, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    record = fetch_one("SELECT f.user_id FROM historical_farming_records hr JOIN farms f ON hr.farm_id = f.id WHERE hr.id = ?", (id,))
    if not record:
        raise HTTPException(status_code=404, detail="Historical record not found")
    if record["user_id"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    execute("DELETE FROM historical_farming_records WHERE id = ?", (id,))
    return {"message": "Historical record deleted successfully"}


@app.post("/api/v1/analyze-weather")
def create_weather_analysis(payload: WeatherAnalysisRequest, current_user: dict = Depends(get_current_user)):
    return analyze_weather(payload.avg_temp, payload.rainfall)


@app.post("/api/v1/analyze-soil")
def create_soil_analysis(payload: SoilAnalysisRequest, current_user: dict = Depends(get_current_user)):
    return analyze_soil(payload.soil_ph, payload.nitrogen, payload.phosphorus, payload.potassium, payload.organic_matter)


# --- Dataset Management & Preprocessing ---

@app.post("/api/v1/datasets/upload")
async def upload_dataset_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    filename = Path(file.filename or "").name
    if not filename or Path(filename).suffix.lower() != ".csv":
        raise HTTPException(status_code=400, detail="Only CSV datasets are accepted")

    user_id = int(current_user["sub"])
    raw_dir = DATA_DIR / "raw"
    processed_dir = DATA_DIR / "processed"
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    # Save uploaded raw file
    # Keep a user-friendly filename in the database, but use a unique on-disk
    # name so repeated uploads never overwrite another dataset's raw/cleaned
    # files.  This also makes deletion safe for every uploaded record.
    storage_name = f"{user_id}_{uuid.uuid4().hex}_{filename}"
    raw_path = raw_dir / storage_name
    with open(raw_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer, length=1024 * 1024)

    file_size = os.path.getsize(raw_path)
    if file_size == 0 or file_size > 20 * 1024 * 1024:
        os.remove(raw_path)
        raise HTTPException(status_code=413, detail="CSV files must be between 1 byte and 20 MB")
    processed_path = processed_dir / f"clean_{storage_name}"

    # Run preprocessing script
    preprocess_result = run_agri_preprocessing_pipeline(raw_path, processed_path)
    if preprocess_result["status"] != "Completed":
        if os.path.exists(raw_path):
            os.remove(raw_path)
        raise HTTPException(status_code=422, detail=preprocess_result.get("error", "Dataset could not be processed"))

    # Store upload metadata in DB
    dataset_id = execute(
        """
        INSERT INTO dataset_uploads (filename, filepath, file_size, status, row_count, missing_values, columns_found, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            filename,
            str(processed_path),
            file_size,
            preprocess_result["status"],
            preprocess_result.get("row_count", 0),
            preprocess_result.get("missing_values", 0),
            preprocess_result.get("columns_found", ""),
            user_id,
        ),
    )

    return {
        "id": dataset_id,
        "filename": file.filename,
        "size": file_size,
        "status": preprocess_result["status"],
        "metrics": preprocess_result,
    }


@app.get("/api/v1/datasets")
def list_datasets(current_user: dict = Depends(get_current_user)):
    # Admins see all, Farmers see their own
    user_id = int(current_user["sub"])
    if current_user.get("role") == "Admin":
        return fetch_all("SELECT * FROM dataset_uploads ORDER BY uploaded_at DESC")
    return fetch_all("SELECT * FROM dataset_uploads WHERE uploaded_by = ? ORDER BY uploaded_at DESC", (user_id,))


@app.delete("/api/v1/datasets/{id}")
def delete_dataset(id: int, current_user: dict = Depends(get_current_user)):
    dataset = fetch_one("SELECT * FROM dataset_uploads WHERE id = ?", (id,))
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset upload metadata not found")

    user_id = int(current_user["sub"])
    if dataset["uploaded_by"] != user_id and current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this dataset")

    # Clean up physical files if they exist
    if os.path.exists(dataset["filepath"]):
        try:
            os.remove(dataset["filepath"])
        except Exception:
            pass

    # The processed file is named clean_<raw filename>, so derive the raw
    # path from the actual stored filepath instead of the display filename.
    processed_filename = os.path.basename(dataset["filepath"])
    raw_filename = processed_filename.removeprefix("clean_")
    raw_file = DATA_DIR / "raw" / raw_filename
    if os.path.exists(raw_file):
        try:
            os.remove(raw_file)
        except Exception:
            pass

    execute("DELETE FROM dataset_uploads WHERE id = ?", (id,))
    return {"message": "Dataset deleted successfully"}


# --- Admin User Management ---

@app.get("/api/v1/admin/users")
def admin_list_users(current_user: dict = Depends(require_admin)):
    return fetch_all("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC")


@app.patch("/api/v1/admin/users/{user_id}/role")
def admin_update_user_role(user_id: int, payload: UserRoleUpdateRequest, current_user: dict = Depends(require_admin)):
    if user_id == int(current_user["sub"]) and payload.role != "Admin":
        raise HTTPException(status_code=400, detail="You cannot remove your own administrator access")
    user = fetch_one("SELECT id FROM users WHERE id = ?", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    execute("UPDATE users SET role = ? WHERE id = ?", (payload.role, user_id))
    return {"message": "User role updated", "user_id": user_id, "role": payload.role}


@app.get("/api/v1/admin/statistics")
def admin_statistics(current_user: dict = Depends(require_admin)):
    tables = ("users", "farms", "crop_records", "soil_records", "weather_records", "dataset_uploads", "prediction_logs")
    return {table: fetch_one(f"SELECT COUNT(*) AS count FROM {table}")["count"] for table in tables}
