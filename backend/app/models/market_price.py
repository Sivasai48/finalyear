import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime

from ..database import Base


class MarketPrice(Base):
    """Market price model for tracking crop prices across locations."""
    
    __tablename__ = "market_prices"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    crop_name = Column(String(100), nullable=False, index=True)
    current_price = Column(Float, nullable=False)  # per quintal
    location = Column(String(100), nullable=False)  # APMC/Mandi name
    unit = Column(String(50), default="per quintal")
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<MarketPrice(crop={self.crop_name}, price={self.current_price}, location={self.location})>"
