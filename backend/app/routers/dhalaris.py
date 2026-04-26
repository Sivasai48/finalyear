
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, or_

from ..database import get_db
from ..models import Dhalari, TraderRequest, Crop, FarmerLogin
from ..models.trader_request import RequestStatus
from ..schemas import DhalariResponse, DhalariUpdate
from ..schemas.dhalari import DhalariAnalytics, MarketStatsResponse, MonthlyPerformanceItem, MonthlyPerformanceResponse
from ..services.auth import get_current_dhalari, get_current_user_optional
from ..services.email_service import send_dhalari_profile_updated_email

router = APIRouter(prefix="/api/dhalaris", tags=["Dhalaris"])

def _check_connection(db: Session, dhalari_id: str, viewer_id: Optional[str]) -> bool:
    """Check if the viewer (Farmer) is connected to the dhalari."""
    if not viewer_id:
        return False
        
    connection = db.query(TraderRequest).filter(
        or_(
            (TraderRequest.dhalari_id == dhalari_id) & (TraderRequest.farmer_id == viewer_id),
        ),
        TraderRequest.status == "accepted"
    ).first()
    
    return connection is not None

def _get_dhalari_response(db: Session, dhalari: Dhalari, viewer_id: Optional[str] = None) -> DhalariResponse:
    """Helper to convert models to response schema with privacy rules."""
    
    # Calculate stats
    total_deals = db.query(TraderRequest).filter(TraderRequest.dhalari_id == dhalari.id).count()
    accepted_deals = db.query(TraderRequest).filter(TraderRequest.dhalari_id == dhalari.id, TraderRequest.status == "accepted").count()
    success_rate = int((accepted_deals / total_deals) * 100) if total_deals > 0 else 0
    
    # Check connection privacy
    is_connected = False
    if viewer_id:
         if str(viewer_id) == str(dhalari.id):
             is_connected = True
         else:
             is_connected = _check_connection(db, str(dhalari.id), str(viewer_id))
    
    # Apply Masking
    phone = dhalari.phone
    email = dhalari.email or f"dhalari_{dhalari.phone}@example.com"
    location = dhalari.location
    
    if not is_connected:
        if phone and len(phone) > 4:
            phone = phone[:3] + "*" * (len(phone) - 5) + phone[-2:]
        else:
            phone = "***"
        
        email = None 
        # location = "Hidden" # Maybe keep location visible for finding traders?
        
    return DhalariResponse(
        id=dhalari.id,
        name=dhalari.name,
        business_name=dhalari.business_name,
        phone=phone,
        email=email,
        location=location,
        specialization=dhalari.specialization,
        commission=dhalari.commission,
        experience=dhalari.experience,
        rating=dhalari.rating,
        verified=dhalari.verified,
        profile_image=dhalari.profile_image,
        success_rate=success_rate,
        total_deals=total_deals,
        is_connected=is_connected,
        created_at=dhalari.created_at,
        updated_at=dhalari.updated_at
    )


@router.get("", response_model=List[DhalariResponse])
def get_all_dhalaris(
    skip: int = 0,
    limit: int = 100,
    location: str = None,
    specialization: str = None,
    verified_only: bool = False,
    current_user = Depends(get_current_user_optional), # NEW
    db: Session = Depends(get_db)
):
    """Get all dhalaris with optional filtering."""
    query = db.query(Dhalari)
    
    if location:
        query = query.filter(Dhalari.location.ilike(f"%{location}%"))
    
    if specialization:
        query = query.filter(Dhalari.specialization.any(specialization))
    
    if verified_only:
        query = query.filter(Dhalari.verified == True)
    
    results = query.offset(skip).limit(limit).all()
    
    viewer_id = str(current_user.id) if current_user else None
    
    dhalaris = []
    for dhalari in results:
        dhalaris.append(_get_dhalari_response(db, dhalari, viewer_id))
        
    return dhalaris


@router.get("/market-stats", response_model=MarketStatsResponse)
def get_market_stats(db: Session = Depends(get_db)):
    """
    Get market-wide statistics for the dashboard.
    Returns active farmers count, new listings, top crop, and market trend.
    """
    try:
        # Count active farmers (verified farmers with at least one crop)
        active_farmers = db.query(func.count(func.distinct(Crop.farmer_id))).scalar() or 0
        
        # Count new listings today
        today = date.today()
        new_listings_today = db.query(func.count(Crop.id)).filter(
            func.date(Crop.created_at) == today
        ).scalar() or 0
        
        # Total available listings
        total_listings = db.query(func.count(Crop.id)).filter(
            Crop.status == "available"
        ).scalar() or 0
        
        # Find top crop by listing count
        top_crop_result = db.query(
            Crop.name,
            func.count(Crop.id).label('count')
        ).filter(
            Crop.status == "available"
        ).group_by(Crop.name).order_by(func.count(Crop.id).desc()).first()
        
        top_crop = top_crop_result[0] if top_crop_result else "N/A"
        top_crop_count = top_crop_result[1] if top_crop_result else 0
        
        # Calculate market trend based on accepted deals in last 7 days vs previous 7 days
        today_datetime = datetime.utcnow()
        last_week_start = today_datetime - timedelta(days=7)
        prev_week_start = today_datetime - timedelta(days=14)
        
        recent_deals_value = db.query(
            func.sum(TraderRequest.offered_price * TraderRequest.requested_quantity)
        ).filter(
            TraderRequest.status == "accepted",
            TraderRequest.updated_at >= last_week_start
        ).scalar() or 0
        
        prev_deals_value = db.query(
            func.sum(TraderRequest.offered_price * TraderRequest.requested_quantity)
        ).filter(
            TraderRequest.status == "accepted",
            TraderRequest.updated_at >= prev_week_start,
            TraderRequest.updated_at < last_week_start
        ).scalar() or 0
        
        # Determine market trend
        if recent_deals_value > prev_deals_value * 1.1:
            market_trend = "Bullish"
        elif recent_deals_value < prev_deals_value * 0.9:
            market_trend = "Bearish"
        else:
            market_trend = "Stable"
        
        # Today's total trade value
        total_trade_value_today = db.query(
            func.sum(TraderRequest.offered_price * TraderRequest.requested_quantity)
        ).filter(
            TraderRequest.status == "accepted",
            func.date(TraderRequest.updated_at) == today
        ).scalar() or 0
        
        return MarketStatsResponse(
            active_farmers=active_farmers,
            new_listings_today=new_listings_today,
            total_listings=total_listings,
            top_crop=top_crop.title() if top_crop != "N/A" else "N/A",
            top_crop_count=top_crop_count,
            market_trend=market_trend,
            total_trade_value_today=total_trade_value_today
        )
        
    except Exception as e:
        print(f"[DhalarisRouter] Error getting market stats: {e}")
        return MarketStatsResponse()


@router.get("/{dhalari_id}", response_model=DhalariResponse)
def get_dhalari(dhalari_id: str, db: Session = Depends(get_db)):
    """Get a specific dhalari by ID."""
    dhalari = db.query(Dhalari).filter(Dhalari.id == dhalari_id).first()
    if not dhalari:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dhalari not found"
        )
    return dhalari


@router.get("/{dhalari_id}/analytics", response_model=DhalariAnalytics)
def get_dhalari_analytics(dhalari_id: str, db: Session = Depends(get_db)):
    """Get analytics for a specific dhalari."""
    dhalari = db.query(Dhalari).filter(Dhalari.id == dhalari_id).first()
    if not dhalari:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dhalari not found"
        )
    
    # Get request statistics
    requests = db.query(TraderRequest).filter(TraderRequest.dhalari_id == dhalari_id).all()
    
    total_volume = sum(r.requested_quantity for r in requests if r.status == RequestStatus.ACCEPTED)
    total_value = sum(r.requested_quantity * r.offered_price for r in requests if r.status == RequestStatus.ACCEPTED)
    
    return DhalariAnalytics(
        total_requests=len(requests),
        accepted_requests=len([r for r in requests if r.status == RequestStatus.ACCEPTED]),
        declined_requests=len([r for r in requests if r.status == RequestStatus.DECLINED]),
        pending_requests=len([r for r in requests if r.status == RequestStatus.PENDING]),
        total_volume=total_volume,
        total_value=total_value
    )


@router.put("/{dhalari_id}", response_model=DhalariResponse)
def update_dhalari(
    dhalari_id: str,
    dhalari_update: DhalariUpdate,
    current_dhalari: Dhalari = Depends(get_current_dhalari),
    db: Session = Depends(get_db)
):
    """Update dhalari profile. Dhalaris can only update their own profile."""
    if str(current_dhalari.id) != dhalari_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    
    dhalari = db.query(Dhalari).filter(Dhalari.id == dhalari_id).first()
    if not dhalari:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dhalari not found"
        )
    
    # Update fields
    update_data = dhalari_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dhalari, field, value)
    
    db.commit()
    db.refresh(dhalari)
    
    # Send profile updated email
    try:
        if dhalari.email:
            send_dhalari_profile_updated_email(
                email=dhalari.email,
                name=dhalari.name or "Trader"
            )
    except Exception as email_error:
        print(f"[EmailService] Error sending profile update email: {email_error}")
    
    return _get_dhalari_response(db, dhalari, str(current_dhalari.id))


@router.get("/{dhalari_id}/monthly-performance", response_model=MonthlyPerformanceResponse)
def get_monthly_performance(dhalari_id: str, db: Session = Depends(get_db)):
    """
    Get monthly deal performance for a specific dhalari.
    Returns deal counts and total values for the last 6 months.
    """
    dhalari = db.query(Dhalari).filter(Dhalari.id == dhalari_id).first()
    if not dhalari:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dhalari not found"
        )
    
    try:
        # Get last 6 months of data
        today = datetime.utcnow()
        months_data = []
        
        for i in range(5, -1, -1):  # 5 months ago to current month
            # Calculate the target month
            target_date = today - timedelta(days=i * 30)
            target_month = target_date.month
            target_year = target_date.year
            
            # Query accepted deals for this month
            month_start = datetime(target_year, target_month, 1)
            if target_month == 12:
                month_end = datetime(target_year + 1, 1, 1)
            else:
                month_end = datetime(target_year, target_month + 1, 1)
            
            # Count deals and sum values
            month_query = db.query(
                func.count(TraderRequest.id).label('deal_count'),
                func.coalesce(func.sum(TraderRequest.offered_price * TraderRequest.requested_quantity), 0).label('total_value')
            ).filter(
                TraderRequest.dhalari_id == dhalari_id,
                TraderRequest.status == "accepted",
                TraderRequest.updated_at >= month_start,
                TraderRequest.updated_at < month_end
            ).first()
            
            deal_count = month_query[0] if month_query else 0
            total_value = float(month_query[1]) if month_query else 0.0
            
            # Month name
            month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            
            months_data.append(MonthlyPerformanceItem(
                month=target_month,
                year=target_year,
                month_name=month_names[target_month],
                deal_count=deal_count,
                total_value=total_value,
                commission=total_value * 0.1  # 10% commission
            ))
        
        return MonthlyPerformanceResponse(months=months_data)
        
    except Exception as e:
        print(f"[DhalarisRouter] Error getting monthly performance: {e}")
        return MonthlyPerformanceResponse(months=[])
