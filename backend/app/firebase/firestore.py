"""
YieldSense AI  -  Firestore Database Client

Provides Firestore client and collection name constants.
"""

from firebase_admin import firestore
from google.cloud.firestore_v1 import Client as FirestoreClient


# ============================================================
# Collection Name Constants
# ============================================================
USERS_COLLECTION = "users"
FARMS_COLLECTION = "farms"
CROPS_COLLECTION = "crops"
NOTIFICATIONS_COLLECTION = "notifications"
PREDICTION_HISTORY_COLLECTION = "prediction_history"
REPORTS_COLLECTION = "reports"

# Analytics and Advisory Collections
RECOMMENDATIONS_COLLECTION = "recommendations"
RISK_ASSESSMENTS_COLLECTION = "risk_assessments"
ANALYTICS_COLLECTION = "analytics"



_firestore_client: FirestoreClient | None = None


def get_firestore_client() -> FirestoreClient:
    """
    Get the Firestore client instance (singleton).

    Returns:
        Firestore client for database operations.
    """
    global _firestore_client

    if _firestore_client is None:
        _firestore_client = firestore.client()

    return _firestore_client
