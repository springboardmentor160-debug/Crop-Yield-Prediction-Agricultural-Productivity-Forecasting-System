# Notification service - extend with email/SMS later
from sqlalchemy.orm import Session
from app import models
from datetime import datetime, timezone

def send_notification(db: Session, user_id: int, title: str, message: str):
    notification = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        created_at=datetime.now(timezone.utc)
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification