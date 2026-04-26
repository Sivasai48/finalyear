import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Enum, ForeignKey

from sqlalchemy.orm import relationship
import enum
from ..database import Base


class RequestStatus(str, enum.Enum):
    """Status of a trader request."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class TraderRequest(Base):
    """Trader request model for purchase requests from dhalaris to farmers."""
    
    __tablename__ = "trader_requests"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dhalari_id = Column(String(36), ForeignKey("dhalaris.id"), nullable=False)
    crop_id = Column(String(36), ForeignKey("crops.id"), nullable=True)  # Optional for contact requests
    farmer_id = Column(String(36), ForeignKey("farmer_logins.id"), nullable=False)
    request_type = Column(String(20), default="crop_deal")  # "crop_deal" or "contact"
    sender_type = Column(String(10), nullable=True)  # "farmer" or "dhalari" - who initiated the request
    requested_quantity = Column(Float, nullable=True)  # Optional for contact
    offered_price = Column(Float, nullable=True)  # Optional for contact
    message = Column(Text, nullable=True)
    # status = Column(Enum(RequestStatus), default=RequestStatus.PENDING)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dhalari = relationship("Dhalari", back_populates="trader_requests")
    crop = relationship("Crop", back_populates="trader_requests")
    
    def __repr__(self):
        return f"<TraderRequest(id={self.id}, status={self.status})>"
