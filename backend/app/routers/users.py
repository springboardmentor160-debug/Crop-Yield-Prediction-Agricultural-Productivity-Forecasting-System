from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserOut)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_profile(
    update_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if "full_name" in update_data:
        current_user.full_name = update_data["full_name"]
    db.commit()
    db.refresh(current_user)
    return current_user