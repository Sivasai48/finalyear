import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from ..database import Base


class Farmer(Base):
    """Farmer model representing agricultural producers."""
    
    __tablename__ = "farmers"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    location = Column(String(100), nullable=False)
    land_size = Column(Float, default=0)  # in acres
    experience = Column(Integer, default=0)  # years
    primary_crops = Column(JSON, default=[])  # List of primary crops
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Farmer(id={self.id}, name={self.name})>"
