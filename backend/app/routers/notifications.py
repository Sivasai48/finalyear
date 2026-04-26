from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models import Notification
from ..schemas import NotificationCreate, NotificationResponse
from ..services.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class ContactRequest(BaseModel):
    subject: str
    message: str
    userId: str

@router.post("/contact/submit", tags=["Contact"])
async def submit_contact_form(data: ContactRequest):
    """Mock endpoint for contact form submission."""
    return {"success": True, "message": "Message received"}

@router.get("/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(
    user_id: str,
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all notifications for a user."""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    
    if unread_only:
        query = query.filter(Notification.read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/count/{user_id}")
async def get_unread_count(user_id: str, db: Session = Depends(get_db)):
    """Get count of unread notifications for a user."""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    ).count()
    return {"unread_count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(notification_id: str, db: Session = Depends(get_db)):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/mark-all-read/{user_id}")
async def mark_all_as_read(user_id: str, db: Session = Depends(get_db)):
    """Mark all notifications as read for a user."""
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    ).update({"read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(notification_id: str, db: Session = Depends(get_db)):
    """Delete a notification."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    return None


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):
    """Create a new notification (internal use)."""
    notification = Notification(
        user_id=notification_data.user_id,
        user_type=notification_data.user_type,
        type=notification_data.type,
        title=notification_data.title,
        message=notification_data.message,
        crop_name=notification_data.crop_name,
        farmer_name=notification_data.farmer_name,
        dhalari_name=notification_data.dhalari_name,
        amount=notification_data.amount
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
