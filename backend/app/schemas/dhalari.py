from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class DhalariBase(BaseModel):
    """Base dhalari schema with common fields."""
    name: str
    business_name: str
    email: EmailStr
    phone: str
    location: str
    specialization: Optional[List[str]] = []
    commission: Optional[float] = 5.0
    experience: Optional[int] = 0


class DhalariCreate(DhalariBase):
    """Schema for creating a new dhalari."""
    password: str


class DhalariUpdate(BaseModel):
    """Schema for updating dhalari profile."""
    name: Optional[str] = None
    business_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[List[str]] = None
    commission: Optional[float] = None
    experience: Optional[int] = None
    profile_image: Optional[str] = None



class DhalariResponse(DhalariBase):
    """Schema for dhalari response."""
    id: str
    phone: Optional[str] = None # Privacy
    email: Optional[EmailStr] = None # Privacy
    location: Optional[str] = None # Privacy
    rating: float = 0.0
    verified: bool = False
    profile_image: Optional[str] = None
    success_rate: Optional[int] = 0
    total_deals: Optional[int] = 0
    is_connected: Optional[bool] = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DhalariAnalytics(BaseModel):
    """Analytics data for a dhalari."""
    total_requests: int = 0
    accepted_requests: int = 0
    declined_requests: int = 0
    pending_requests: int = 0
    total_volume: float = 0.0
    total_value: float = 0.0


class MarketStatsResponse(BaseModel):
    """Market-wide statistics for dashboard."""
    active_farmers: int = 0
    new_listings_today: int = 0
    total_listings: int = 0
    top_crop: str = "N/A"
    top_crop_count: int = 0
    market_trend: str = "Stable"
    total_trade_value_today: float = 0.0


class MonthlyPerformanceItem(BaseModel):
    """Single month performance data."""
    month: int
    year: int
    month_name: str
    deal_count: int = 0
    total_value: float = 0.0
    commission: float = 0.0


class MonthlyPerformanceResponse(BaseModel):
    """Monthly performance data for dhalari."""
    months: List["MonthlyPerformanceItem"] = []
