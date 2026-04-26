from datetime import datetime
from sqlalchemy import Column, String, Float, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class FarmerProfile(Base):
    """
    Farmer Profile Model
    Stores personal details, linked to FarmerLogin via farmer_id.
    """
    __tablename__ = "farmer_profiles"

    farmer_id = Column(String(36), ForeignKey("farmer_logins.id"), primary_key=True)
    name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)  # Added phone
    email = Column(String(100), nullable=True)  # Added email
    village = Column(String(100), nullable=True)  # Added village
    district = Column(String(100), nullable=True)  # Added district
    state = Column(String(100), nullable=True)  # Added state
    land_size = Column(Float, default=0.0)
    primary_crops = Column(JSON, default=[]) # List of crops grown (renamed from crops)
    location = Column(String(100), nullable=True) # Kept for backward compatibility or general location
    is_profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to login (optional, but good for ORM navigation if needed)
    login = relationship("FarmerLogin", backref="profile")

    def __repr__(self):
        return f"<FarmerProfile(id={self.farmer_id}, name={self.name})>"
