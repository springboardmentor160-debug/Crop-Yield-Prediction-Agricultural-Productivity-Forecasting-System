
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import auth, farms, analysis, crops

app = FastAPI(
    title="YieldSense AI Core",
    description="Predictive analytics API for agricultural yield forecasting.",
    version="0.1.0",
)

# Tighten this list before deploying anywhere beyond localhost.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(analysis.router)
app.include_router(crops.router)


@app.on_event("startup")
def on_startup():
    # Applies schema.sql if tables don't exist yet, so a fresh Postgres
    # instance is usable without a manual psql step.
    init_db()



