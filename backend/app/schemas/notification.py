from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum


class UserType(str, Enum):
    """User type for notifications."""
    FARMER = "farmer"
    DHALARI = "dhalari"


class NotificationType(str, Enum):
    """Notification type."""
    DEAL_ACCEPTED = "deal_accepted"
    DEAL_DECLINED = "deal_declined"
    NEW_CROP_LISTING = "new_crop_listing"
    NEW_REQUEST = "new_request"


class NotificationBase(BaseModel):
    """Base notification schema."""
    user_id: UUID
    user_type: UserType
    type: NotificationType
    title: str
    message: str
    crop_name: Optional[str] = None
    farmer_name: Optional[str] = None
    dhalari_name: Optional[str] = None
    amount: Optional[float] = None


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    pass


class NotificationResponse(NotificationBase):
    """Schema for notification response."""
    id: UUID
    read: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    read: bool = True
