"""
YieldSense AI  -  Farm Service

Business logic for farm CRUD operations.
"""

import math
from typing import Tuple, List

from app.firebase.firestore import get_firestore_client, FARMS_COLLECTION
from app.models.farm import Farm
from app.utils.exceptions import NotFoundException, ForbiddenException
from app.utils.helpers import utc_now_iso


class FarmService:
    """Handles farm CRUD business logic."""

    def __init__(self):
        self.db = get_firestore_client()

    def create_farm(self, user_id: str, farm_data: dict) -> dict:
        """
        Create a new farm in Firestore.

        Args:
            user_id: Owner's Firebase UID.
            farm_data: Farm field values.

        Returns:
            Created farm dictionary with generated ID.
        """
        farm = Farm(
            user_id=user_id,
            name=farm_data["name"],
            location=farm_data["location"],
            latitude=farm_data["latitude"],
            longitude=farm_data["longitude"],
            area=farm_data["area"],
            crop=farm_data["crop"],
            soil_ph=farm_data["soil_ph"],
            nitrogen=farm_data["nitrogen"],
            phosphorus=farm_data["phosphorus"],
            potassium=farm_data["potassium"],
        )

        doc_ref = self.db.collection(FARMS_COLLECTION).add(farm.to_dict())
        # .add() returns a tuple of (timestamp, document_reference)
        farm_id = doc_ref[1].id

        result = farm.to_dict()
        result["id"] = farm_id
        return result

    def get_farms(self, user_id: str, page: int = 1, limit: int = 10) -> Tuple[List[dict], int]:
        """
        Get paginated farms for a user.

        Args:
            user_id: Owner's Firebase UID.
            page: Page number (1-indexed).
            limit: Items per page.

        Returns:
            Tuple of (list of farm dicts, total count).
        """
        # Get total count
        query = (
            self.db.collection(FARMS_COLLECTION)
            .where("user_id", "==", user_id)
            .where("is_deleted", "==", False)
        )

        all_docs = list(query.stream())
        total = len(all_docs)

        # Apply pagination
        offset = (page - 1) * limit
        paginated_docs = all_docs[offset : offset + limit]

        farms = []
        for doc in paginated_docs:
            data = doc.to_dict()
            data["id"] = doc.id
            farms.append(data)

        return farms, total

    def get_farm(self, farm_id: str, user_id: str) -> dict:
        """
        Get a single farm by ID with ownership validation.

        Args:
            farm_id: Farm document ID.
            user_id: Requesting user's Firebase UID.

        Returns:
            Farm dictionary.
        """
        doc = self.db.collection(FARMS_COLLECTION).document(farm_id).get()

        if not doc.exists:
            raise NotFoundException(resource="Farm", resource_id=farm_id)

        data = doc.to_dict()

        if data.get("is_deleted", False):
            raise NotFoundException(resource="Farm", resource_id=farm_id)

        if data.get("user_id") != user_id:
            raise ForbiddenException(detail="You do not have access to this farm")

        data["id"] = doc.id
        return data

    def update_farm(self, farm_id: str, user_id: str, update_data: dict) -> dict:
        """
        Update a farm with ownership validation.

        Args:
            farm_id: Farm document ID.
            user_id: Requesting user's Firebase UID.
            update_data: Dictionary of fields to update.

        Returns:
            Updated farm dictionary.
        """
        # Verify ownership
        self.get_farm(farm_id, user_id)

        # Filter out None values and add timestamp
        filtered_data = {k: v for k, v in update_data.items() if v is not None}
        filtered_data["updated_at"] = utc_now_iso()

        doc_ref = self.db.collection(FARMS_COLLECTION).document(farm_id)
        doc_ref.update(filtered_data)

        return self.get_farm(farm_id, user_id)

    def delete_farm(self, farm_id: str, user_id: str) -> dict:
        """
        Soft-delete a farm (sets is_deleted=True).

        Args:
            farm_id: Farm document ID.
            user_id: Requesting user's Firebase UID.

        Returns:
            Success message.
        """
        # Verify ownership
        self.get_farm(farm_id, user_id)

        doc_ref = self.db.collection(FARMS_COLLECTION).document(farm_id)
        doc_ref.update({
            "is_deleted": True,
            "updated_at": utc_now_iso(),
        })

        return {"message": "Farm deleted successfully", "id": farm_id}

    def get_farm_stats(self, user_id: str) -> dict:
        """
        Get aggregate farm statistics for a user.

        Args:
            user_id: Owner's Firebase UID.

        Returns:
            Dictionary with farm statistics.
        """
        query = (
            self.db.collection(FARMS_COLLECTION)
            .where("user_id", "==", user_id)
            .where("is_deleted", "==", False)
        )

        docs = list(query.stream())

        total_farms = len(docs)
        total_area = 0.0
        crops = set()

        for doc in docs:
            data = doc.to_dict()
            total_area += data.get("area", 0.0)
            crop = data.get("crop", "")
            if crop:
                crops.add(crop)

        return {
            "total_farms": total_farms,
            "total_area": round(total_area, 2),
            "unique_crops": len(crops),
            "crop_list": sorted(list(crops)),
        }
