import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base


class Dhalari(Base):
    """Dhalari (Trader/Dealer) model representing agricultural traders."""
    
    __tablename__ = "dhalaris"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    business_name = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    location = Column(String(100), nullable=False)
    specialization = Column(JSON, default=[])  # List of crop types stored as JSON
    commission = Column(Float, default=5.0)  # percentage
    rating = Column(Float, default=0.0)
    verified = Column(Boolean, default=False)
    experience = Column(Integer, default=0)  # years
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trader_requests = relationship("TraderRequest", back_populates="dhalari", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Dhalari(id={self.id}, business_name={self.business_name})>"
