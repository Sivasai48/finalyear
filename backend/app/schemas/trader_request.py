from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum


class RequestStatus(str, Enum):
    """Request status."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class TraderRequestBase(BaseModel):
    """Base trader request schema."""
    farmer_id: str
    request_type: str = "crop_deal"
    crop_id: Optional[str] = None
    requested_quantity: Optional[float] = None
    offered_price: Optional[float] = None
    message: Optional[str] = None


class TraderRequestCreate(TraderRequestBase):
    """Schema for creating a trader request."""
    dhalari_id: str


class TraderRequestUpdate(BaseModel):
    """Schema for updating a trader request."""
    status: RequestStatus
    message: Optional[str] = None


class TraderRequestResponse(TraderRequestBase):
    """Schema for trader request response."""
    id: str
    dhalari_id: str
    status: str # Relaxed from RequestStatus to avoid strict validation issues
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TraderRequestWithDetails(TraderRequestResponse):
    """Trader request with dhalari and crop details."""
    dhalari_name: Optional[str] = None
    dhalari_phone: Optional[str] = None
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    crop_name: Optional[str] = None
    crop_type: Optional[str] = None


class RequestStats(BaseModel):
    """Request statistics."""
    total: int = 0
    pending: int = 0
    accepted: int = 0
    declined: int = 0
