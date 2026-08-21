"""
YieldSense AI  -  Utility Helpers

Shared utility functions used across the application.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional


def utc_now() -> datetime:
    """Get the current UTC timestamp."""
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    """Get the current UTC timestamp as an ISO 8601 string."""
    return utc_now().isoformat()


def firestore_doc_to_dict(doc) -> Optional[Dict[str, Any]]:
    """
    Convert a Firestore document snapshot to a dictionary with the document ID included.

    Args:
        doc: Firestore DocumentSnapshot.

    Returns:
        Dictionary with document data and 'id' field, or None if document doesn't exist.
    """
    if not doc.exists:
        return None

    data = doc.to_dict()
    data["id"] = doc.id
    return data


def sanitize_string(value: str) -> str:
    """Sanitize a string by stripping whitespace and removing excessive spaces."""
    return " ".join(value.strip().split())


def paginate_query(query, page: int = 1, limit: int = 10):
    """
    Apply pagination to a Firestore query.

    Args:
        query: Firestore query object.
        page: Page number (1-indexed).
        limit: Number of items per page.

    Returns:
        Modified query with offset and limit applied.
    """
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit)
