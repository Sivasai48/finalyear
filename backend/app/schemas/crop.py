from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from enum import Enum


class CropStatus(str, Enum):
    """Crop listing status."""
    AVAILABLE = "available"
    PENDING = "pending"
    SOLD = "sold"


class CropBase(BaseModel):
    """Base crop schema with common fields."""
    name: str
    quantity: float
    expected_price: float
    description: Optional[str] = None
    season: Optional[str] = None
    harvest_date: Optional[date] = None
    location: Optional[str] = None


class CropCreate(CropBase):
    """Schema for creating a new crop listing."""
    farmer_id: str
    sowing_date: Optional[date] = None


class CropUpdate(BaseModel):
    """Schema for updating a crop listing."""
    name: Optional[str] = None
    quantity: Optional[float] = None
    expected_price: Optional[float] = None
    description: Optional[str] = None
    status: Optional[CropStatus] = None
    harvest_date: Optional[date] = None
    image_url: Optional[str] = None


class CropResponse(CropBase):
    """Schema for crop response."""
    id: str
    farmer_id: str
    status: CropStatus
    sowing_date: Optional[date] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CropWithFarmer(CropResponse):
    """Crop response with farmer details."""
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    is_connected: bool = False
