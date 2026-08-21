"""
YieldSense AI  -  Prediction History Service

Manages storage and retrieval of prediction history in Firestore.
"""

import math
from typing import Any, Dict, List, Optional, Tuple

from app.firebase.firestore import get_firestore_client, PREDICTION_HISTORY_COLLECTION
from app.models.prediction_record import PredictionRecord
from app.utils.helpers import utc_now_iso
from app.utils.exceptions import NotFoundException, ForbiddenException


class HistoryService:
    """Handles prediction history CRUD operations."""

    def __init__(self):
        self.db = get_firestore_client()

    def save_prediction(
        self,
        user_id: str,
        prediction_data: Dict[str, Any],
        input_data: Dict[str, Any],
        risk_data: Optional[Dict[str, Any]] = None,
        farm_id: Optional[str] = None,
        farm_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Save a completed prediction to Firestore history.

        Args:
            user_id: Firebase UID of the user.
            prediction_data: The full prediction response dict.
            input_data: The original prediction request inputs.
            risk_data: Optional risk assessment result.
            farm_id: Optional linked farm ID.
            farm_name: Optional farm display name.

        Returns:
            Saved prediction record dict with Firestore ID.
        """
        risk_level = None
        risk_score = None
        if risk_data:
            risk_level = risk_data.get("overall_risk_level")
            risk_score = risk_data.get("risk_score")

        record = PredictionRecord(
            user_id=user_id,
            farm_id=farm_id,
            farm_name=farm_name,
            crop=prediction_data.get("crop", input_data.get("crop", "")),
            season=prediction_data.get("season", input_data.get("season", "Kharif")),
            state=input_data.get("state", "Unknown"),
            area=prediction_data.get("area", input_data.get("area", 0.0)),
            temperature=input_data.get("temperature", 0.0),
            annual_rainfall=input_data.get("annual_rainfall", 0.0),
            humidity=input_data.get("humidity"),
            soil_ph=input_data.get("soil_ph", 7.0),
            nitrogen=input_data.get("nitrogen", 0.0),
            phosphorus=input_data.get("phosphorus", 0.0),
            potassium=input_data.get("potassium", 0.0),
            fertilizer_usage=input_data.get("fertilizer_usage", 100.0),
            pesticide_usage=input_data.get("pesticide_usage", 10.0),
            predicted_yield=prediction_data.get("predicted_yield", 0.0),
            total_production=prediction_data.get("total_production", 0.0),
            prediction_unit=prediction_data.get("prediction_unit", "tons/hectare"),
            model_used=prediction_data.get("model_used", ""),
            confidence=prediction_data.get("confidence", ""),
            model_accuracy=prediction_data.get("model_accuracy"),
            latitude=input_data.get("latitude"),
            longitude=input_data.get("longitude"),
            risk_level=risk_level,
            risk_score=risk_score,
            weather_summary=prediction_data.get("weather_summary"),
            soil_summary=prediction_data.get("soil_summary"),
        )

        doc_ref = self.db.collection(PREDICTION_HISTORY_COLLECTION).add(record.to_dict())
        result = record.to_dict()
        result["id"] = doc_ref[1].id
        return result

    def get_history(self, user_id: str, page: int = 1, limit: int = 20) -> Tuple[List[Dict], int]:
        """
        Get paginated prediction history for a user (most recent first).

        Returns:
            Tuple of (list of prediction dicts, total count).
        """
        # Query by user_id only (does not require composite index in Firestore)
        query = self.db.collection(PREDICTION_HISTORY_COLLECTION).where("user_id", "==", user_id)
        all_docs = list(query.stream())

        records = []
        for doc in all_docs:
            data = doc.to_dict()
            data["id"] = doc.id
            records.append(data)

        # Sort in Python by created_at descending
        records.sort(key=lambda r: r.get("created_at", ""), reverse=True)

        total = len(records)
        offset = (page - 1) * limit
        paginated = records[offset: offset + limit]

        return paginated, total

    def get_prediction(self, prediction_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a single prediction record by ID.

        Raises:
            NotFoundException: If the record does not exist.
            ForbiddenException: If the record does not belong to the user.
        """
        doc = self.db.collection(PREDICTION_HISTORY_COLLECTION).document(prediction_id).get()

        if not doc.exists:
            raise NotFoundException(resource="Prediction", resource_id=prediction_id)

        data = doc.to_dict()
        if data.get("user_id") != user_id:
            raise ForbiddenException(detail="You do not have access to this prediction record.")

        data["id"] = doc.id
        return data

    def delete_prediction(self, prediction_id: str, user_id: str) -> Dict[str, Any]:
        """
        Delete a prediction record.

        Returns:
            Success message dict.
        """
        # Verify ownership
        self.get_prediction(prediction_id, user_id)
        self.db.collection(PREDICTION_HISTORY_COLLECTION).document(prediction_id).delete()
        return {"message": "Prediction record deleted successfully.", "id": prediction_id}

    def get_recent_predictions(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get the N most recent predictions for a user."""
        records = self.get_all_for_analytics(user_id, limit=100)
        return records[:limit]

    def get_all_for_analytics(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all prediction records for analytics computation."""
        query = self.db.collection(PREDICTION_HISTORY_COLLECTION).where("user_id", "==", user_id)
        docs = list(query.stream())
        records = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            records.append(data)
        records.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return records[:limit]

