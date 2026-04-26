from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class FarmerBase(BaseModel):
    """Base farmer schema with common fields."""
    name: str
    phone: str
    email: EmailStr
    location: str
    land_size: Optional[float] = 0
    experience: Optional[int] = 0


class FarmerCreate(FarmerBase):
    """Schema for creating a new farmer."""
    password: str


class FarmerUpdate(BaseModel):
    """Schema for updating farmer profile."""
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    land_size: Optional[float] = None
    experience: Optional[int] = None
    profile_image: Optional[str] = None
    email: Optional[EmailStr] = None


class FarmerLogin(BaseModel):
    """Schema for farmer login."""
    email: EmailStr
    password: str



class FarmerResponse(FarmerBase):
    """Schema for farmer response."""
    id: str
    phone: Optional[str] = None  # Privacy: hidden if not connected
    email: Optional[EmailStr] = None # Privacy: hidden if not connected
    location: Optional[str] = None # Privacy: approximate if not connected
    profile_image: Optional[str] = None
    success_rate: Optional[int] = 0
    total_deals: Optional[int] = 0
    is_connected: Optional[bool] = False # Privacy status
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
