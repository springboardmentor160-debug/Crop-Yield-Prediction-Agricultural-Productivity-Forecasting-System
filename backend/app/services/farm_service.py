from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.farm import Farm
from app.models.user import User


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = " ".join(value.strip().split())

    return cleaned or None


def normalize_required_text(value: str) -> str:
    return " ".join(value.strip().split())


def get_farm_or_404(
    db: Session,
    farm_id: int,
) -> Farm:
    farm = (
        db.query(Farm)
        .filter(Farm.id == farm_id)
        .first()
    )

    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )

    return farm


def ensure_farm_access(
    farm: Farm,
    current_user: User,
) -> Farm:
    is_admin = current_user.role.name == "admin"
    is_owner = farm.owner_id == current_user.id

    if not is_admin and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this farm",
        )

    return farm


def get_accessible_farm(
    db: Session,
    farm_id: int,
    current_user: User,
) -> Farm:
    farm = get_farm_or_404(db, farm_id)

    return ensure_farm_access(
        farm=farm,
        current_user=current_user,
    )