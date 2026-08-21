from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Query, Session

from app.models.farm import Farm
from app.models.prediction import YieldPrediction
from app.models.user import User


def get_user_role(current_user: User) -> str:
    role = getattr(current_user, "role", None)

    if isinstance(role, str):
        role_name = role.strip().lower()
    else:
        role_name = getattr(role, "name", "")
        role_name = (
            role_name.strip().lower()
            if isinstance(role_name, str)
            else ""
        )

    if role_name not in {"admin", "farmer"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This role is not allowed to access analytics.",
        )

    return role_name


def apply_prediction_access_filter(
    query: Query,
    current_user: User,
) -> Query:
    """
    Admin users can view analytics for all predictions.

    Farmer users can view analytics only for predictions
    generated from their own account.
    """

    if get_user_role(current_user) == "admin":
        return query

    return query.filter(
        YieldPrediction.user_id
        == current_user.id
    )


def apply_farm_access_filter(
    query: Query,
    current_user: User,
) -> Query:
    """
    Admin users can view all farms.

    Farmer users can view only farms owned by them.
    """

    if get_user_role(current_user) == "admin":
        return query

    return query.filter(
        Farm.owner_id == current_user.id
    )


def safe_float(value) -> float:
    if value is None:
        return 0.0

    return round(float(value), 2)


def get_analytics_summary(
    db: Session,
    current_user: User,
) -> dict:
    prediction_query = apply_prediction_access_filter(
        db.query(YieldPrediction),
        current_user,
    )

    total_predictions = (
        prediction_query.count()
    )

    average_values_query = (
        db.query(
            func.avg(
                YieldPrediction.predicted_yield
            ).label(
                "average_predicted_yield"
            ),
            func.avg(
                YieldPrediction.estimated_production
            ).label(
                "average_estimated_production"
            ),
        )
    )

    average_values_query = (
        apply_prediction_access_filter(
            average_values_query,
            current_user,
        )
    )

    average_values = (
        average_values_query.first()
    )

    active_farms_query = (
        db.query(func.count(Farm.id))
        .filter(Farm.is_active.is_(True))
    )

    active_farms_query = (
        apply_farm_access_filter(
            active_farms_query,
            current_user,
        )
    )

    active_farms = (
        active_farms_query.scalar() or 0
    )

    return {
        "total_predictions": total_predictions,
        "active_farms": active_farms,
        "average_predicted_yield": safe_float(
            average_values.average_predicted_yield
        ),
        "average_estimated_production": safe_float(
            average_values.average_estimated_production
        ),
    }


def get_crop_analytics(
    db: Session,
    current_user: User,
    limit: int = 10,
) -> list[dict]:
    query = (
        db.query(
            YieldPrediction.crop.label("crop"),
            func.count(
                YieldPrediction.id
            ).label("prediction_count"),
            func.avg(
                YieldPrediction.predicted_yield
            ).label("average_yield"),
        )
    )

    query = apply_prediction_access_filter(
        query,
        current_user,
    )

    rows = (
        query
        .group_by(YieldPrediction.crop)
        .order_by(
            func.count(
                YieldPrediction.id
            ).desc(),
            YieldPrediction.crop.asc(),
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "crop": row.crop,
            "prediction_count": (
                row.prediction_count
            ),
            "average_yield": safe_float(
                row.average_yield
            ),
        }
        for row in rows
    ]


def get_season_analytics(
    db: Session,
    current_user: User,
) -> list[dict]:
    query = (
        db.query(
            YieldPrediction.season.label(
                "season"
            ),
            func.count(
                YieldPrediction.id
            ).label("prediction_count"),
            func.avg(
                YieldPrediction.predicted_yield
            ).label("average_yield"),
        )
    )

    query = apply_prediction_access_filter(
        query,
        current_user,
    )

    rows = (
        query
        .group_by(YieldPrediction.season)
        .order_by(
            func.avg(
                YieldPrediction.predicted_yield
            ).desc(),
            YieldPrediction.season.asc(),
        )
        .all()
    )

    return [
        {
            "season": row.season,
            "prediction_count": (
                row.prediction_count
            ),
            "average_yield": safe_float(
                row.average_yield
            ),
        }
        for row in rows
    ]


def get_state_analytics(
    db: Session,
    current_user: User,
    limit: int = 10,
) -> list[dict]:
    query = (
        db.query(
            YieldPrediction.state.label("state"),
            func.count(
                YieldPrediction.id
            ).label("prediction_count"),
            func.avg(
                YieldPrediction.predicted_yield
            ).label("average_yield"),
        )
    )

    query = apply_prediction_access_filter(
        query,
        current_user,
    )

    rows = (
        query
        .group_by(YieldPrediction.state)
        .order_by(
            func.avg(
                YieldPrediction.predicted_yield
            ).desc(),
            YieldPrediction.state.asc(),
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "state": row.state,
            "prediction_count": (
                row.prediction_count
            ),
            "average_yield": safe_float(
                row.average_yield
            ),
        }
        for row in rows
    ]


def get_recent_predictions(
    db: Session,
    current_user: User,
    limit: int = 5,
) -> list[dict]:
    query = db.query(YieldPrediction)

    query = apply_prediction_access_filter(
        query,
        current_user,
    )

    predictions = (
        query
        .order_by(
            YieldPrediction.created_at.desc(),
            YieldPrediction.id.desc(),
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "id": prediction.id,
            "farm_name": (
                prediction.farm_name
            ),
            "crop": prediction.crop,
            "season": prediction.season,
            "crop_year": (
                prediction.crop_year
            ),
            "predicted_yield": safe_float(
                prediction.predicted_yield
            ),
            "estimated_production": safe_float(
                prediction.estimated_production
            ),
        }
        for prediction in predictions
    ]


def get_analytics_dashboard(
    db: Session,
    current_user: User,
) -> dict:
    return {
        "summary": get_analytics_summary(
            db=db,
            current_user=current_user,
        ),
        "crops": get_crop_analytics(
            db=db,
            current_user=current_user,
        ),
        "seasons": get_season_analytics(
            db=db,
            current_user=current_user,
        ),
        "states": get_state_analytics(
            db=db,
            current_user=current_user,
        ),
        "recent_predictions": (
            get_recent_predictions(
                db=db,
                current_user=current_user,
            )
        ),
    }