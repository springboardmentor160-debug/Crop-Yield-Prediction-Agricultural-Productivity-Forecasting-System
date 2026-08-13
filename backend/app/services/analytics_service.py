"""
YieldSense AI - Analytics Service
Business logic for analytics, used by both analytics.py and analyst.py routers
"""
from sqlalchemy.orm import Session
from app import models
from app.ml.predictor import get_model_metrics
from datetime import datetime, timedelta
from typing import Optional


class AnalyticsService:

    @staticmethod
    def dashboard(db: Session, user_id: int) -> dict:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).all() if farm_ids else []

        avg_yield = round(
            sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2
        ) if predictions else 0

        metrics = get_model_metrics()

        return {
            "total_farms": len(farms),
            "active_farms": len(farms),
            "total_predictions": len(predictions),
            "average_yield_tons_per_ha": avg_yield,
            "model_accuracy_percent": metrics.get("accuracy_percent", 0),
            "high_risk_predictions": len([p for p in predictions if p.risk_level == "High"]),
            "medium_risk_predictions": len([p for p in predictions if p.risk_level == "Medium"]),
            "low_risk_predictions": len([p for p in predictions if p.risk_level == "Low"]),
            "crops_analyzed": list(set(p.crop_type for p in predictions)),
            "total_area_hectares": sum(f.area_hectares or 0 for f in farms),
        }

    @staticmethod
    def yield_trends(db: Session, user_id: int) -> dict:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).order_by(models.Prediction.created_at).all() if farm_ids else []

        monthly = {}
        for p in predictions:
            key = p.created_at.strftime("%b %Y")
            if key not in monthly:
                monthly[key] = []
            monthly[key].append(p.predicted_yield_tons_per_ha)

        trend = [
            {
                "month": k,
                "avg_yield": round(sum(v) / len(v), 2),
                "max_yield": round(max(v), 2),
                "min_yield": round(min(v), 2),
                "count": len(v),
            }
            for k, v in monthly.items()
        ]

        return {
            "yield_trend": trend,
            "total_predictions": len(predictions),
            "best_yield": round(max((p.predicted_yield_tons_per_ha for p in predictions), default=0), 2),
            "worst_yield": round(min((p.predicted_yield_tons_per_ha for p in predictions), default=0), 2),
            "avg_yield": round(sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2) if predictions else 0,
        }

    @staticmethod
    def crop_performance(db: Session, user_id: int) -> dict:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).all() if farm_ids else []

        crop_data: dict = {}
        for p in predictions:
            if p.crop_type not in crop_data:
                crop_data[p.crop_type] = []
            crop_data[p.crop_type].append(p.predicted_yield_tons_per_ha)

        performance = [
            {
                "crop": crop,
                "avg_yield": round(sum(yields) / len(yields), 2),
                "max_yield": round(max(yields), 2),
                "min_yield": round(min(yields), 2),
                "count": len(yields),
                "trend": "+5%",
            }
            for crop, yields in crop_data.items()
        ]

        return {
            "crop_performance": sorted(performance, key=lambda x: x["avg_yield"], reverse=True)
        }

    @staticmethod
    def farm_comparison(db: Session, user_id: int, limit: Optional[int] = None) -> dict:
        query = db.query(models.Farm).filter(models.Farm.user_id == user_id)
        if limit:
            query = query.limit(limit)
        farms = query.all()

        comparison = []
        for farm in farms:
            preds = db.query(models.Prediction).filter(
                models.Prediction.farm_id == farm.id
            ).all()
            avg_yield = round(sum(p.predicted_yield_tons_per_ha for p in preds) / len(preds), 2) if preds else 0
            comparison.append({
                "farm_id": farm.id,
                "farm_name": farm.farm_name,
                "location": farm.location,
                "total_predictions": len(preds),
                "avg_yield_tons_per_ha": avg_yield,
                "best_yield": round(max((p.predicted_yield_tons_per_ha for p in preds), default=0), 2),
                "crops_grown": list(set(p.crop_type for p in preds)),
                "soil_ph": farm.soil_ph,
                "area_hectares": farm.area_hectares,
            })

        return {"farms": comparison}

    @staticmethod
    def productivity(db: Session, user_id: int) -> dict:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).all() if farm_ids else []

        total_area = sum(f.area_hectares or 0 for f in farms)
        avg_yield = round(
            sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2
        ) if predictions else 0
        estimated_production = round(avg_yield * total_area, 2)
        estimated_revenue = round(estimated_production * 2500, 2)

        return {
            "total_area_hectares": total_area,
            "average_yield_tons_per_ha": avg_yield,
            "estimated_production_tons": estimated_production,
            "estimated_revenue_inr": estimated_revenue,
            "productivity_score": min(100, round((avg_yield / 6) * 100, 1)),
            "performance_rating": (
                "Excellent" if avg_yield > 5 else
                "Good" if avg_yield > 3 else
                "Fair" if avg_yield > 1 else "Poor"
            ),
        }

    @staticmethod
    def risk_distribution(db: Session, user_id: int) -> dict:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).all() if farm_ids else []

        total = len(predictions)
        low = len([p for p in predictions if p.risk_level == "Low"])
        medium = len([p for p in predictions if p.risk_level == "Medium"])
        high = len([p for p in predictions if p.risk_level == "High"])

        return {
            "total": total,
            "low": low,
            "medium": medium,
            "high": high,
            "low_percent": round((low / total * 100), 1) if total else 0,
            "medium_percent": round((medium / total * 100), 1) if total else 0,
            "high_percent": round((high / total * 100), 1) if total else 0,
        }

    @staticmethod
    def soil_health(db: Session, user_id: int) -> dict:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).all() if farm_ids else []

        avg_ph = round(sum(p.soil_ph for p in predictions) / len(predictions), 2) if predictions else 6.5
        avg_n = round(sum(p.nitrogen for p in predictions) / len(predictions), 2) if predictions else 0
        avg_p = round(sum(p.phosphorus for p in predictions) / len(predictions), 2) if predictions else 0
        avg_k = round(sum(p.potassium for p in predictions) / len(predictions), 2) if predictions else 0

        return {
            "avg_soil_ph": avg_ph,
            "avg_nitrogen": avg_n,
            "avg_phosphorus": avg_p,
            "avg_potassium": avg_k,
            "ph_status": "Optimal" if 6.0 <= avg_ph <= 7.0 else "Needs Attention",
            "overall_health": "Good" if avg_n > 40 and avg_p > 20 else "Fair",
        }

    @staticmethod
    def weather_impact(db: Session, user_id: int) -> dict:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).all() if farm_ids else []

        avg_rain = round(sum(p.rainfall_mm for p in predictions) / len(predictions), 1) if predictions else 0
        avg_temp = round(sum(p.temperature_c for p in predictions) / len(predictions), 1) if predictions else 0
        avg_hum = round(sum(p.humidity_percent for p in predictions) / len(predictions), 1) if predictions else 0

        return {
            "avg_rainfall_mm": avg_rain,
            "avg_temperature_c": avg_temp,
            "avg_humidity_percent": avg_hum,
            "weather_impact_on_yield": "Positive" if avg_rain > 500 and avg_temp < 35 else "Negative",
            "rainfall_adequacy": "Adequate" if avg_rain > 600 else "Insufficient",
        }

    @staticmethod
    def recent_predictions(db: Session, user_id: int, limit: int = 10) -> list:
        farms = db.query(models.Farm).filter(models.Farm.user_id == user_id).all()
        farm_ids = [f.id for f in farms]
        predictions = db.query(models.Prediction).filter(
            models.Prediction.farm_id.in_(farm_ids)
        ).order_by(models.Prediction.created_at.desc()).limit(limit).all() if farm_ids else []

        return [
            {
                "id": p.id,
                "crop_type": p.crop_type,
                "predicted_yield_tons_per_ha": p.predicted_yield_tons_per_ha,
                "confidence_score": p.confidence_score,
                "risk_level": p.risk_level,
                "rainfall_mm": p.rainfall_mm,
                "temperature_c": p.temperature_c,
                "soil_ph": p.soil_ph,
                "created_at": p.created_at.isoformat(),
            }
            for p in predictions
        ]

    @staticmethod
    def model_performance() -> dict:
        metrics = get_model_metrics()
        return {
            "accuracy_percent": metrics.get("accuracy_percent", 0),
            "mae": metrics.get("mae", 0),
            "rmse": metrics.get("rmse", 0),
            "r2": metrics.get("r2", 0),
            "training_samples": metrics.get("training_samples", 0),
            "n_crops": metrics.get("n_crops", 0),
            "crops": metrics.get("crops", []),
            "features": metrics.get("features", []),
        }


class AnalystService:
    """Platform-wide analytics (no user filter) — for Analyst and Admin roles."""

    @staticmethod
    def dashboard(db: Session) -> dict:
        total_users = db.query(models.User).count()
        total_farms = db.query(models.Farm).count()
        total_predictions = db.query(models.Prediction).count()
        predictions = db.query(models.Prediction).all()

        avg_yield = round(
            sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2
        ) if predictions else 0

        metrics = get_model_metrics()

        return {
            "total_users": total_users,
            "total_farms": total_farms,
            "total_predictions": total_predictions,
            "average_yield_tons_per_ha": avg_yield,
            "model_accuracy_percent": metrics.get("accuracy_percent", 0),
            "high_risk_count": len([p for p in predictions if p.risk_level == "High"]),
            "low_risk_count": len([p for p in predictions if p.risk_level == "Low"]),
            "crops_analyzed": list(set(p.crop_type for p in predictions)),
        }

    @staticmethod
    def yield_trends(db: Session) -> dict:
        predictions = db.query(models.Prediction).order_by(
            models.Prediction.created_at
        ).all()

        monthly: dict = {}
        for p in predictions:
            key = p.created_at.strftime("%b %Y")
            if key not in monthly:
                monthly[key] = []
            monthly[key].append(p.predicted_yield_tons_per_ha)

        trend = [
            {
                "month": k,
                "avg_yield": round(sum(v) / len(v), 2),
                "count": len(v),
            }
            for k, v in monthly.items()
        ]

        return {
            "yield_trend": trend,
            "total_predictions": len(predictions),
            "best_yield": round(max((p.predicted_yield_tons_per_ha for p in predictions), default=0), 2),
        }

    @staticmethod
    def crop_performance(db: Session) -> dict:
        predictions = db.query(models.Prediction).all()
        crop_data: dict = {}
        for p in predictions:
            if p.crop_type not in crop_data:
                crop_data[p.crop_type] = []
            crop_data[p.crop_type].append(p.predicted_yield_tons_per_ha)

        performance = [
            {
                "crop": crop,
                "avg_yield": round(sum(yields) / len(yields), 2),
                "max_yield": round(max(yields), 2),
                "count": len(yields),
            }
            for crop, yields in crop_data.items()
        ]
        return {
            "crop_performance": sorted(performance, key=lambda x: x["avg_yield"], reverse=True)
        }

    @staticmethod
    def weather_impact(db: Session) -> dict:
        predictions = db.query(models.Prediction).all()
        avg_rain = round(sum(p.rainfall_mm for p in predictions) / len(predictions), 1) if predictions else 0
        avg_temp = round(sum(p.temperature_c for p in predictions) / len(predictions), 1) if predictions else 0
        return {
            "avg_rainfall_mm": avg_rain,
            "avg_temperature_c": avg_temp,
            "total_predictions_analyzed": len(predictions),
        }

    @staticmethod
    def soil_analysis(db: Session) -> dict:
        predictions = db.query(models.Prediction).all()
        avg_ph = round(sum(p.soil_ph for p in predictions) / len(predictions), 2) if predictions else 6.5
        return {
            "avg_soil_ph": avg_ph,
            "total_analyzed": len(predictions),
            "ph_status": "Optimal" if 6.0 <= avg_ph <= 7.0 else "Needs Attention",
        }

    @staticmethod
    def farm_comparison(db: Session, limit: Optional[int] = None) -> dict:
        query = db.query(models.Farm)
        if limit:
            query = query.limit(limit)
        farms = query.all()

        comparison = []
        for farm in farms:
            preds = db.query(models.Prediction).filter(
                models.Prediction.farm_id == farm.id
            ).all()
            avg_yield = round(
                sum(p.predicted_yield_tons_per_ha for p in preds) / len(preds), 2
            ) if preds else 0
            comparison.append({
                "farm_id": farm.id,
                "farm_name": farm.farm_name,
                "location": farm.location,
                "total_predictions": len(preds),
                "avg_yield_tons_per_ha": avg_yield,
            })
        return {"farms": comparison}

    @staticmethod
    def productivity(db: Session) -> dict:
        farms = db.query(models.Farm).all()
        predictions = db.query(models.Prediction).all()
        total_area = sum(f.area_hectares or 0 for f in farms)
        avg_yield = round(
            sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2
        ) if predictions else 0
        return {
            "total_area_hectares": total_area,
            "avg_yield": avg_yield,
            "estimated_production_tons": round(avg_yield * total_area, 2),
            "estimated_revenue_inr": round(avg_yield * total_area * 2500, 2),
        }

    @staticmethod
    def risk_distribution(db: Session) -> dict:
        predictions = db.query(models.Prediction).all()
        total = len(predictions)
        low = len([p for p in predictions if p.risk_level == "Low"])
        medium = len([p for p in predictions if p.risk_level == "Medium"])
        high = len([p for p in predictions if p.risk_level == "High"])
        return {
            "total": total,
            "low": low,
            "medium": medium,
            "high": high,
            "low_percent": round(low / total * 100, 1) if total else 0,
            "medium_percent": round(medium / total * 100, 1) if total else 0,
            "high_percent": round(high / total * 100, 1) if total else 0,
        }

    @staticmethod
    def recent_predictions(db: Session, limit: int = 10) -> list:
        predictions = db.query(models.Prediction).order_by(
            models.Prediction.created_at.desc()
        ).limit(limit).all()
        return [
            {
                "id": p.id,
                "crop_type": p.crop_type,
                "predicted_yield_tons_per_ha": p.predicted_yield_tons_per_ha,
                "risk_level": p.risk_level,
                "confidence_score": p.confidence_score,
                "created_at": p.created_at.isoformat(),
            }
            for p in predictions
        ]

    @staticmethod
    def reports(db: Session, days: int = 30) -> dict:
        since = datetime.utcnow() - timedelta(days=days)
        predictions = db.query(models.Prediction).filter(
            models.Prediction.created_at >= since
        ).all()
        avg_yield = round(
            sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2
        ) if predictions else 0
        return {
            "period_days": days,
            "total_predictions": len(predictions),
            "avg_yield": avg_yield,
            "high_risk": len([p for p in predictions if p.risk_level == "High"]),
            "crops": list(set(p.crop_type for p in predictions)),
        }
