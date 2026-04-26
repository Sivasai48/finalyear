from typing import List, Optional, Set
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import Crop, Farmer, Notification, FarmerLogin, FarmerProfile, TraderRequest
from ..models.crop import CropStatus
from ..models.notification import UserType, NotificationType
from ..schemas import CropCreate, CropUpdate, CropResponse
from ..schemas.crop import CropWithFarmer
from ..services.auth import get_current_farmer, get_current_user, get_current_user_optional # NEW
from ..services.email_service import send_crop_added_email

router = APIRouter(prefix="/api/crops", tags=["Crops"])


def _check_connection(db: Session, farmer_id: str, viewer_id: Optional[str]) -> bool:
    if not viewer_id:
        return False
        
    connection = db.query(TraderRequest).filter(
        or_(
            (TraderRequest.farmer_id == farmer_id) & (TraderRequest.dhalari_id == viewer_id),
        ),
        TraderRequest.status == "accepted"
    ).first()
    
    return connection is not None

@router.get("", response_model=List[CropWithFarmer])
def get_all_crops(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    crop_name: str = None,
    location: str = None,
    current_user = Depends(get_current_user_optional), # NEW
    db: Session = Depends(get_db)
):
    """Get all crop listings with optional filtering."""
    # Join with FarmerLogin and optionally FarmerProfile
    query = db.query(Crop, FarmerLogin, FarmerProfile).join(
        FarmerLogin, Crop.farmer_id == FarmerLogin.id
    ).outerjoin(
        FarmerProfile, FarmerLogin.id == FarmerProfile.farmer_id
    )
    
    if status:
        query = query.filter(Crop.status == status)
    
    if crop_name:
        query = query.filter(Crop.name.ilike(f"%{crop_name}%"))
    
    if location:
        query = query.filter(Crop.location.ilike(f"%{location}%"))
    
    results = query.offset(skip).limit(limit).all()
    
    # Optimize connection check
    viewer_id = str(current_user.id) if current_user else None
    connected_farmers: Set[str] = set()
    
    if viewer_id:
        connections = db.query(TraderRequest.farmer_id).filter(
            TraderRequest.dhalari_id == viewer_id,
            TraderRequest.status == "accepted"
        ).all()
        connected_farmers = {str(c[0]) for c in connections} # Assuming c is tuple (farmer_id,)
        
        # Also add self if viewer is a farmer viewing their own crops?
        # But viewer_id here is typically Dhalari. If Farmer views, they see crop details anyway.
        # But if Farmer A views Farmer B's crop... they interact as traders? 
        # The requirements imply Dhalari-Farmer relationship.
        # If viewer is the farmer themselves:
        if current_user and getattr(current_user, "type", None) != "dhalari": # Assuming mixed auth user model
             # Actually get_current_user returns FarmerLogin or Dhalari. FarmerLogin doesn't have 'type' field explicitly on model?
             # But TokenData had type.
             # If ID matches, it's self.
             pass

    # Add farmer details from joined tables
    result = []
    for crop, farmer_login, farmer_profile in results:
        crop_dict = CropResponse.model_validate(crop).model_dump()
        
        crop_dict["farmer_name"] = farmer_profile.name if farmer_profile and farmer_profile.name else "Farmer"
        
        # Privacy Logic
        phone = farmer_login.phone_number
        is_connected = False
        
        if viewer_id:
            if str(viewer_id) == str(farmer_login.id): # Self
                is_connected = True
            elif str(farmer_login.id) in connected_farmers:
                is_connected = True
        
        if not is_connected:
            if phone and len(phone) > 4:
                crop_dict["farmer_phone"] = phone[:3] + "*" * (len(phone) - 5) + phone[-2:]
            else:
                crop_dict["farmer_phone"] = "***"
        else:
            crop_dict["farmer_phone"] = phone
            
        crop_dict["is_connected"] = is_connected # New Field
        result.append(CropWithFarmer(**crop_dict))
    
    return result


@router.post("", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_crop(
    crop_data: CropCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new crop listing. Farmers can only create crops for themselves."""
    # current_user is FarmerLogin
    if crop_data.farmer_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create crops for your own account"
        )
    
    # Check if a profile exists to get location if not provided
    from ..models import FarmerProfile
    profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == str(current_user.id)).first()
    default_location = profile.location if profile else "Not set"
    
    crop = Crop(
        farmer_id=crop_data.farmer_id,
        name=crop_data.name,
        quantity=crop_data.quantity,
        expected_price=crop_data.expected_price,
        description=crop_data.description,
        season=crop_data.season,
        sowing_date=crop_data.sowing_date,
        harvest_date=crop_data.harvest_date,
        location=crop_data.location or default_location,
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)
    
    # Send email notification to farmer
    try:
        if profile and profile.email:
            farmer_name = profile.name or "Farmer"
            send_crop_added_email(
                email=profile.email,
                farmer_name=farmer_name,
                crop_name=crop.name,
                quantity=crop.quantity,
                price=crop.expected_price
            )
    except Exception as email_error:
        print(f"[EmailService] Error sending crop added email: {email_error}")
    
    return crop


@router.get("/{crop_id}", response_model=CropWithFarmer)
def get_crop(
    crop_id: str, 
    current_user = Depends(get_current_user_optional), # NEW
    db: Session = Depends(get_db)
):
    """Get a specific crop by ID."""
    result = db.query(Crop, FarmerLogin, FarmerProfile).join(
        FarmerLogin, Crop.farmer_id == FarmerLogin.id
    ).outerjoin(
        FarmerProfile, FarmerLogin.id == FarmerProfile.farmer_id
    ).filter(Crop.id == crop_id).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    
    crop, farmer_login, farmer_profile = result
    
    # Privacy check
    viewer_id = str(current_user.id) if current_user else None
    is_connected = False
    if viewer_id:
        if str(viewer_id) == str(farmer_login.id):
            is_connected = True
        else:
            is_connected = _check_connection(db, str(farmer_login.id), viewer_id)
            
    crop_dict = CropResponse.model_validate(crop).model_dump()
    crop_dict["farmer_name"] = farmer_profile.name if farmer_profile and farmer_profile.name else "Farmer"
    
    phone = farmer_login.phone_number
    if not is_connected:
         if phone and len(phone) > 4:
            crop_dict["farmer_phone"] = phone[:3] + "*" * (len(phone) - 5) + phone[-2:]
         else:
            crop_dict["farmer_phone"] = "***"
    else:
        crop_dict["farmer_phone"] = phone
        
    crop_dict["is_connected"] = is_connected # New Field
    return CropWithFarmer(**crop_dict)


@router.put("/{crop_id}", response_model=CropResponse)
def update_crop(
    crop_id: str,
    crop_update: CropUpdate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Update a crop listing. Farmers can only update their own crops."""
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    
    if crop.farmer_id != str(current_farmer.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own crops"
        )
    
    # Update fields
    update_data = crop_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(crop, field, value)
    
    db.commit()
    db.refresh(crop)
    return crop


@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_crop(
    crop_id: str,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Delete a crop listing. Farmers can only delete their own crops."""
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    
    if crop.farmer_id != str(current_farmer.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own crops"
        )
    
    db.delete(crop)
    db.commit()
    return None


@router.get("/farmer/{farmer_id}", response_model=List[CropResponse])
def get_farmer_crops(farmer_id: str, db: Session = Depends(get_db)):
    """Get all crops for a specific farmer."""
    crops = db.query(Crop).filter(Crop.farmer_id == farmer_id).all()
    return crops
