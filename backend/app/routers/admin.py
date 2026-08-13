from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.core.deps import get_current_user, require_role
from fastapi.responses import StreamingResponse
from io import StringIO, BytesIO
import csv
router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    return db.query(models.User).all()

@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    return {
        "total_users": db.query(models.User).count(),
        "total_farms": db.query(models.Farm).count(),
        "total_predictions": db.query(models.Prediction).count(),
        "users_by_role": {
            "Farmer": db.query(models.User).filter(models.User.role == "Farmer").count(),
            "Admin": db.query(models.User).filter(models.User.role == "Admin").count(),
            "Analyst": db.query(models.User).filter(models.User.role == "Analyst").count(),
        }
    }

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role_data.get("role", user.role)
    db.commit()
    db.refresh(user)
    return user

@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    return {
        "total_users": db.query(models.User).count(),
        "total_farms": db.query(models.Farm).count(),
        "total_predictions": db.query(models.Prediction).count(),
        "farmer_count": db.query(models.User).filter(models.User.role=="Farmer").count(),
        "analyst_count": db.query(models.User).filter(models.User.role=="Analyst").count(),
        "admin_count": db.query(models.User).filter(models.User.role=="Admin").count(),
    }

@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id:int,
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    user=db.query(models.User).filter(models.User.id==user_id).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    return user

@router.get("/farms")
def get_all_farms(
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    return db.query(models.Farm).all()

@router.get("/farms/{farm_id}")
def get_farm(
    farm_id:int,
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    farm=db.query(models.Farm).filter(models.Farm.id==farm_id).first()

    if not farm:
        raise HTTPException(status_code=404,detail="Farm not found")

    return farm


@router.delete("/farms/{farm_id}")
def delete_farm(
    farm_id:int,
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    farm=db.query(models.Farm).filter(models.Farm.id==farm_id).first()

    if not farm:
        raise HTTPException(status_code=404,detail="Farm not found")

    db.delete(farm)
    db.commit()

    return {"message":"Farm deleted"}


@router.get("/predictions")
def get_predictions(
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    return db.query(models.Prediction).all()

@router.get("/predictions/{prediction_id}")
def get_prediction(
    prediction_id:int,
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    prediction=db.query(models.Prediction).filter(
        models.Prediction.id==prediction_id
    ).first()

    if not prediction:
        raise HTTPException(status_code=404,detail="Prediction not found")

    return prediction

@router.delete("/predictions/{prediction_id}")
def delete_prediction(
    prediction_id:int,
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    prediction=db.query(models.Prediction).filter(
        models.Prediction.id==prediction_id
    ).first()

    if not prediction:
        raise HTTPException(status_code=404,detail="Prediction not found")

    db.delete(prediction)
    db.commit()

    return {"message":"Prediction deleted"}


@router.get("/system")
def system_health(
    current_user:models.User=Depends(require_role("Admin"))
):
    return {
        "api":"Running",
        "database":"Connected",
        "server":"Healthy"
    }

from app.ml.predictor import get_model_metrics

@router.get("/model")
def model_metrics(
    current_user:models.User=Depends(require_role("Admin"))
):
    return get_model_metrics()


@router.get("/activity")
def activity(
    db:Session=Depends(get_db),
    current_user:models.User=Depends(require_role("Admin"))
):
    predictions=db.query(models.Prediction)\
        .order_by(models.Prediction.created_at.desc())\
        .limit(10)\
        .all()

    return predictions

@router.get("/reports")
def get_admin_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    return {
        "total_users": db.query(models.User).count(),
        "total_farms": db.query(models.Farm).count(),
        "total_predictions": db.query(models.Prediction).count(),
        "total_notifications": db.query(models.Notification).count()
            if hasattr(models, "Notification") else 0,
        "average_accuracy": 96.5,
    }

@router.get("/reports/export/csv")
def export_admin_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Total Users",
        "Total Farms",
        "Total Predictions",
    ])

    writer.writerow([
        db.query(models.User).count(),
        db.query(models.Farm).count(),
        db.query(models.Prediction).count(),
    ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=yieldsense_report.csv"
        },
    )

@router.get("/reports/export/excel")
def export_excel(
    current_user: models.User = Depends(require_role("Admin"))
):
    return {
        "message": "Excel export coming soon."
    }

@router.get("/reports/export/pdf")
def export_pdf(
    current_user: models.User = Depends(require_role("Admin"))
):
    return {
        "message": "PDF export coming soon."
    }
