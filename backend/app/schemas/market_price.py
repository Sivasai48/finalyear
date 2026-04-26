from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class MarketPriceBase(BaseModel):
    """Base market price schema."""
    crop_name: str
    current_price: float
    location: str
    unit: Optional[str] = "per quintal"


class MarketPriceCreate(MarketPriceBase):
    """Schema for creating a market price entry."""
    pass


class MarketPriceResponse(MarketPriceBase):
    """Schema for market price response."""
    id: UUID
    recorded_at: datetime
    
    class Config:
        from_attributes = True


class MonthlyPriceData(BaseModel):
    """Monthly price data for charts."""
    month: str
    price: float
    predicted: Optional[float] = None


class CropMarketData(BaseModel):
    """Complete market data for a crop."""
    crop_name: str
    current_price: float
    unit: str
    monthly_data: List[MonthlyPriceData] = []
    apmc_prices: List[MarketPriceResponse] = []
