"""
Row-level access control.

FARMER / COOPERATIVE_MANAGER see only farms they own.
AGRI_CONSULTANT / GOV_OFFICIAL / ADMIN have read access across all farms
(consistent with them advising or overseeing many farms), but only ADMIN
can delete another user's records.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.farm import Farm
from app.models.user import User, UserRole

ELEVATED_READ_ROLES = {UserRole.AGRI_CONSULTANT, UserRole.GOV_OFFICIAL, UserRole.ADMIN}


def visible_farm_ids(db: Session, user: User) -> list[int] | None:
    """Return None to signal 'all farms visible', else a list of allowed IDs."""
    if user.role in ELEVATED_READ_ROLES:
        return None
    rows = db.query(Farm.id).filter(Farm.owner_id == user.id).all()
    return [r[0] for r in rows]


def assert_can_access_farm(db: Session, user: User, farm: Farm) -> None:
    if user.role in ELEVATED_READ_ROLES:
        return
    if farm.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this farm")


def assert_can_modify_farm(user: User, farm: Farm) -> None:
    if user.role == UserRole.ADMIN:
        return
    if farm.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the farm owner or an admin can modify this record")
