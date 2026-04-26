
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import FarmerLogin, FarmerProfile, Crop, TraderRequest
from ..schemas import FarmerResponse, FarmerUpdate
from ..services.auth import get_current_user_optional, get_current_user

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])

def _check_connection(db: Session, farmer_id: str, viewer_id: Optional[str]) -> bool:
    """Check if the viewer (Dhalari) is connected to the farmer."""
    if not viewer_id:
        return False
        
    # Check if there's any ACCEPTED request between them (either direction)
    # 1. Dhalari sent Crop Deal -> Farmer Accepted
    # 2. Farmer sent Contact Request -> Dhalari Accepted
    # 3. Dhalari sent Contact Request -> Farmer Accepted
    
    connection = db.query(TraderRequest).filter(
        or_(
            (TraderRequest.farmer_id == farmer_id) & (TraderRequest.dhalari_id == viewer_id),
            # In case we track sender/receiver differently in future, but distinct connection logic mostly relies on accepted requests between the two entities
        ),
        TraderRequest.status == "accepted"
    ).first()
    
    return connection is not None

def _get_farmer_response(db: Session, login: FarmerLogin, profile: Optional[FarmerProfile], viewer_id: Optional[str] = None) -> FarmerResponse:
    """Helper to convert models to response schema with privacy rules."""
    
    # Calculate stats
    total_deals = db.query(TraderRequest).filter(TraderRequest.farmer_id == login.id).count()
    accepted_deals = db.query(TraderRequest).filter(TraderRequest.farmer_id == login.id, TraderRequest.status == "accepted").count()
    success_rate = int((accepted_deals / total_deals) * 100) if total_deals > 0 else 0
    
    # Check connection privacy
    # Usage: If viewer_id is None (guest) or not connected -> Mask Data
    is_connected = False
    if viewer_id:
         # Check if viewer is the farmer themselves (can see own data)
         if str(viewer_id) == str(login.id):
             is_connected = True
         else:
             is_connected = _check_connection(db, str(login.id), str(viewer_id))
    
    # Apply Masking
    phone = login.phone_number
    # Use profile email if set, otherwise generate default
    email = (profile.email if profile and profile.email else f"farmer_{login.phone_number}@example.com")
    location = (profile.location if profile and profile.location else None) or "Not set"
    
    if not is_connected:
        # Mask phone: +91 9876543210 -> +91 98******10
        if phone and len(phone) > 4:
            phone = phone[:3] + "*" * (len(phone) - 5) + phone[-2:]
        else:
            phone = "***"
        
        email = None # Hide email completely
        # Keep location as is for now, or make it less specific if needed
        
    return FarmerResponse(
        id=login.id,
        name=(profile.name if profile and profile.name else None) or "Farmer",
        phone=phone,
        email=email,
        location=location,
        land_size=profile.land_size if profile and profile.land_size else 0.0,
        experience=0,
        profile_image=None, 
        success_rate=success_rate,
        total_deals=total_deals,
        is_connected=is_connected,
        created_at=login.created_at,
        updated_at=profile.updated_at if profile and profile.updated_at else login.created_at
    )

@router.get("", response_model=List[FarmerResponse])
def get_all_farmers(
    skip: int = 0,
    limit: int = 100,
    location: str = None,
    current_user = Depends(get_current_user_optional), # NEW: Get user if logged in
    db: Session = Depends(get_db)
):
    """Get all farmers with optional filtering and privacy."""
    query = db.query(FarmerLogin, FarmerProfile).outerjoin(FarmerProfile, FarmerLogin.id == FarmerProfile.farmer_id)
    
    if location:
        query = query.filter(FarmerProfile.location.ilike(f"%{location}%"))
    
    results = query.offset(skip).limit(limit).all()
    
    viewer_id = str(current_user.id) if current_user else None
    
    farmers = []
    for login, profile in results:
        farmers.append(_get_farmer_response(db, login, profile, viewer_id))
        
    return farmers


@router.get("/{farmer_id}/stats")
def get_farmer_stats(farmer_id: str, db: Session = Depends(get_db)):
    """Get dashboard stats for a farmer."""
    try:
        from ..models import Crop, TraderRequest
        
        active_crops = db.query(Crop).filter(Crop.farmer_id == farmer_id, Crop.status == "available").count()
        total_requests = db.query(TraderRequest).filter(TraderRequest.farmer_id == farmer_id, TraderRequest.status == "pending").count()
        
        # Calculate average price from farmer's crops
        crops = db.query(Crop).filter(Crop.farmer_id == farmer_id).all()
        if crops:
            avg_price = sum(c.expected_price or 0 for c in crops) / len(crops)
        else:
            avg_price = 0
        
        # Calculate success rate
        total_deals = db.query(TraderRequest).filter(TraderRequest.farmer_id == farmer_id).count()
        accepted_deals = db.query(TraderRequest).filter(TraderRequest.farmer_id == farmer_id, TraderRequest.status == "accepted").count()
        success_rate = int((accepted_deals / total_deals) * 100) if total_deals > 0 else 0
        
        return {
            "activeCrops": active_crops,
            "totalRequests": total_requests,
            "avgPrice": int(avg_price),
            "successRate": success_rate,
            "monthlyStats": _get_monthly_stats(db, farmer_id)
        }
    except Exception as e:
        # Return mock/default stats on any database error
        print(f"Error fetching farmer stats: {e}")
        import traceback
        traceback.print_exc()
        return {
            "activeCrops": 0,
            "totalRequests": 0,
            "avgPrice": 0,
            "successRate": 0,
            "monthlyStats": []
        }

def _get_monthly_stats(db: Session, farmer_id: str):
    from ..models import Crop, TraderRequest
    from datetime import datetime, timedelta
    import calendar
    
    # Get last 6 months
    today = datetime.utcnow()
    six_months_ago = today - timedelta(days=180)
    
    # Initialize buckets for last 6 months
    stats_map = {}
    for i in range(6):
        d = today - timedelta(days=30 * i)
        key = d.strftime("%Y-%m")
        stats_map[key] = {
            "month": d.strftime("%b"),
            "year": d.year,
            "sort_key": key,
            "cropsAdded": 0,
            "requests": 0,
            "quantitySold": 0.0,
            "moneyGained": 0.0
        }
        
    # Aggegate Crops Added
    crops = db.query(Crop).filter(
        Crop.farmer_id == farmer_id,
        Crop.created_at >= six_months_ago
    ).all()
    
    for crop in crops:
        if not crop.created_at: continue
        key = crop.created_at.strftime("%Y-%m")
        if key in stats_map:
            stats_map[key]["cropsAdded"] += 1
            
    # Aggregate Requests and Sales
    requests = db.query(TraderRequest).filter(
        TraderRequest.farmer_id == farmer_id,
        TraderRequest.created_at >= six_months_ago
    ).all()
    
    for req in requests:
        if not req.created_at: continue
        key = req.created_at.strftime("%Y-%m")
        if key in stats_map:
            stats_map[key]["requests"] += 1
            if req.status == "accepted":
                qty = req.requested_quantity or 0
                price = req.offered_price or 0
                stats_map[key]["quantitySold"] += qty
                stats_map[key]["moneyGained"] += (qty * price)
                
    # Convert to list and sort
    result = list(stats_map.values())
    result.sort(key=lambda x: x["sort_key"])
    
    # Clean up keys not needed for frontend
    final_output = []
    for item in result:
        final_output.append({
            "month": item["month"],
            "cropsAdded": item["cropsAdded"],
            "requests": item["requests"],
            "quantitySold": round(item["quantitySold"], 2),
            "moneyGained": round(item["moneyGained"], 2)
        })
        
    return final_output


@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(
    farmer_id: str, 
    current_user = Depends(get_current_user_optional), # NEW
    db: Session = Depends(get_db)
):
    """Get a specific farmer by ID."""
    result = db.query(FarmerLogin, FarmerProfile).outerjoin(FarmerProfile, FarmerLogin.id == FarmerProfile.farmer_id).filter(FarmerLogin.id == farmer_id).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found"
        )
    
    login, profile = result
    viewer_id = str(current_user.id) if current_user else None
    return _get_farmer_response(db, login, profile, viewer_id)


@router.put("/{farmer_id}", response_model=FarmerResponse)
def update_farmer(
    farmer_id: str,
    farmer_update: FarmerUpdate,
    current_user = Depends(get_current_user_optional), # Changed to optional for consistnecy, but logic enforces ID match
    db: Session = Depends(get_db)
):
    """Update farmer profile. Farmers can only update their own profile."""
    # current_user returns FarmerLogin object (or None if invalid token, but we should enforce auth here)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    if str(current_user.id) != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    
    login = db.query(FarmerLogin).filter(FarmerLogin.id == farmer_id).first()
    if not login:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == farmer_id).first()
    if not profile:
        profile = FarmerProfile(farmer_id=farmer_id)
        db.add(profile)
    
    # Update fields
    update_data = farmer_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
        # Handle phone update in login table?
        if field == "phone" and value:
            # Check uniqueness if implementing phone change
            pass
    
    db.commit()
    db.refresh(profile)
    return _get_farmer_response(db, login, profile, str(current_user.id))


@router.delete("/{farmer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer(
    farmer_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete farmer account. Farmers can only delete their own account."""
    if str(current_user.id) != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own account"
        )
    
    login = db.query(FarmerLogin).filter(FarmerLogin.id == farmer_id).first()
    if not login:
         raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Cascades should handle profile deletion if set up, manually delete for safety
    db.query(FarmerProfile).filter(FarmerProfile.farmer_id == farmer_id).delete()
    db.delete(login)
    db.commit()
    return None
