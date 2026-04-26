import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from ..database import Base

class FarmerLogin(Base):
    """
    Farmer Login Model
    Stores phone number and OTP for authentication.
    """
    __tablename__ = "farmer_logins"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    otp = Column(String(6), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    from sqlalchemy.orm import relationship
    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FarmerLogin(phone={self.phone_number}, verified={self.is_verified})>"
