"""
YieldSense AI  -  Report Generation Service

Creates, saves, and retrieves structured reports from Firestore.
Reports are assembled from prediction history, risk, and recommendations.
"""

import math
from typing import Any, Dict, List, Optional, Tuple

from app.firebase.firestore import get_firestore_client, REPORTS_COLLECTION
from app.models.report import Report
from app.utils.helpers import utc_now_iso
from app.utils.exceptions import NotFoundException, ForbiddenException


class ReportService:
    """Handles report generation and CRUD operations."""

    def __init__(self):
        self.db = get_firestore_client()

    def generate_report(
        self,
        user_id: str,
        prediction_id: str,
        report_type: str = "prediction",
        title: Optional[str] = None,
        farm_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a structured report by assembling data from Firestore.

        Args:
            user_id: Firebase UID.
            prediction_id: ID of the prediction record to base report on.
            report_type: 'prediction', 'farm', or 'seasonal'.
            title: Custom report title.
            farm_id: Optional farm ID.

        Returns:
            Generated report dict including all data payloads.
        """
        from app.services.history_service import HistoryService
        from app.services.risk_service import assess_risk
        from app.services.recommendation_service import generate_recommendations

        # Load prediction record
        history_svc = HistoryService()
        prediction_record = history_svc.get_prediction(prediction_id, user_id)

        # Rebuild risk assessment from stored inputs
        risk_input = {
            "crop": prediction_record.get("crop", ""),
            "temperature": prediction_record.get("temperature", 25),
            "annual_rainfall": prediction_record.get("annual_rainfall", 1000),
            "humidity": prediction_record.get("humidity", 60),
            "soil_ph": prediction_record.get("soil_ph", 6.5),
            "nitrogen": prediction_record.get("nitrogen", 80),
            "phosphorus": prediction_record.get("phosphorus", 40),
            "potassium": prediction_record.get("potassium", 35),
            "predicted_yield": prediction_record.get("predicted_yield", 0),
            "season": prediction_record.get("season", "Kharif"),
        }
        risk_data = assess_risk(risk_input)

        # Rebuild recommendations
        rec_input = {**risk_input}
        rec_input["area"] = prediction_record.get("area", 0)
        rec_input["state"] = prediction_record.get("state", "Unknown")
        rec_input["weather_summary"] = prediction_record.get("weather_summary")
        recommendations = generate_recommendations(rec_input)

        # Fetch farm info if farm_id provided
        farm_data = None
        if farm_id:
            try:
                from app.services.farm_service import FarmService
                farm_svc = FarmService()
                farm_data = farm_svc.get_farm(farm_id, user_id)
            except Exception:
                farm_data = None

        # Determine report title
        crop = prediction_record.get("crop", "Unknown")
        season = prediction_record.get("season", "")
        if not title:
            title = f"{crop} {season} Yield Report - {utc_now_iso()[:10]}"


        farm_name = None
        if farm_data:
            farm_name = farm_data.get("name")
        elif prediction_record.get("farm_name"):
            farm_name = prediction_record.get("farm_name")

        # Build the complete report payload
        report_data = {
            "prediction": {
                "id": prediction_id,
                "crop": prediction_record.get("crop"),
                "season": prediction_record.get("season"),
                "state": prediction_record.get("state"),
                "area": prediction_record.get("area"),
                "predicted_yield": prediction_record.get("predicted_yield"),
                "total_production": prediction_record.get("total_production"),
                "prediction_unit": prediction_record.get("prediction_unit", "tons/hectare"),
                "model_used": prediction_record.get("model_used"),
                "confidence": prediction_record.get("confidence"),
                "model_accuracy": prediction_record.get("model_accuracy"),
                "created_at": prediction_record.get("created_at"),
            },
            "inputs": {
                "temperature": prediction_record.get("temperature"),
                "annual_rainfall": prediction_record.get("annual_rainfall"),
                "humidity": prediction_record.get("humidity"),
                "soil_ph": prediction_record.get("soil_ph"),
                "nitrogen": prediction_record.get("nitrogen"),
                "phosphorus": prediction_record.get("phosphorus"),
                "potassium": prediction_record.get("potassium"),
                "fertilizer_usage": prediction_record.get("fertilizer_usage"),
                "pesticide_usage": prediction_record.get("pesticide_usage"),
            },
            "weather_summary": prediction_record.get("weather_summary"),
            "soil_summary": prediction_record.get("soil_summary"),
            "risk_assessment": risk_data,
            "recommendations": recommendations,
            "farm": farm_data,
            "generated_at": utc_now_iso(),
            "generated_by": "YieldSense AI",
        }

        # Save report to Firestore
        report = Report(
            user_id=user_id,
            title=title,
            report_type=report_type,
            status="generated",
            farm_id=farm_id,
            farm_name=farm_name,
            prediction_id=prediction_id,
            data=report_data,
        )

        doc_ref = self.db.collection(REPORTS_COLLECTION).add(report.to_dict())
        result = report.to_dict()
        result["id"] = doc_ref[1].id

        # Fire notification
        try:
            from app.services.notification_service import NotificationService
            notif_svc = NotificationService()
            notif_svc.create_notification(
                user_id=user_id,
                title="Report Generated",
                message=f"Your report '{title}' has been generated and is ready to download.",
                notification_type="success",
                link="/reports",
            )
        except Exception:
            pass

        return result

    def get_reports(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all reports for a user (most recent first)."""
        query = self.db.collection(REPORTS_COLLECTION).where("user_id", "==", user_id)
        docs = list(query.stream())
        all_reports = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            all_reports.append(data)

        # Sort in Python by created_at descending
        all_reports.sort(key=lambda r: r.get("created_at", ""), reverse=True)

        result = []
        for data in all_reports[:50]:
            # Include lightweight summary only (not full data dict)
            result.append({
                "id": data["id"],
                "title": data.get("title", ""),
                "report_type": data.get("report_type", ""),
                "status": data.get("status", ""),
                "farm_name": data.get("farm_name"),
                "crop": data.get("data", {}).get("prediction", {}).get("crop"),
                "created_at": data.get("created_at", ""),
            })
        return result

    def get_report(self, report_id: str, user_id: str) -> Dict[str, Any]:
        """Get a single report by ID with ownership check."""
        doc = self.db.collection(REPORTS_COLLECTION).document(report_id).get()
        if not doc.exists:
            raise NotFoundException(resource="Report", resource_id=report_id)
        data = doc.to_dict()
        if data.get("user_id") != user_id:
            raise ForbiddenException(detail="You do not have access to this report.")
        data["id"] = doc.id
        return data

    def delete_report(self, report_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a report (with ownership check)."""
        self.get_report(report_id, user_id)
        self.db.collection(REPORTS_COLLECTION).document(report_id).delete()
        return {"message": "Report deleted successfully.", "id": report_id}
