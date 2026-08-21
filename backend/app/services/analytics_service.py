"""
YieldSense AI  -  Analytics Service

Computes dashboard summary statistics and chart data
from Firestore prediction history and farm data.
"""

from collections import defaultdict
from typing import Any, Dict, List, Optional

from app.firebase.firestore import get_firestore_client, FARMS_COLLECTION
from app.services.history_service import HistoryService


class AnalyticsService:
    """Computes analytics and dashboard summary data."""

    def __init__(self):
        self.db = get_firestore_client()
        self.history_svc = HistoryService()

    def get_dashboard_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Build the complete live dashboard summary for a user.

        Includes:
        - Farm stats (count, area, crops)
        - Prediction stats (count, avg yield, latest prediction)
        - Risk overview (latest level, high risk count)
        - Recent predictions (5 most recent)
        - Recent farms (5 most recently added)
        - ML model info

        Returns:
            Dashboard summary dict.
        """
        # ---- Farm stats ----
        farm_query = (
            self.db.collection(FARMS_COLLECTION)
            .where("user_id", "==", user_id)
            .where("is_deleted", "==", False)
        )
        farm_docs = list(farm_query.stream())

        total_farms = len(farm_docs)
        total_area = 0.0
        crops = set()
        farm_list = []

        for doc in farm_docs:
            data = doc.to_dict()
            data["id"] = doc.id
            total_area += data.get("area", 0.0)
            crop = data.get("crop", "")
            if crop:
                crops.add(crop)
            farm_list.append(data)

        # Sort farms by created_at for recent farms
        farm_list.sort(key=lambda f: f.get("created_at", ""), reverse=True)
        recent_farms = []
        for f in farm_list[:5]:
            recent_farms.append({
                "id": f["id"],
                "name": f.get("name", ""),
                "location": f.get("location", ""),
                "crop": f.get("crop", ""),
                "area": f.get("area", 0.0),
                "created_at": f.get("created_at", ""),
            })

        # ---- Prediction history stats ----
        all_predictions = self.history_svc.get_all_for_analytics(user_id, limit=100)

        total_predictions = len(all_predictions)
        avg_yield = None
        high_risk_count = 0
        latest_risk_level = None
        latest_risk_score = None

        yield_values = []
        for pred in all_predictions:
            y = pred.get("predicted_yield")
            if y is not None:
                yield_values.append(float(y))
            risk_level = pred.get("risk_level")
            if risk_level in ("High", "Critical"):
                high_risk_count += 1

        if yield_values:
            avg_yield = round(sum(yield_values) / len(yield_values), 3)

        # Latest prediction (most recent in already-sorted list)
        latest_prediction = None
        if all_predictions:
            p = all_predictions[0]
            latest_prediction = {
                "id": p.get("id"),
                "crop": p.get("crop", ""),
                "season": p.get("season", ""),
                "area": p.get("area", 0),
                "predicted_yield": p.get("predicted_yield", 0),
                "total_production": p.get("total_production", 0),
                "confidence": p.get("confidence", ""),
                "risk_level": p.get("risk_level"),
                "risk_score": p.get("risk_score"),
                "farm_name": p.get("farm_name"),
                "created_at": p.get("created_at", ""),
            }
            latest_risk_level = p.get("risk_level")
            latest_risk_score = p.get("risk_score")

        # Build recent predictions list (top 5)
        recent_predictions = []
        for p in all_predictions[:5]:
            recent_predictions.append({
                "id": p.get("id"),
                "crop": p.get("crop", ""),
                "season": p.get("season", ""),
                "area": p.get("area", 0),
                "predicted_yield": p.get("predicted_yield", 0),
                "total_production": p.get("total_production", 0),
                "confidence": p.get("confidence", ""),
                "risk_level": p.get("risk_level"),
                "risk_score": p.get("risk_score"),
                "farm_name": p.get("farm_name"),
                "created_at": p.get("created_at", ""),
            })

        # ---- ML Model info ----
        model_name = None
        model_accuracy = None
        model_status = "not_trained"
        try:
            from ml.inference.predictor import CropYieldPredictor
            predictor = CropYieldPredictor.get_instance()
            info = predictor.get_model_info()
            model_name = info.get("model_name")
            model_accuracy = info.get("test_r2")
            model_status = info.get("status", "ready")
        except Exception:
            pass

        return {
            "total_farms": total_farms,
            "total_area": round(total_area, 2),
            "unique_crops": len(crops),
            "crop_list": sorted(list(crops)),
            "total_predictions": total_predictions,
            "avg_predicted_yield": avg_yield,
            "latest_prediction": latest_prediction,
            "latest_risk_level": latest_risk_level,
            "latest_risk_score": latest_risk_score,
            "high_risk_count": high_risk_count,
            "recent_predictions": recent_predictions,
            "recent_farms": recent_farms,
            "model_name": model_name,
            "model_accuracy": model_accuracy,
            "model_status": model_status,
        }

    def get_analytics_data(self, user_id: str, limit: int = 100) -> Dict[str, Any]:
        """
        Compute full analytics data for chart components.

        Returns:
            Dict with yield_trend, crop_comparison, season_comparison,
            rainfall_vs_yield arrays and aggregate metrics.
        """
        records = self.history_svc.get_all_for_analytics(user_id, limit=limit)

        if not records:
            return {
                "yield_trend": [],
                "crop_comparison": [],
                "season_comparison": [],
                "rainfall_vs_yield": [],
                "total_predictions": 0,
                "avg_yield": None,
                "best_crop": None,
                "best_season": None,
                "data_range_days": 30,
            }

        # ---- Yield Trend (sorted chronologically) ----
        trend_records = sorted(records, key=lambda r: r.get("created_at", ""))
        yield_trend = []
        for r in trend_records:
            yield_trend.append({
                "date": r.get("created_at", "")[:10],
                "predicted_yield": r.get("predicted_yield", 0),
                "crop": r.get("crop", ""),
                "season": r.get("season", ""),
                "area": r.get("area", 0),
            })

        # ---- Crop Comparison ----
        crop_stats: Dict[str, Dict] = defaultdict(lambda: {"total_yield": 0.0, "total_production": 0.0, "count": 0})
        for r in records:
            crop = r.get("crop", "Unknown")
            y = r.get("predicted_yield", 0) or 0
            tp = r.get("total_production", 0) or 0
            crop_stats[crop]["total_yield"] += y
            crop_stats[crop]["total_production"] += tp
            crop_stats[crop]["count"] += 1

        crop_comparison = []
        for crop, stats in crop_stats.items():
            count = stats["count"]
            crop_comparison.append({
                "crop": crop,
                "avg_yield": round(stats["total_yield"] / count, 3) if count > 0 else 0,
                "count": count,
                "total_production": round(stats["total_production"], 2),
            })
        crop_comparison.sort(key=lambda c: c["avg_yield"], reverse=True)

        # ---- Season Comparison ----
        season_stats: Dict[str, Dict] = defaultdict(lambda: {"total_yield": 0.0, "count": 0})
        for r in records:
            season = r.get("season", "Unknown")
            y = r.get("predicted_yield", 0) or 0
            season_stats[season]["total_yield"] += y
            season_stats[season]["count"] += 1

        season_comparison = []
        for season, stats in season_stats.items():
            count = stats["count"]
            season_comparison.append({
                "season": season,
                "avg_yield": round(stats["total_yield"] / count, 3) if count > 0 else 0,
                "count": count,
            })

        # ---- Rainfall vs Yield Scatter ----
        rainfall_vs_yield = []
        for r in records:
            rainfall = r.get("annual_rainfall")
            y = r.get("predicted_yield")
            temp = r.get("temperature")
            if rainfall is not None and y is not None:
                rainfall_vs_yield.append({
                    "rainfall": float(rainfall),
                    "yield_value": float(y),
                    "crop": r.get("crop", ""),
                    "temperature": float(temp) if temp is not None else 25.0,
                })

        # ---- Aggregate metrics ----
        all_yields = [r.get("predicted_yield", 0) for r in records if r.get("predicted_yield") is not None]
        avg_yield = round(sum(all_yields) / len(all_yields), 3) if all_yields else None
        best_crop = crop_comparison[0]["crop"] if crop_comparison else None
        best_season = season_comparison[0]["season"] if season_comparison else None

        # ---- Productivity Score ----
        # (latest yield / historical average yield) * 100
        # Represents how the most recent prediction compares to the user's overall average.
        productivity_score = None
        if avg_yield and avg_yield > 0 and records:
            latest_yield = records[0].get("predicted_yield")  # records sorted desc by date
            if latest_yield is not None:
                productivity_score = round((float(latest_yield) / avg_yield) * 100, 1)

        # ---- Farm Comparison ----
        # Group prediction history by farm_name and compute per-farm metrics.
        farm_stats: Dict[str, Dict] = defaultdict(lambda: {"total_yield": 0.0, "total_production": 0.0, "count": 0})
        for r in records:
            fname = r.get("farm_name") or "Unnamed Farm"
            y = r.get("predicted_yield", 0) or 0
            tp = r.get("total_production", 0) or 0
            farm_stats[fname]["total_yield"] += y
            farm_stats[fname]["total_production"] += tp
            farm_stats[fname]["count"] += 1

        farm_comparison = []
        for fname, stats in farm_stats.items():
            count = stats["count"]
            farm_comparison.append({
                "farm_name": fname,
                "avg_yield": round(stats["total_yield"] / count, 3) if count > 0 else 0,
                "count": count,
                "total_production": round(stats["total_production"], 2),
            })
        farm_comparison.sort(key=lambda f: f["avg_yield"], reverse=True)

        return {
            "yield_trend": yield_trend,
            "crop_comparison": crop_comparison,
            "season_comparison": season_comparison,
            "rainfall_vs_yield": rainfall_vs_yield,
            "farm_comparison": farm_comparison,
            "total_predictions": len(records),
            "avg_yield": avg_yield,
            "best_crop": best_crop,
            "best_season": best_season,
            "productivity_score": productivity_score,
            "data_range_days": 30,
        }
