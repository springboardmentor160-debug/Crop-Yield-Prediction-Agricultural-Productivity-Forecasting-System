import math

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.database import get_db
from app.models.agriculture import (
    HistoricalCropYield,
    StateSoilReference,
    StateWeatherReference,
)
from app.models.user import User
from app.schemas.dataset import (
    DatasetImportResponse,
    FarmReferenceOptionsResponse,
    HistoricalCropYieldResponse,
    HistoricalYieldSummaryResponse,
    SoilSummaryResponse,
    StateSoilResponse,
    StateWeatherResponse,
    WeatherSummaryResponse,
)
from app.services.dataset_import_service import (
    DatasetImportException,
    import_historical_crop_yield,
    import_state_soil,
    import_state_weather,
)

router = APIRouter(
    prefix="/api/datasets",
    tags=["Dataset Management"],
)
IRRIGATION_TYPES = [
    "Rainfed",
    "Canal",
    "Drip",
    "Sprinkler",
    "Borewell",
    "Well",
    "Tank",
    "Other",
]


def build_options(values: list[str]) -> list[dict[str, str]]:
    return [
        {
            "value": value,
            "label": value,
        }
        for value in values
    ]

def validate_csv_upload(file: UploadFile) -> None:
    filename = file.filename or ""

    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported.",
        )

@router.get(
    "/farm-options",
    response_model=FarmReferenceOptionsResponse,
)
def get_farm_reference_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    state_rows = (
        db.query(StateSoilReference.state)
        .filter(StateSoilReference.state.isnot(None))
        .distinct()
        .all()
    )

    crop_rows = (
        db.query(HistoricalCropYield.crop)
        .filter(HistoricalCropYield.crop.isnot(None))
        .distinct()
        .all()
    )

    season_rows = (
        db.query(HistoricalCropYield.season)
        .filter(HistoricalCropYield.season.isnot(None))
        .distinct()
        .all()
    )

    states = sorted(
        {
            row[0].strip()
            for row in state_rows
            if row[0] and row[0].strip()
        },
        key=str.casefold,
    )

    crops = sorted(
        {
            row[0].strip()
            for row in crop_rows
            if row[0] and row[0].strip()
        },
        key=str.casefold,
    )

    seasons = sorted(
        {
            row[0].strip()
            for row in season_rows
            if row[0] and row[0].strip()
        },
        key=str.casefold,
    )
    return {
        "states": build_options(states),
        "crops": build_options(crops),
        "seasons": build_options(seasons),
        "irrigation_types": build_options(
            IRRIGATION_TYPES
        ),
    }

@router.post(
    "/historical-yield/import",
    response_model=DatasetImportResponse,
)
async def import_historical_yield_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    validate_csv_upload(file)

    try:
        file_content = await file.read()

        return import_historical_crop_yield(
            db=db,
            file_content=file_content,
        )

    except DatasetImportException as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    finally:
        await file.close()


@router.post(
    "/soil/import",
    response_model=DatasetImportResponse,
)
async def import_soil_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    validate_csv_upload(file)

    try:
        file_content = await file.read()

        return import_state_soil(
            db=db,
            file_content=file_content,
        )

    except DatasetImportException as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    finally:
        await file.close()


@router.post(
    "/weather/import",
    response_model=DatasetImportResponse,
)
async def import_weather_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    validate_csv_upload(file)

    try:
        file_content = await file.read()

        return import_state_weather(
            db=db,
            file_content=file_content,
        )

    except DatasetImportException as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    finally:
        await file.close()

@router.get("/historical-yield")
def get_historical_yield_records(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    state: str | None = Query(default=None),
    crop: str | None = Query(default=None),
    season: str | None = Query(default=None),
    year: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(HistoricalCropYield)

    if state:
        query = query.filter(
            func.lower(HistoricalCropYield.state)
            == state.strip().lower()
        )

    if crop:
        query = query.filter(
            func.lower(HistoricalCropYield.crop)
            == crop.strip().lower()
        )

    if season:
        query = query.filter(
            func.lower(HistoricalCropYield.season)
            == season.strip().lower()
        )

    if year is not None:
        query = query.filter(
            HistoricalCropYield.crop_year == year
        )

    total = query.count()

    records = (
        query.order_by(
            HistoricalCropYield.crop_year.desc(),
            HistoricalCropYield.state.asc(),
            HistoricalCropYield.crop.asc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 0,
        "items": [
            HistoricalCropYieldResponse.model_validate(record)
            for record in records
        ],
    }
@router.get("/soil")
def get_soil_records(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    state: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(StateSoilReference)

    if state:
        query = query.filter(
            func.lower(StateSoilReference.state)
            == state.strip().lower()
        )

    total = query.count()

    records = (
        query.order_by(StateSoilReference.state.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 0,
        "items": [
            StateSoilResponse.model_validate(record)
            for record in records
        ],
    }
@router.get("/weather")
def get_weather_records(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    state: str | None = Query(default=None),
    year: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(StateWeatherReference)

    if state:
        query = query.filter(
            func.lower(StateWeatherReference.state)
            == state.strip().lower()
        )

    if year is not None:
        query = query.filter(
            StateWeatherReference.year == year
        )

    total = query.count()

    records = (
        query.order_by(
            StateWeatherReference.year.desc(),
            StateWeatherReference.state.asc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 0,
        "items": [
            StateWeatherResponse.model_validate(record)
            for record in records
        ],
    }
@router.get(
    "/historical-yield/summary",
    response_model=HistoricalYieldSummaryResponse,
)
def get_historical_yield_summary(
    state: str | None = Query(default=None),
    crop: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(HistoricalCropYield)

    if state:
        query = query.filter(
            func.lower(HistoricalCropYield.state)
            == state.strip().lower()
        )

    if crop:
        query = query.filter(
            func.lower(HistoricalCropYield.crop)
            == crop.strip().lower()
        )

    result = query.with_entities(
        func.count(HistoricalCropYield.id),
        func.count(func.distinct(HistoricalCropYield.crop)),
        func.count(func.distinct(HistoricalCropYield.state)),
        func.min(HistoricalCropYield.crop_year),
        func.max(HistoricalCropYield.crop_year),
        func.avg(HistoricalCropYield.yield_value),
        func.sum(HistoricalCropYield.area),
        func.sum(HistoricalCropYield.production),
    ).first()

    return {
        "total_records": result[0] or 0,
        "total_crops": result[1] or 0,
        "total_states": result[2] or 0,
        "minimum_year": result[3],
        "maximum_year": result[4],
        "average_yield": (
            round(float(result[5]), 4)
            if result[5] is not None
            else None
        ),
        "total_area": (
            round(float(result[6]), 4)
            if result[6] is not None
            else None
        ),
        "total_production": (
            round(float(result[7]), 4)
            if result[7] is not None
            else None
        ),
    }
@router.get(
    "/soil/summary",
    response_model=SoilSummaryResponse,
)
def get_soil_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.query(
        func.count(StateSoilReference.id),
        func.avg(StateSoilReference.nitrogen),
        func.avg(StateSoilReference.phosphorus),
        func.avg(StateSoilReference.potassium),
        func.avg(StateSoilReference.ph),
    ).first()

    return {
        "total_states": result[0] or 0,
        "average_nitrogen": (
            round(float(result[1]), 4)
            if result[1] is not None
            else None
        ),
        "average_phosphorus": (
            round(float(result[2]), 4)
            if result[2] is not None
            else None
        ),
        "average_potassium": (
            round(float(result[3]), 4)
            if result[3] is not None
            else None
        ),
        "average_ph": (
            round(float(result[4]), 4)
            if result[4] is not None
            else None
        ),
    }
@router.get(
    "/weather/summary",
    response_model=WeatherSummaryResponse,
)
def get_weather_summary(
    state: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(StateWeatherReference)

    if state:
        query = query.filter(
            func.lower(StateWeatherReference.state)
            == state.strip().lower()
        )

    result = query.with_entities(
        func.count(StateWeatherReference.id),
        func.count(func.distinct(StateWeatherReference.state)),
        func.min(StateWeatherReference.year),
        func.max(StateWeatherReference.year),
        func.avg(StateWeatherReference.avg_temp_c),
        func.avg(StateWeatherReference.total_rainfall_mm),
        func.avg(StateWeatherReference.avg_humidity_percent),
    ).first()

    return {
        "total_records": result[0] or 0,
        "total_states": result[1] or 0,
        "minimum_year": result[2],
        "maximum_year": result[3],
        "average_temperature_c": (
            round(float(result[4]), 4)
            if result[4] is not None
            else None
        ),
        "average_rainfall_mm": (
            round(float(result[5]), 4)
            if result[5] is not None
            else None
        ),
        "average_humidity_percent": (
            round(float(result[6]), 4)
            if result[6] is not None
            else None
        ),
    }