from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import pandas as pd
import io
from app.db import fetch_all, fetch_one
from app.auth_handler import get_current_user

router = APIRouter(prefix="/api/v1/reports", tags=["Reports & Export"])


def _owned_farm(farm_id: int, current_user: dict) -> dict:
    farm = fetch_one("SELECT * FROM farms WHERE id = ?", (farm_id,))
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm["user_id"] != int(current_user["sub"]) and current_user.get("role") not in {"Admin", "Agriculture Expert"}:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
    return farm

@router.get("/export-csv")
def export_prediction_logs_csv(current_user: dict = Depends(get_current_user)):
    try:
        user_id = int(current_user["sub"])
        
        # Admins can see all logs, farmers see their own logs
        if current_user.get("role") == "Admin":
            query = "SELECT id, user_id, crop_name, avg_temp, rainfall, soil_ph, nitrogen, phosphorus, potassium, predicted_yield, confidence_score, created_at FROM prediction_logs ORDER BY created_at DESC"
            params = ()
        else:
            query = "SELECT id, user_id, crop_name, avg_temp, rainfall, soil_ph, nitrogen, phosphorus, potassium, predicted_yield, confidence_score, created_at FROM prediction_logs WHERE user_id = ? ORDER BY created_at DESC"
            params = (user_id,)
            
        logs = fetch_all(query, params)
        
        # Create DataFrame
        df = pd.DataFrame(logs)
        if df.empty:
            df = pd.DataFrame(columns=[
                "id", "user_id", "crop_name", "avg_temp", "rainfall", "soil_ph",
                "nitrogen", "phosphorus", "potassium", "predicted_yield", "confidence_score", "created_at"
            ])
            
        # Write to memory stream
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        
        # Return response
        response = StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=yield_predictions_report.csv"
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV export: {str(exc)}")

@router.get("/predictions")
def get_prediction_logs(current_user: dict = Depends(get_current_user)):
    try:
        user_id = int(current_user["sub"])
        
        # Admins can see all logs, farmers see their own logs
        if current_user.get("role") == "Admin":
            query = "SELECT id, user_id, crop_name, avg_temp, rainfall, soil_ph, nitrogen, phosphorus, potassium, predicted_yield, confidence_score, created_at FROM prediction_logs ORDER BY created_at DESC"
            params = ()
        else:
            query = "SELECT id, user_id, crop_name, avg_temp, rainfall, soil_ph, nitrogen, phosphorus, potassium, predicted_yield, confidence_score, created_at FROM prediction_logs WHERE user_id = ? ORDER BY created_at DESC"
            params = (user_id,)
            
        logs = fetch_all(query, params)
        return logs
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prediction logs: {str(exc)}")


@router.get("/farms/{farm_id}/export-csv")
def export_farm_report_csv(farm_id: int, current_user: dict = Depends(get_current_user)):
    farm = _owned_farm(farm_id, current_user)
    crops = fetch_all("SELECT * FROM crop_records WHERE farm_id = ? ORDER BY created_at DESC", (farm_id,))
    soils = fetch_all("SELECT * FROM soil_records WHERE farm_id = ? ORDER BY created_at DESC", (farm_id,))
    weather = fetch_all("SELECT * FROM weather_records WHERE farm_id = ? ORDER BY created_at DESC", (farm_id,))
    historical = fetch_all("SELECT * FROM historical_farming_records WHERE farm_id = ? ORDER BY year DESC", (farm_id,))
    rows = []
    for section, records in (("farm", [farm]), ("crops", crops), ("soil", soils), ("weather", weather), ("historical_yields", historical)):
        for record in records:
            rows.append({"section": section, **record})
    stream = io.StringIO()
    pd.DataFrame(rows).to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=farm_{farm_id}_report.csv"
    return response
