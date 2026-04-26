import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, DateTime, Date, Text, Enum, ForeignKey

from sqlalchemy.orm import relationship
import enum
from ..database import Base


class CropStatus(str, enum.Enum):
    """Status of a crop listing."""
    AVAILABLE = "available"
    PENDING = "pending"
    SOLD = "sold"


class Crop(Base):
    """Crop model representing farmer's crop listings."""
    
    __tablename__ = "crops"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_logins.id"), nullable=False)
    name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)  # in tons
    expected_price = Column(Float, nullable=False)  # per quintal
    description = Column(Text, nullable=True)
    status = Column(Enum(CropStatus), default=CropStatus.AVAILABLE)
    season = Column(String(50), nullable=True)
    sowing_date = Column(Date, nullable=True)
    harvest_date = Column(Date, nullable=True)
    location = Column(String(100), nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    farmer = relationship("FarmerLogin", back_populates="crops")
    trader_requests = relationship("TraderRequest", back_populates="crop", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Crop(id={self.id}, name={self.name}, quantity={self.quantity})>"
