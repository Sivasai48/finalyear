import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, Enum

import enum
from ..database import Base


class UserType(str, enum.Enum):
    """Type of user receiving notification."""
    FARMER = "farmer"
    DHALARI = "dhalari"


class NotificationType(str, enum.Enum):
    """Type of notification."""
    DEAL_ACCEPTED = "deal_accepted"
    DEAL_DECLINED = "deal_declined"
    NEW_CROP_LISTING = "new_crop_listing"
    NEW_REQUEST = "new_request"


class Notification(Base):
    """Notification model for user alerts and updates."""
    
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    user_type = Column(Enum(UserType), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    crop_name = Column(String(100), nullable=True)
    farmer_name = Column(String(100), nullable=True)
    dhalari_name = Column(String(100), nullable=True)
    amount = Column(Float, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.type}, read={self.read})>"
