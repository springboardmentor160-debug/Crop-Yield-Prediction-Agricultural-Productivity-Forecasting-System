"""
YieldSense AI  -  Admin Service

Manages system-wide administration, user management, platform metrics, and audit logs.
"""

from typing import Any, Dict, List
from app.firebase.firestore import (
    get_firestore_client,
    USERS_COLLECTION,
    FARMS_COLLECTION,
    PREDICTION_HISTORY_COLLECTION,
    REPORTS_COLLECTION,
)
from app.utils.exceptions import NotFoundException, ForbiddenException
from app.utils.helpers import utc_now_iso


class AdminService:
    """Handles system-wide admin business logic."""

    def __init__(self):
        self.db = get_firestore_client()

    def _verify_admin(self, user_id: str):
        """Verify that the requesting user has the admin role."""
        doc = self.db.collection(USERS_COLLECTION).document(user_id).get()
        if not doc.exists:
            raise NotFoundException(resource="User", resource_id=user_id)
        data = doc.to_dict()
        if data.get("role") != "admin":
            raise ForbiddenException(detail="Admin access required")

    def get_system_stats(self, admin_user_id: str) -> Dict[str, Any]:
        """Get system-wide aggregate stats for the Admin Control Center."""
        self._verify_admin(admin_user_id)

        # Users stats
        user_docs = list(self.db.collection(USERS_COLLECTION).stream())
        total_users = len(user_docs)
        farmers_count = 0
        admin_count = 0
        for u in user_docs:
            d = u.to_dict()
            role = d.get("role", "farmer")
            if role == "admin":
                admin_count += 1
            else:
                farmers_count += 1

        # System farms
        farm_docs = list(self.db.collection(FARMS_COLLECTION).where("is_deleted", "==", False).stream())
        total_farms = len(farm_docs)

        # System predictions
        pred_docs = list(self.db.collection(PREDICTION_HISTORY_COLLECTION).stream())
        total_predictions = len(pred_docs)

        # System reports
        report_docs = list(self.db.collection(REPORTS_COLLECTION).stream())
        total_reports = len(report_docs)

        # ML Model info
        model_name = "Not Loaded"
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
            "total_users": total_users,
            "farmers_count": farmers_count,
            "admin_count": admin_count,
            "total_farms": total_farms,
            "total_predictions": total_predictions,
            "total_reports": total_reports,
            "model_name": model_name,
            "model_accuracy": model_accuracy,
            "model_status": model_status,
            "system_status": "healthy",
            "version": "v3.0.0",
        }

    def list_all_users(self, admin_user_id: str) -> List[Dict[str, Any]]:
        """Get a list of all registered users in the platform."""
        self._verify_admin(admin_user_id)

        user_docs = list(self.db.collection(USERS_COLLECTION).stream())
        users = []
        for doc in user_docs:
            data = doc.to_dict()
            data["uid"] = doc.id
            users.append({
                "uid": doc.id,
                "email": data.get("email", ""),
                "display_name": data.get("display_name", "Anonymous"),
                "role": data.get("role", "farmer"),
                "created_at": data.get("created_at", ""),
                "is_active": data.get("is_active", True),
            })
        users.sort(key=lambda u: u.get("created_at", ""), reverse=True)
        return users

    def list_system_predictions(self, admin_user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all platform prediction records across all users."""
        self._verify_admin(admin_user_id)

        docs = list(self.db.collection(PREDICTION_HISTORY_COLLECTION).stream())
        records = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            records.append(data)

        records.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return records[:limit]

    def update_user_role(self, admin_user_id: str, target_user_id: str, new_role: str) -> Dict[str, Any]:
        """Update a user's role (e.g. promote farmer to admin)."""
        self._verify_admin(admin_user_id)

        if new_role not in ("farmer", "admin"):
            raise ValueError("Invalid role. Must be 'farmer' or 'admin'")

        doc_ref = self.db.collection(USERS_COLLECTION).document(target_user_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise NotFoundException(resource="User", resource_id=target_user_id)

        doc_ref.update({
            "role": new_role,
            "updated_at": utc_now_iso(),
        })

        return {
            "message": f"User role updated to '{new_role}'",
            "uid": target_user_id,
            "role": new_role,
        }
