import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.database import get_db
from app.models.farm import Farm
from app.models.user import User
from app.schemas.farm import (
    FarmCreateRequest,
    FarmResponse,
    FarmSummaryResponse,
    FarmUpdateRequest,
)
from app.services.farm_service import (
    get_accessible_farm,
    normalize_optional_text,
    normalize_required_text,
)

router = APIRouter(
    prefix="/api/farms",
    tags=["Farm Management"],
)

@router.post(
    "",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_farm(
    request: FarmCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.name != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can create farm records",
        )
    
    farm_name = normalize_required_text(request.farm_name)
    state_name = normalize_required_text(request.state)
    district_name = normalize_required_text(request.district)

    existing_farm = (
        db.query(Farm)
        .filter(
            Farm.owner_id == current_user.id,
            func.lower(Farm.farm_name) == farm_name.lower(),
            func.lower(Farm.state) == state_name.lower(),
            func.lower(Farm.district) == district_name.lower(),
            Farm.is_active.is_(True),
        )
        .first()
    )

    if existing_farm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "An active farm with the same name, state, "
                "and district already exists"
            ),
        )

    farm = Farm(
        owner_id=current_user.id,
        farm_name=farm_name,
        state=state_name,
        district=district_name,
        village=normalize_optional_text(request.village),
        area_hectares=request.area_hectares,
        soil_type=normalize_optional_text(request.soil_type),
        primary_crop=normalize_optional_text(request.primary_crop),
        irrigation_type=normalize_optional_text(
            request.irrigation_type
        ),
        latitude=request.latitude,
        longitude=request.longitude,
        is_active=True,
    )

    db.add(farm)
    db.commit()
    db.refresh(farm)

    return farm

@router.get("")
def list_farms(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    primary_crop: str | None = Query(default=None),
    is_active: bool | None = Query(default=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Farm)

    if current_user.role.name != "admin":
        query = query.filter(Farm.owner_id == current_user.id)

    if state:
        query = query.filter(
            func.lower(Farm.state) == state.strip().lower()
        )

    if district:
        query = query.filter(
            func.lower(Farm.district) == district.strip().lower()
        )

    if primary_crop:
        query = query.filter(
            func.lower(Farm.primary_crop)
            == primary_crop.strip().lower()
        )

    if is_active is not None:
        query = query.filter(Farm.is_active == is_active)

    total = query.count()

    farms = (
        query.order_by(
            Farm.created_at.desc(),
            Farm.farm_name.asc(),
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
            FarmResponse.model_validate(farm)
            for farm in farms
        ],
    }
@router.get(
    "/admin/all",
)
def admin_list_all_farms(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    owner_email: str | None = Query(default=None),
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    primary_crop: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    query = (
        db.query(Farm, User)
        .join(User, Farm.owner_id == User.id)
    )

    if owner_email:
        query = query.filter(
            func.lower(User.email)
            == owner_email.strip().lower()
        )

    if state:
        query = query.filter(
            func.lower(Farm.state)
            == state.strip().lower()
        )

    if district:
        query = query.filter(
            func.lower(Farm.district)
            == district.strip().lower()
        )

    if primary_crop:
        query = query.filter(
            func.lower(Farm.primary_crop)
            == primary_crop.strip().lower()
        )

    if is_active is not None:
        query = query.filter(Farm.is_active == is_active)

    total = query.count()

    results = (
        query.order_by(
            Farm.created_at.desc(),
            Farm.farm_name.asc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = []

    for farm, owner in results:
        items.append(
            {
                "id": farm.id,
                "owner_id": farm.owner_id,
                "owner_name": owner.full_name,
                "owner_email": owner.email,
                "farm_name": farm.farm_name,
                "state": farm.state,
                "district": farm.district,
                "village": farm.village,
                "area_hectares": farm.area_hectares,
                "soil_type": farm.soil_type,
                "primary_crop": farm.primary_crop,
                "irrigation_type": farm.irrigation_type,
                "latitude": farm.latitude,
                "longitude": farm.longitude,
                "is_active": farm.is_active,
                "created_at": farm.created_at,
                "updated_at": farm.updated_at,
            }
        )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 0,
        "items": items,
    }

@router.get(
    "/summary",
    response_model=FarmSummaryResponse,
)
def get_farm_summary(
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    primary_crop: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Farm)

    # Farmer sees only their own farm summary.
    # Admin sees summary for all farms.
    if current_user.role.name != "admin":
        query = query.filter(Farm.owner_id == current_user.id)

    if state:
        query = query.filter(
            func.lower(Farm.state) == state.strip().lower()
        )

    if district:
        query = query.filter(
            func.lower(Farm.district) == district.strip().lower()
        )

    if primary_crop:
        query = query.filter(
            func.lower(Farm.primary_crop)
            == primary_crop.strip().lower()
        )

    result = query.with_entities(
        func.count(Farm.id),
        func.count(
            func.distinct(
                func.lower(Farm.state)
            )
        ),
        func.count(
            func.distinct(
                func.lower(Farm.district)
            )
        ),
        func.coalesce(
            func.sum(Farm.area_hectares),
            0,
        ),
        func.count(
            Farm.id
        ).filter(Farm.is_active.is_(True)),
        func.count(
            Farm.id
        ).filter(Farm.is_active.is_(False)),
    ).first()

    return {
        "total_farms": result[0] or 0,
        "total_states": result[1] or 0,
        "total_districts": result[2] or 0,
        "total_area_hectares": round(
            float(result[3] or 0),
            4,
        ),
        "active_farms": result[4] or 0,
        "inactive_farms": result[5] or 0,
    }

@router.get(
    "/{farm_id}",
    response_model=FarmResponse,
)
def get_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farm = get_accessible_farm(
        db=db,
        farm_id=farm_id,
        current_user=current_user,
    )

    return farm

@router.put(
    "/{farm_id}",
    response_model=FarmResponse,
)
def update_farm(
    farm_id: int,
    request: FarmUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farm = get_accessible_farm(
        db=db,
        farm_id=farm_id,
        current_user=current_user,
    )

    update_data = request.model_dump(exclude_unset=True)

    if "farm_name" in update_data:
        farm.farm_name = normalize_required_text(
            update_data["farm_name"]
        )

    if "state" in update_data:
        farm.state = normalize_required_text(
            update_data["state"]
        )

    if "district" in update_data:
        farm.district = normalize_required_text(
            update_data["district"]
        )

    optional_text_fields = [
        "village",
        "soil_type",
        "primary_crop",
        "irrigation_type",
    ]

    for field_name in optional_text_fields:
        if field_name in update_data:
            setattr(
                farm,
                field_name,
                normalize_optional_text(update_data[field_name]),
            )

    numeric_fields = [
        "area_hectares",
        "latitude",
        "longitude",
    ]

    for field_name in numeric_fields:
        if field_name in update_data:
            setattr(
                farm,
                field_name,
                update_data[field_name],
            )

    duplicate_query = db.query(Farm).filter(
        Farm.owner_id == farm.owner_id,
        Farm.id != farm.id,
        func.lower(Farm.farm_name) == farm.farm_name.lower(),
        func.lower(Farm.state) == farm.state.lower(),
        func.lower(Farm.district) == farm.district.lower(),
        Farm.is_active.is_(True),
    )

    if duplicate_query.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Another active farm with the same name, state, "
                "and district already exists"
            ),
        )

    db.commit()
    db.refresh(farm)

    return farm

@router.patch(
    "/{farm_id}/deactivate",
    response_model=FarmResponse,
)
def deactivate_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farm = get_accessible_farm(
        db=db,
        farm_id=farm_id,
        current_user=current_user,
    )

    if not farm.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farm is already inactive",
        )

    farm.is_active = False

    db.commit()
    db.refresh(farm)

    return farm

@router.patch(
    "/{farm_id}/reactivate",
    response_model=FarmResponse,
)
def reactivate_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farm = get_accessible_farm(
        db=db,
        farm_id=farm_id,
        current_user=current_user,
    )

    if farm.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farm is already active",
        )

    duplicate_active_farm = (
        db.query(Farm)
        .filter(
            Farm.owner_id == farm.owner_id,
            Farm.id != farm.id,
            func.lower(Farm.farm_name)
            == farm.farm_name.lower(),
            func.lower(Farm.state)
            == farm.state.lower(),
            func.lower(Farm.district)
            == farm.district.lower(),
            Farm.is_active.is_(True),
        )
        .first()
    )

    if duplicate_active_farm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Cannot reactivate this farm because another active "
                "farm with the same name and location exists"
            ),
        )

    farm.is_active = True

    db.commit()
    db.refresh(farm)

    return farm

@router.delete(
    "/{farm_id}",
    response_model=FarmResponse,
)
def delete_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    farm = get_accessible_farm(
        db=db,
        farm_id=farm_id,
        current_user=current_user,
    )

    if not farm.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farm is already inactive",
        )

    farm.is_active = False

    db.commit()
    db.refresh(farm)

    return farm


