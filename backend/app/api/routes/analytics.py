from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsDashboardResponse,
)
from app.services.analytics_service import (
    get_analytics_dashboard,
)

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics Dashboard"],
)


@router.get(
    "/dashboard",
    response_model=AnalyticsDashboardResponse,
)
def read_analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_analytics_dashboard(
        db=db,
        current_user=current_user,
    )