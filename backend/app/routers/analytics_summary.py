from fastapi import APIRouter, Depends

from app.auth_handler import get_current_user
from app.db import fetch_all, fetch_one

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["sub"])
    is_privileged = current_user.get("role") in {"Admin", "Agriculture Expert"}
    farm_filter, params = ("", ()) if is_privileged else (" WHERE user_id = ?", (user_id,))
    totals = {
        "farms": fetch_one(f"SELECT COUNT(*) AS count FROM farms{farm_filter}", params)["count"],
        "predictions": fetch_one(
            "SELECT COUNT(*) AS count FROM prediction_logs" + ("" if is_privileged else " WHERE user_id = ?"), params
        )["count"],
    }
    owner_filter = "" if is_privileged else " WHERE f.user_id = ?"
    totals["crops"] = fetch_one(
        "SELECT COUNT(*) AS count FROM crop_records cr JOIN farms f ON f.id = cr.farm_id" + owner_filter, params
    )["count"]
    totals["soil_records"] = fetch_one(
        "SELECT COUNT(*) AS count FROM soil_records sr JOIN farms f ON f.id = sr.farm_id" + owner_filter, params
    )["count"]
    average_yield = fetch_one(
        "SELECT AVG(predicted_yield) AS value FROM prediction_logs" + ("" if is_privileged else " WHERE user_id = ?"), params
    )["value"]
    return {"totals": totals, "average_predicted_yield": round(average_yield or 0, 2)}


@router.get("/yield-trend")
def get_yield_trend(current_user: dict = Depends(get_current_user)):
    is_privileged = current_user.get("role") in {"Admin", "Agriculture Expert"}
    query = """
        SELECT hr.year, ROUND(AVG(hr.yield_amount), 2) AS average_yield
        FROM historical_farming_records hr
        JOIN farms f ON f.id = hr.farm_id
    """
    params = () if is_privileged else (int(current_user["sub"]),)
    if not is_privileged:
        query += " WHERE f.user_id = ?"
    query += " GROUP BY hr.year ORDER BY hr.year"
    return fetch_all(query, params)
