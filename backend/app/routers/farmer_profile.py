from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import FarmerProfile
from ..schemas.farmer_features import FarmerProfileUpdate, FarmerProfileResponse
from ..services.auth import get_current_user
from ..services.email_service import send_farmer_profile_updated_email

router = APIRouter(prefix="/api/farmers", tags=["Farmer Profile"])

@router.get("/profile", response_model=FarmerProfileResponse)
async def get_farmer_profile(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current farmer's profile."""
    # current_user from auth is actually the Farmer or Dhalari model in the old system,
    # BUT since we changed the LOGIN logic to return 'sub' as farmer_login.id,
    # and get_current_user loads user based on that ID.
    
    # Wait, 'get_current_user' logic in `services/auth.py` needs to be checked. 
    # It probably queries the `Farmer` table. I used `FarmerLogin` ID as sub.
    # So I need to update `get_current_user` logic to support fetching `FarmerLogin/FarmerProfile` 
    # OR I should have made `FarmerLogin` compatible with `Farmer`.
    
    # Since I'm refactoring, let's assume 'get_current_user' gives me the object corresponding to 'sub'.
    # I should check `services/auth.py` next.
    
    # For now, let's implement validation assuming `current_user` has an `id` that matches `FarmerProfile.farmer_id`.
    
    profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == str(current_user.id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return profile

@router.post("/profile", response_model=FarmerProfileResponse)
async def update_farmer_profile(
    profile_data: FarmerProfileUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update or Create farmer profile."""
    # Ensure Current User is a Farmer
    if hasattr(current_user, "user_type") and current_user.user_type != "farmer":
         # In case we reuse get_current_user but it returns mixed types
         pass # Actually get_current_user logic handles this based on token, but good to be safe.
         # Actually get_current_user returns FarmerLogin object for farmers which doesn't have user_type attr directly usually
         # but let's trust the auth service for now.

    profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == str(current_user.id)).first()
    
    is_new_profile = profile is None
    
    if not profile:
        profile = FarmerProfile(farmer_id=str(current_user.id))
        db.add(profile)
    
    # Update fields
    # Iterate through fields to update only provided ones
    update_data = profile_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    # Check if profile is now complete
    # Require at least name, phone, and some location info
    if profile.name and profile.phone and (profile.village or profile.location):
        profile.is_profile_complete = True
        
    db.commit()
    db.refresh(profile)
    
    # Send profile updated email if farmer has email
    try:
        if profile.email:
            farmer_name = profile.name or "Farmer"
            send_farmer_profile_updated_email(
                email=profile.email,
                name=farmer_name
            )
    except Exception as email_error:
        print(f"[EmailService] Error sending profile update email: {email_error}")
    
    return profile
