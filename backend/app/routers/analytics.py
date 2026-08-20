from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.agronomy import Crop
from app.models.farm import Farm
from app.models.prediction import YieldPrediction
from app.models.user import User
from app.schemas.prediction import AnalyticsSummary
from app.services.access import visible_farm_ids

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ids = visible_farm_ids(db, current_user)

    farm_query = db.query(Farm)
    crop_query = db.query(Crop)
    pred_query = db.query(YieldPrediction).join(Crop, YieldPrediction.crop_id == Crop.id)

    if ids is not None:
        if not ids:
            return AnalyticsSummary(
                total_farms=0, total_crops=0, total_area_hectares=0,
                average_predicted_yield_kg_per_ha=0, predictions_last_30_days=0,
                risk_distribution={}, yield_by_crop={}, yield_trend=[],
            )
        farm_query = farm_query.filter(Farm.id.in_(ids))
        crop_query = crop_query.filter(Crop.farm_id.in_(ids))
        pred_query = pred_query.filter(Crop.farm_id.in_(ids))

    farms = farm_query.all()
    crops = crop_query.all()
    predictions = pred_query.order_by(YieldPrediction.created_at.asc()).all()

    total_area = sum(f.total_area_hectares for f in farms)
    avg_yield = round(sum(p.predicted_yield_kg_per_ha for p in predictions) / len(predictions), 1) if predictions else 0.0

    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    recent_count = sum(1 for p in predictions if p.created_at.replace(tzinfo=timezone.utc) >= cutoff)

    risk_distribution: dict[str, int] = defaultdict(int)
    for p in predictions:
        risk_distribution[p.risk_level.value] += 1

    yield_by_crop: dict[str, list[float]] = defaultdict(list)
    crop_lookup = {c.id: c for c in crops}
    for p in predictions:
        crop = crop_lookup.get(p.crop_id)
        if crop:
            yield_by_crop[crop.crop_name].append(p.predicted_yield_kg_per_ha)
    yield_by_crop_avg = {name: round(sum(vals) / len(vals), 1) for name, vals in yield_by_crop.items()}

    trend = [
        {
            "date": p.created_at.date().isoformat(),
            "predicted_yield_kg_per_ha": p.predicted_yield_kg_per_ha,
            "crop": crop_lookup.get(p.crop_id).crop_name if crop_lookup.get(p.crop_id) else "Unknown",
        }
        for p in predictions[-30:]
    ]

    return AnalyticsSummary(
        total_farms=len(farms),
        total_crops=len(crops),
        total_area_hectares=round(total_area, 2),
        average_predicted_yield_kg_per_ha=avg_yield,
        predictions_last_30_days=recent_count,
        risk_distribution=dict(risk_distribution),
        yield_by_crop=yield_by_crop_avg,
        yield_trend=trend,
    )


@router.get("/farm-comparison")
def farm_comparison(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Per-farm rollup for the Farm Comparison Reports widget."""
    ids = visible_farm_ids(db, current_user)
    farm_query = db.query(Farm)
    if ids is not None:
        farm_query = farm_query.filter(Farm.id.in_(ids)) if ids else farm_query.filter(Farm.id == -1)
    farms = farm_query.all()

    results = []
    for farm in farms:
        crops = farm.crops
        crop_ids = [c.id for c in crops]
        preds = (
            db.query(YieldPrediction).filter(YieldPrediction.crop_id.in_(crop_ids)).all()
            if crop_ids else []
        )
        avg_yield = round(sum(p.predicted_yield_kg_per_ha for p in preds) / len(preds), 1) if preds else 0.0
        avg_productivity = round(sum(p.productivity_score for p in preds) / len(preds), 1) if preds else 0.0
        results.append({
            "farm_id": farm.id,
            "farm_name": farm.name,
            "total_area_hectares": farm.total_area_hectares,
            "crop_count": len(crops),
            "average_predicted_yield_kg_per_ha": avg_yield,
            "average_productivity_score": avg_productivity,
        })
    return results
