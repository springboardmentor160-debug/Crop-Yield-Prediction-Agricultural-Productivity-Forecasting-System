from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.soil_analysis import (
    SoilAnalysisOptionsResponse,
    SoilAnalysisResponse,
)
from app.services.soil_analysis_service import (
    analyze_soil,
    get_soil_analysis_options,
)

router = APIRouter(
    prefix="/api/soil-analysis",
    tags=["Soil Analysis"],
)


@router.get(
    "/options",
    response_model=SoilAnalysisOptionsResponse,
    status_code=status.HTTP_200_OK,
)
def read_soil_analysis_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SoilAnalysisOptionsResponse:
    return get_soil_analysis_options(db)


@router.get(
    "",
    response_model=SoilAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
def read_soil_analysis(
    state: str = Query(
        ...,
        min_length=1,
        description="State for which soil data should be analyzed.",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SoilAnalysisResponse:
    normalized_state = state.strip()

    if not normalized_state:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="State is required.",
        )

    try:
        return analyze_soil(
            db=db,
            state=normalized_state,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error