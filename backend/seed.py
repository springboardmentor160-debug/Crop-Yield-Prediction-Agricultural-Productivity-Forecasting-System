"""
Seed the database with a realistic demo dataset.

Run with:  python seed.py   (from the backend/ directory, venv active)

Creates one user per role, a handful of farms, crops, weather and soil
history, then runs the real ML pipeline to generate sample predictions
and recommendations so the dashboard is populated on first login.
"""
from datetime import date, timedelta

from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.ml.predictor import PredictionInput, predict
from app.models.agronomy import Crop, SoilRecord, WeatherRecord
from app.models.farm import Farm
from app.models.prediction import Recommendation, YieldPrediction
from app.models.user import User, UserRole
from app.services.recommendation_engine import generate_recommendations

DEMO_PASSWORD = "YieldSense@123"


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).count() > 0:
            print("Database already contains data - skipping seed. Delete yieldsense.db to reseed.")
            return

        print("Creating demo users (all use password: %s) ..." % DEMO_PASSWORD)
        users = {
            "admin": User(full_name="Asha Verma", email="admin@yieldsense.ai", hashed_password=hash_password(DEMO_PASSWORD), role=UserRole.ADMIN, organization="YieldSense AI Platform"),
            "gov": User(full_name="Dr. Ramesh Iyer", email="gov@yieldsense.ai", hashed_password=hash_password(DEMO_PASSWORD), role=UserRole.GOV_OFFICIAL, organization="Dept. of Agriculture"),
            "consultant": User(full_name="Priya Nair", email="consultant@yieldsense.ai", hashed_password=hash_password(DEMO_PASSWORD), role=UserRole.AGRI_CONSULTANT, organization="AgriAdvisors Pvt Ltd"),
            "coop": User(full_name="Manjeet Singh", email="coop@yieldsense.ai", hashed_password=hash_password(DEMO_PASSWORD), role=UserRole.COOPERATIVE_MANAGER, organization="Green Valley Cooperative"),
            "farmer1": User(full_name="Sukhdev Singh", email="farmer1@yieldsense.ai", hashed_password=hash_password(DEMO_PASSWORD), role=UserRole.FARMER, organization=None),
            "farmer2": User(full_name="Kavita Sharma", email="farmer2@yieldsense.ai", hashed_password=hash_password(DEMO_PASSWORD), role=UserRole.FARMER, organization=None),
        }
        db.add_all(users.values())
        db.commit()
        for u in users.values():
            db.refresh(u)

        print("Creating farms ...")
        farms = [
            Farm(owner_id=users["farmer1"].id, name="Sukhdev's Wheat Farm", location="Ludhiana, Punjab", region="Punjab", latitude=30.9010, longitude=75.8573, total_area_hectares=12.5, soil_type="Loam", irrigation_available=True),
            Farm(owner_id=users["farmer1"].id, name="Riverside Rice Field", location="Ludhiana, Punjab", region="Punjab", latitude=30.9210, longitude=75.8020, total_area_hectares=8.0, soil_type="Clay", irrigation_available=True),
            Farm(owner_id=users["farmer2"].id, name="Kavita's Maize Farm", location="Nagpur, Maharashtra", region="Maharashtra", latitude=21.1458, longitude=79.0882, total_area_hectares=15.0, soil_type="Sandy", irrigation_available=False),
        ]
        db.add_all(farms)
        db.commit()
        for f in farms:
            db.refresh(f)

        print("Creating crops ...")
        crops = [
            Crop(farm_id=farms[0].id, crop_name="Wheat", variety="HD-2967", season="Rabi", area_hectares=12.5, planting_date=date.today() - timedelta(days=60), expected_harvest_date=date.today() + timedelta(days=60), irrigation_type="Sprinkler", growth_stage="Vegetative"),
            Crop(farm_id=farms[1].id, crop_name="Rice", variety="Basmati-1121", season="Kharif", area_hectares=8.0, planting_date=date.today() - timedelta(days=45), expected_harvest_date=date.today() + timedelta(days=75), irrigation_type="Flood", growth_stage="Tillering"),
            Crop(farm_id=farms[2].id, crop_name="Maize", variety="DHM-117", season="Kharif", area_hectares=15.0, planting_date=date.today() - timedelta(days=30), expected_harvest_date=date.today() + timedelta(days=90), irrigation_type="Rainfed", growth_stage="Sown"),
        ]
        db.add_all(crops)
        db.commit()
        for c in crops:
            db.refresh(c)

        print("Creating weather & soil history ...")
        weather_profiles = [
            (farms[0], 21.0, 60.0, 55.0, 8.0),
            (farms[1], 28.0, 180.0, 78.0, 5.0),
            (farms[2], 26.5, 40.0, 50.0, 12.0),
        ]
        for farm, temp, rain, hum, wind in weather_profiles:
            for i in range(6):
                db.add(WeatherRecord(
                    farm_id=farm.id,
                    record_date=date.today() - timedelta(days=i * 5),
                    temperature_c=temp + (i - 3) * 0.6,
                    rainfall_mm=max(0, rain + (i - 3) * 8),
                    humidity_pct=hum + (i - 3) * 1.5,
                    wind_speed_kmh=wind,
                    source="Weather API (simulated)",
                ))

        soil_profiles = [
            (farms[0], 6.8, 42, 28, 38, 2.4, 22, "Loam"),
            (farms[1], 6.2, 55, 35, 45, 3.1, 45, "Clay"),
            (farms[2], 6.9, 18, 12, 22, 0.9, 15, "Sandy"),
        ]
        for farm, ph, n, p, k, om, moist, texture in soil_profiles:
            db.add(SoilRecord(
                farm_id=farm.id,
                record_date=date.today() - timedelta(days=3),
                ph_level=ph, nitrogen_ppm=n, phosphorus_ppm=p, potassium_ppm=k,
                organic_matter_pct=om, moisture_pct=moist, soil_texture=texture,
            ))
        db.commit()

        print("Running ML predictions to seed analytics ...")
        for crop in crops:
            latest_weather = db.query(WeatherRecord).filter(WeatherRecord.farm_id == crop.farm_id).order_by(WeatherRecord.record_date.desc()).first()
            latest_soil = db.query(SoilRecord).filter(SoilRecord.farm_id == crop.farm_id).order_by(SoilRecord.record_date.desc()).first()

            inp = PredictionInput(
                crop_name=crop.crop_name, season=crop.season, area_hectares=crop.area_hectares,
                irrigation_type=crop.irrigation_type, soil_texture=latest_soil.soil_texture,
                temperature_c=latest_weather.temperature_c, rainfall_mm=latest_weather.rainfall_mm,
                humidity_pct=latest_weather.humidity_pct, ph_level=latest_soil.ph_level,
                nitrogen_ppm=latest_soil.nitrogen_ppm, phosphorus_ppm=latest_soil.phosphorus_ppm,
                potassium_ppm=latest_soil.potassium_ppm, organic_matter_pct=latest_soil.organic_matter_pct,
                data_completeness=1.0,
            )
            result = predict(inp)
            prediction = YieldPrediction(
                crop_id=crop.id,
                predicted_yield_kg_per_ha=result.predicted_yield_kg_per_ha,
                predicted_total_production_kg=result.predicted_total_production_kg,
                productivity_score=result.productivity_score,
                confidence_score=result.confidence_score,
                risk_level=result.risk_level,
                model_version=result.model_version,
                input_snapshot={**inp.__dict__, "risk_factors": result.risk_factors},
            )
            db.add(prediction)
            for rec in generate_recommendations(inp, result):
                db.add(Recommendation(crop_id=crop.id, **rec))
        db.commit()

        print("\nSeed complete. Demo accounts (password: %s):" % DEMO_PASSWORD)
        for role, u in users.items():
            print(f"  {u.role.value:>20} | {u.email}")

    finally:
        db.close()


if __name__ == "__main__":
    run()
