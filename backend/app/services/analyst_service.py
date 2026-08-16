from collections import defaultdict
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models
from app.ml.predictor import get_model_metrics


class AnalystService:
    """
    Platform-wide analytics, unlike AnalyticsService which is scoped to a
    single user's own farms. Analysts (and Admins) see data across every
    user's farms, per the 'View All Farms' / 'Reports: All' permissions.
    """

    @staticmethod
    def dashboard(db: Session):
        total_users = db.query(func.count(models.User.id)).scalar() or 0
        total_farms = db.query(func.count(models.Farm.id)).scalar() or 0
        total_predictions = db.query(func.count(models.Prediction.id)).scalar() or 0

        total_area = db.query(func.sum(models.Farm.area_hectares)).scalar() or 0
        avg_yield = db.query(func.avg(models.Prediction.predicted_yield_tons_per_ha)).scalar() or 0
        highest_yield = db.query(func.max(models.Prediction.predicted_yield_tons_per_ha)).scalar() or 0
        lowest_yield = db.query(func.min(models.Prediction.predicted_yield_tons_per_ha)).scalar() or 0
        avg_confidence = db.query(func.avg(models.Prediction.confidence_score)).scalar() or 0
        avg_soil_ph = db.query(func.avg(models.SoilAnalysis.ph)).scalar() or 0
        avg_fertility = db.query(func.avg(models.SoilAnalysis.fertility_score)).scalar() or 0

        predictions = db.query(models.Prediction).all()

        risks = {"Low": 0, "Medium": 0, "High": 0}
        crop_stats = defaultdict(list)
        for p in predictions:
            if p.risk_level in risks:
                risks[p.risk_level] += 1
            crop_stats[p.crop_type].append(p.predicted_yield_tons_per_ha)

        best_crop = None
        best_avg = 0
        for crop, yields in crop_stats.items():
            avg = sum(yields) / len(yields)
            if avg > best_avg:
                best_avg = avg
                best_crop = crop

        metrics = get_model_metrics()

        return {
            "total_users": total_users,
            "total_farms": total_farms,
            "total_predictions": total_predictions,
            "total_area_hectares": round(total_area, 2),
            "average_yield": round(avg_yield, 2),
            "highest_yield": round(highest_yield, 2),
            "lowest_yield": round(lowest_yield, 2),
            "average_confidence": round(avg_confidence, 2),
            "average_soil_ph": round(avg_soil_ph, 2),
            "average_fertility": round(avg_fertility, 2),
            "best_crop": best_crop,
            "high_risk": risks["High"],
            "medium_risk": risks["Medium"],
            "low_risk": risks["Low"],
            "model_accuracy": metrics.get("accuracy_percent", 0),
            "mae": metrics.get("mae", 0),
            "rmse": metrics.get("rmse", 0),
            "training_samples": metrics.get("training_samples", 0),
            "n_crops": metrics.get("n_crops", 0),
        }

    @staticmethod
    def yield_trends(db: Session):
        predictions = (
            db.query(models.Prediction)
            .order_by(models.Prediction.created_at)
            .all()
        )

        if not predictions:
            return {
                "yield_trend": [],
                "total_predictions": 0,
                "best_yield": 0,
                "worst_yield": 0,
                "average_yield": 0,
            }

        monthly = defaultdict(list)
        for p in predictions:
            key = p.created_at.strftime("%b %Y")
            monthly[key].append(p.predicted_yield_tons_per_ha)

        trend = [
            {
                "month": month,
                "average_yield": round(sum(values) / len(values), 2),
                "maximum_yield": round(max(values), 2),
                "minimum_yield": round(min(values), 2),
                "prediction_count": len(values),
            }
            for month, values in monthly.items()
        ]

        yields = [p.predicted_yield_tons_per_ha for p in predictions]
        return {
            "yield_trend": trend,
            "total_predictions": len(predictions),
            "average_yield": round(sum(yields) / len(yields), 2),
            "best_yield": max(yields),
            "worst_yield": min(yields),
        }

    @staticmethod
    def crop_performance(db: Session):
        predictions = db.query(models.Prediction).all()

        if not predictions:
            return {"crop_performance": [], "total_crop_types": 0, "best_crop": None, "highest_average_yield": 0}

        crops = defaultdict(list)
        for p in predictions:
            crops[p.crop_type].append(p)

        report = []
        for crop_name, crop_predictions in crops.items():
            yields = [p.predicted_yield_tons_per_ha for p in crop_predictions]
            confidence = [p.confidence_score for p in crop_predictions]

            risks = defaultdict(int)
            for item in crop_predictions:
                risks[item.risk_level] += 1
            dominant_risk = max(risks.items(), key=lambda x: x[1])[0]

            latest_prediction = max(crop_predictions, key=lambda x: x.created_at)

            report.append({
                "crop": crop_name,
                "prediction_count": len(crop_predictions),
                "average_yield": round(sum(yields) / len(yields), 2),
                "highest_yield": round(max(yields), 2),
                "lowest_yield": round(min(yields), 2),
                "average_confidence": round(sum(confidence) / len(confidence), 2),
                "risk_level": dominant_risk,
                "latest_prediction": latest_prediction.created_at,
                "latest_yield": latest_prediction.predicted_yield_tons_per_ha,
            })

        report.sort(key=lambda x: x["average_yield"], reverse=True)

        return {"total_crops": len(report),"average_yield": round(sum(item["average_yield"] for item in report) / len(report), 2) if report else 0,"best_crop": report[0]["crop"] if report else "--","highest_risk_crop": max(report,key=lambda x: {"Low": 1, "Medium": 2, "High": 3}[x["risk_level"]],default={"crop": "--"},)["crop"],"crop_performance": [
        {
            "crop_name": item["crop"],
            "prediction_count": item["prediction_count"],
            "average_yield": item["average_yield"],
            "risk_level": item["risk_level"],
        }
          for item in report
          ],

        }

    @staticmethod
    def farm_comparison(db: Session, limit: int = None):
        farms = db.query(models.Farm).all()

        comparison = []
        for farm in farms:
            predictions = (
                db.query(models.Prediction)
                .filter(models.Prediction.farm_id == farm.id)
                .all()
            )

            if predictions:
                yields = [p.predicted_yield_tons_per_ha for p in predictions]
                avg_yield = sum(yields) / len(yields)
                best_yield = max(yields)
                worst_yield = min(yields)
                avg_confidence = sum(p.confidence_score for p in predictions) / len(predictions)
                productivity_score = min(100, round((avg_yield / 6) * 100, 1))
            else:
                avg_yield = best_yield = worst_yield = avg_confidence = productivity_score = 0

            owner = db.query(models.User).filter(models.User.id == farm.user_id).first()

            comparison.append({
                "farm_id": farm.id,
                "farm_name": farm.farm_name,
                "owner_name": owner.full_name if owner else "Unknown",
                "location": farm.location,
                "area_hectares": farm.area_hectares,
                "soil_ph": farm.soil_ph,
                "soil_type": farm.soil_type,
                "prediction_count": len(predictions),
                "average_yield": round(avg_yield, 2),
                "highest_yield": round(best_yield, 2),
                "lowest_yield": round(worst_yield, 2),
                "average_confidence": round(avg_confidence, 2),
                "productivity_score": productivity_score,
                "crop_type": ", ".join(sorted({p.crop_type for p in predictions})),            })

        comparison.sort(key=lambda x: x["productivity_score"], reverse=True)
        for index, farm in enumerate(comparison):
            farm["rank"] = index + 1

        if limit:
            comparison = comparison[:limit]

        return {"total_farms": len(farms),"average_yield": round(  sum(f["average_yield"] for f in comparison) / len(comparison), 2) if comparison else 0,"best_farm": comparison[0]["farm_name"] if comparison else "--","highest_risk_farm": max(comparison,key=lambda x: x["prediction_count"],default={"farm_name": "--"},)["farm_name"],"farm_comparison": comparison,}

    @staticmethod
    def productivity(db: Session):
        farms = db.query(models.Farm).all()
        predictions = db.query(models.Prediction).all()

        total_area = sum(f.area_hectares or 0 for f in farms)

        if predictions:
            avg_yield = sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions)
            production = avg_yield * total_area
            revenue = production * 2500
            productivity_score = min(100, round((avg_yield / 6) * 100, 1))

            if productivity_score >= 90:
                rating = "Excellent"
            elif productivity_score >= 75:
                rating = "Very Good"
            elif productivity_score >= 60:
                rating = "Good"
            elif productivity_score >= 40:
                rating = "Average"
            else:
                rating = "Poor"
        else:
            avg_yield = production = revenue = productivity_score = 0
            rating = "No Data"

        excellent = good = average = poor = 0
        for farm in farms:
            preds = [p for p in predictions if p.farm_id == farm.id]
            if not preds:
                continue
            score = min(100, (sum(p.predicted_yield_tons_per_ha for p in preds) / len(preds) / 6) * 100)
            if score >= 90:
                excellent += 1
            elif score >= 70:
                good += 1
            elif score >= 40:
                average += 1
            else:
                poor += 1

        return {
            "total_area_hectares": round(total_area, 2),
            "average_yield_tons_per_ha": round(avg_yield, 2),
            "estimated_production_tons": round(production, 2),
            "estimated_revenue_inr": round(revenue, 2),
            "productivity_score": productivity_score,
            "performance_rating": rating,
            "excellent_farms": excellent,
            "good_farms": good,
            "average_farms": average,
            "poor_farms": poor,
        }

    @staticmethod
    def weather_impact(db: Session):
        predictions = db.query(models.Prediction).all()

        if not predictions:
            return {"average_temperature": 0, "average_rainfall": 0, "average_humidity": 0, "average_yield": 0}

        return {
            "average_temperature": round(sum(p.temperature_c for p in predictions) / len(predictions), 2),
            "average_rainfall": round(sum(p.rainfall_mm for p in predictions) / len(predictions), 2),
            "average_humidity": round(sum(p.humidity_percent for p in predictions) / len(predictions), 2),
            "average_yield": round(sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2),
        }

    @staticmethod
    def soil_analysis(db: Session):
        analyses = db.query(models.SoilAnalysis).all()

        if not analyses:
            return {
                "total_analyses": 0, "average_ph": 0, "average_fertility": 0,
                "healthy_soils": 0, "acidic_soils": 0, "alkaline_soils": 0,
            }

        avg_ph = sum(a.ph for a in analyses) / len(analyses)
        scored = [a.fertility_score for a in analyses if a.fertility_score is not None]
        avg_fertility = sum(scored) / len(scored) if scored else 0

        healthy = acidic = alkaline = 0
        for soil in analyses:
            if soil.ph < 6:
                acidic += 1
            elif soil.ph > 7.5:
                alkaline += 1
            else:
                healthy += 1

        return {
            "total_analyses": len(analyses),
            "average_ph": round(avg_ph, 2),
            "average_fertility": round(avg_fertility, 2),
            "healthy_soils": healthy,
            "acidic_soils": acidic,
            "alkaline_soils": alkaline,
        }

    @staticmethod
    def risk_distribution(db: Session):
        predictions = db.query(models.Prediction).all()

        low = medium = high = 0
        for prediction in predictions:
            if prediction.risk_level == "Low":
                low += 1
            elif prediction.risk_level == "Medium":
                medium += 1
            elif prediction.risk_level == "High":
                high += 1

        total = len(predictions)

        return {
            "total_predictions": total,
            "low": low,
            "medium": medium,
            "high": high,
            "low_percent": round((low / total) * 100, 2) if total else 0,
            "medium_percent": round((medium / total) * 100, 2) if total else 0,
            "high_percent": round((high / total) * 100, 2) if total else 0,
        }

    @staticmethod
    def recent_predictions(db: Session, limit: int = 10):
        predictions = (
            db.query(models.Prediction)
            .order_by(models.Prediction.created_at.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "id": p.id,
                "farm_id": p.farm_id,
                "crop_type": p.crop_type,
                "yield": p.predicted_yield_tons_per_ha,
                "confidence": p.confidence_score,
                "risk": p.risk_level,
                "temperature": p.temperature_c,
                "rainfall": p.rainfall_mm,
                "humidity": p.humidity_percent,
                "created_at": p.created_at,
            }
            for p in predictions
        ]

    @staticmethod
    def reports(db: Session, days: int = 30):
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        predictions = (
            db.query(models.Prediction)
            .filter(models.Prediction.created_at >= cutoff)
            .order_by(models.Prediction.created_at.desc())
            .all()
        )

        farms_active = {p.farm_id for p in predictions}

        return {
            "report_type": f"Platform Report — Last {days} Days",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "period_days": days,
            "total_predictions": len(predictions),
            "active_farms": len(farms_active),
            "average_yield": round(
                sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2
            ) if predictions else 0,
            "predictions": [
                {
                    "id": p.id,
                    "farm_id": p.farm_id,
                    "crop_type": p.crop_type,
                    "predicted_yield": p.predicted_yield_tons_per_ha,
                    "risk_level": p.risk_level,
                    "date": p.created_at.strftime("%Y-%m-%d"),
                }
                for p in predictions[:50]
            ],
        }