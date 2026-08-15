from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal

# Import Models
from models.user import User
from models.prediction import Prediction
from models.farm import Farm
from sqlalchemy import desc


# Import Routes
from routes import auth
from routes import prediction
from routes import weather
from routes import soil
from routes import history
from routes import farm
from routes import recommendations

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="YieldSense AI Backend",
    version="3.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home Route
@app.get("/")
def home():
    return {
        "message": "Welcome to YieldSense AI Backend!",
        "status": "Running",
        "version": "3.0.0"
    }

# Include Routers
app.include_router(auth.router)
app.include_router(prediction.router)
app.include_router(weather.router)
app.include_router(soil.router)
app.include_router(history.router)
app.include_router(farm.router)
app.include_router(recommendations.router)
@app.get("/dashboard/summary")
def dashboard_summary():
    db = SessionLocal()

    try:
        records = (
            db.query(Prediction)
            .order_by(Prediction.year.asc())
            .all()
        )

        if not records:
            return {
                "yield_trend": [],
                "productivity_score": 0,
                "message": "Not enough data yet"
            }

        yield_trend = [
            {
                "year": str(record.year),
                "yield": float(record.predicted_yield)
            }
            for record in records
        ]
                # Prepare crop comparison data
        crop_totals = {}

        for record in records:
            crop = record.item
            crop_totals[crop] = crop_totals.get(crop, 0) + float(record.predicted_yield)

        crop_comparison = [
            {
                "crop": crop,
                "yield": round(total, 2)
            }
            for crop, total in crop_totals.items()
        ]

        yields = [float(record.predicted_yield) for record in records]

        average_yield = sum(yields) / len(yields)
        latest_yield = yields[-1]

        productivity_score = round(
            (latest_yield / average_yield) * 100,
            1
        )

        return {
            "yield_trend": yield_trend,
            "crop_comparison": crop_comparison,
            "productivity_score": productivity_score,
            "message": "Dashboard data loaded successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()