from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.agronomy import Crop, SoilRecord, WeatherRecord
from app.models.prediction import Recommendation, YieldPrediction
from app.models.user import User
from app.ml.predictor import PredictionInput, predict
from app.schemas.prediction import PredictionOut, PredictionRequest, RecommendationOut
from app.services.access import assert_can_access_farm, assert_can_modify_farm
from app.services.recommendation_engine import generate_recommendations

router = APIRouter(prefix="/api/predictions", tags=["Yield Prediction"])

# Reasonable regional defaults used only when a farm has no weather/soil
# records yet, so a first-time user can still get an illustrative result.
_DEFAULTS = {
    "temperature_c": 26.0,
    "rainfall_mm": 550.0,
    "humidity_pct": 60.0,
    "ph_level": 6.5,
    "nitrogen_ppm": 35.0,
    "phosphorus_ppm": 25.0,
    "potassium_ppm": 35.0,
    "organic_matter_pct": 2.0,
}


@router.post("", response_model=PredictionOut, status_code=status.HTTP_201_CREATED)
def run_prediction(payload: PredictionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.get(Crop, payload.crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    assert_can_modify_farm(current_user, crop.farm)

    latest_weather = (
        db.query(WeatherRecord)
        .filter(WeatherRecord.farm_id == crop.farm_id)
        .order_by(WeatherRecord.record_date.desc())
        .first()
    )
    latest_soil = (
        db.query(SoilRecord)
        .filter(SoilRecord.farm_id == crop.farm_id)
        .order_by(SoilRecord.record_date.desc())
        .first()
    )

    observed = sum([latest_weather is not None, latest_soil is not None])
    data_completeness = observed / 2

    inp = PredictionInput(
        crop_name=crop.crop_name,
        season=crop.season,
        area_hectares=crop.area_hectares,
        irrigation_type=crop.irrigation_type,
        soil_texture=latest_soil.soil_texture if latest_soil else "Loam",
        temperature_c=latest_weather.temperature_c if latest_weather else _DEFAULTS["temperature_c"],
        rainfall_mm=latest_weather.rainfall_mm if latest_weather else _DEFAULTS["rainfall_mm"],
        humidity_pct=latest_weather.humidity_pct if latest_weather else _DEFAULTS["humidity_pct"],
        ph_level=latest_soil.ph_level if latest_soil else _DEFAULTS["ph_level"],
        nitrogen_ppm=latest_soil.nitrogen_ppm if latest_soil else _DEFAULTS["nitrogen_ppm"],
        phosphorus_ppm=latest_soil.phosphorus_ppm if latest_soil else _DEFAULTS["phosphorus_ppm"],
        potassium_ppm=latest_soil.potassium_ppm if latest_soil else _DEFAULTS["potassium_ppm"],
        organic_matter_pct=latest_soil.organic_matter_pct if latest_soil else _DEFAULTS["organic_matter_pct"],
        data_completeness=data_completeness,
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
        input_snapshot={
            **{k: v for k, v in inp.__dict__.items()},
            "risk_factors": result.risk_factors,
        },
    )
    db.add(prediction)
    db.flush()  # get prediction.id without committing yet

    # Replace prior auto-generated recommendations for this crop with fresh ones
    db.query(Recommendation).filter(Recommendation.crop_id == crop.id).delete()
    for rec in generate_recommendations(inp, result):
        db.add(Recommendation(crop_id=crop.id, **rec))

    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/crop/{crop_id}", response_model=list[PredictionOut])
def get_predictions_for_crop(crop_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    assert_can_access_farm(db, current_user, crop.farm)
    return (
        db.query(YieldPrediction)
        .filter(YieldPrediction.crop_id == crop_id)
        .order_by(YieldPrediction.created_at.desc())
        .all()
    )


@router.get("/{prediction_id}", response_model=PredictionOut)
def get_prediction(prediction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prediction = db.get(YieldPrediction, prediction_id)
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    assert_can_access_farm(db, current_user, prediction.crop.farm)
    return prediction


@router.get("/{prediction_id}/recommendations", response_model=list[RecommendationOut])
def get_recommendations_for_prediction(prediction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prediction = db.get(YieldPrediction, prediction_id)
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    assert_can_access_farm(db, current_user, prediction.crop.farm)
    return (
        db.query(Recommendation)
        .filter(Recommendation.crop_id == prediction.crop_id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )
