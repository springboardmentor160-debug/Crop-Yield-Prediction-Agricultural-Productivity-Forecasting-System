from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.weather_analysis import (
    WeatherAnalysisOptionsResponse,
    WeatherAnalysisResponse,
)
from app.services.weather_analysis_service import (
    analyze_weather,
    get_weather_analysis_options,
)

router = APIRouter(
    prefix="/api/weather-analysis",
    tags=["Weather Analysis"],
)


@router.get(
    "/options",
    response_model=WeatherAnalysisOptionsResponse,
    status_code=status.HTTP_200_OK,
)
def read_weather_analysis_options(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> WeatherAnalysisOptionsResponse:
    """
    Return the available states and years from the
    imported state weather reference dataset.

    This endpoint is used to populate the weather
    analysis filters on web and mobile.
    """

    return get_weather_analysis_options(db)


@router.get(
    "",
    response_model=WeatherAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
def read_weather_analysis(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    state_name: Annotated[
        str,
        Query(
            alias="state",
            min_length=2,
            max_length=120,
            description=(
                "State whose historical weather data "
                "should be analyzed."
            ),
        ),
    ],
    start_year: Annotated[
        int,
        Query(
            ge=1900,
            le=2100,
            description="First year of the analysis period.",
        ),
    ],
    end_year: Annotated[
        int,
        Query(
            ge=1900,
            le=2100,
            description="Last year of the analysis period.",
        ),
    ],
) -> WeatherAnalysisResponse:
    """
    Analyze temperature, rainfall and humidity for a
    selected state and year range.

    The response contains:

    - Summary statistics
    - Weather trends
    - Agricultural risk assessment
    - Year-by-year records for frontend charts
    """

    if start_year > end_year:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "start_year must be less than or equal "
                "to end_year."
            ),
        )

    return analyze_weather(
        db=db,
        state=state_name,
        start_year=start_year,
        end_year=end_year,
    )