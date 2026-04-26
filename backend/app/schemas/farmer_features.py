from pydantic import BaseModel
from typing import List, Optional

class FarmerProfileBase(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    land_size: Optional[float] = 0.0
    primary_crops: Optional[List[str]] = []
    location: Optional[str] = None

class FarmerProfileCreate(FarmerProfileBase):
    pass

class FarmerProfileUpdate(FarmerProfileBase):
    pass

class FarmerProfileResponse(FarmerProfileBase):
    farmer_id: str
    is_profile_complete: bool

    class Config:
        from_attributes = True
