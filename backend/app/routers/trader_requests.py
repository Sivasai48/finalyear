from typing import List, Union
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import TraderRequest, Crop, Farmer, Dhalari, Notification
from ..models.trader_request import RequestStatus
from ..models.notification import UserType, NotificationType
from ..schemas import TraderRequestCreate, TraderRequestUpdate, TraderRequestResponse
from ..schemas.trader_request import TraderRequestWithDetails, RequestStats
from ..services.auth import get_current_user, get_current_farmer, get_current_dhalari
from ..services.email_service import (
    send_deal_status_email_to_dhalari,
    send_contact_response_email_to_dhalari,
    send_new_deal_request_email_to_farmer,
    send_contact_request_email_to_farmer,
    send_deal_accepted_email_to_farmer
)

router = APIRouter(prefix="/api/trader-requests", tags=["Trader Requests"])


@router.get("", response_model=List[TraderRequestWithDetails])
async def get_all_requests(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Get all trader requests with optional status filter."""
    query = db.query(TraderRequest)
    
    if status:
        query = query.filter(TraderRequest.status == status)
    
    requests = query.order_by(TraderRequest.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add details
    result = []
    for req in requests:
        req_dict = TraderRequestResponse.model_validate(req).model_dump()
        req_dict["dhalari_name"] = req.dhalari.name if req.dhalari else None
        req_dict["dhalari_phone"] = req.dhalari.phone if req.dhalari else None
        
        # Initialize farmer details as None
        req_dict["farmer_name"] = None
        req_dict["farmer_phone"] = None
        
        # Get farmer details from FarmerProfile and FarmerLogin
        if req.farmer_id:
            from ..models import FarmerProfile, FarmerLogin
            # Get name from FarmerProfile
            profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == req.farmer_id).first()
            if profile and profile.name:
                req_dict["farmer_name"] = profile.name
            else:
                req_dict["farmer_name"] = "Farmer"
            
            # Get phone from FarmerLogin
            farmer_login = db.query(FarmerLogin).filter(FarmerLogin.id == req.farmer_id).first()
            if farmer_login:
                req_dict["farmer_phone"] = farmer_login.phone_number

        req_dict["crop_name"] = req.crop.name if req.crop else None
        req_dict["crop_type"] = req.crop.name if req.crop else None
        result.append(TraderRequestWithDetails(**req_dict))
    
    return result


@router.post("", response_model=TraderRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_data: TraderRequestCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trader request. Dhalaris can request deals/contact. Farmers can request contact."""
    
    # Debug logging
    print(f"DEBUG [create_request]: Received request_data: {request_data}")
    print(f"DEBUG [create_request]: current_user type: {type(current_user)}, id: {current_user.id}")
    
    # Identify user role
    # current_user can be FarmerLogin or Dhalari
    from ..models import FarmerLogin
    is_dhalari = isinstance(current_user, Dhalari)
    is_farmer = isinstance(current_user, (Farmer, FarmerLogin))
    
    print(f"DEBUG [create_request]: is_dhalari: {is_dhalari}, is_farmer: {is_farmer}")
    print(f"DEBUG [create_request]: request_type: {request_data.request_type}")

    if request_data.request_type == 'crop_deal':
        if not is_dhalari:
            print(f"DEBUG [create_request]: User is not a Dhalari - rejecting crop_deal request")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Dhalaris can initiate crop deals"
            )
        print(f"DEBUG [create_request]: Comparing dhalari_id from request '{request_data.dhalari_id}' with current_user.id '{str(current_user.id)}'")
        if request_data.dhalari_id != str(current_user.id):
            print(f"DEBUG [create_request]: ID mismatch! request.dhalari_id={request_data.dhalari_id}, current_user.id={str(current_user.id)}")
            raise HTTPException(status_code=403, detail="ID mismatch")
            
    elif request_data.request_type == 'contact':
        if is_dhalari and request_data.dhalari_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="ID mismatch")
        if is_farmer and request_data.farmer_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="ID mismatch")
    
    crop = None
    if request_data.crop_id:
        # Verify crop exists
        crop = db.query(Crop).filter(Crop.id == request_data.crop_id).first()
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop not found"
            )
    
    # Determine sender_type
    if request_data.request_type == 'contact':
        determined_sender_type = 'farmer' if is_farmer else 'dhalari'
    else:
        determined_sender_type = 'dhalari'  # crop_deal is always initiated by dhalari
    
    # Create request
    try:
        trader_request = TraderRequest(
            dhalari_id=request_data.dhalari_id,
            crop_id=request_data.crop_id,
            farmer_id=request_data.farmer_id,
            request_type=request_data.request_type,
            sender_type=determined_sender_type,
            requested_quantity=request_data.requested_quantity,
            offered_price=request_data.offered_price,
            message=request_data.message
        )
        db.add(trader_request)
        
        # Create notification
        if request_data.request_type == 'contact':
            # If Sender is Farmer -> Notify Dhalari
            if is_farmer:
                 farmer_name = "Farmer"
                 if hasattr(current_user, 'name'): # Old Farmer model
                    farmer_name = current_user.name
                 else: # New FarmerLogin model, fetch profile
                     from ..models import FarmerProfile
                     profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == str(current_user.id)).first()
                     if profile and profile.name:
                         farmer_name = profile.name
                 
                 notification = Notification(
                    user_id=request_data.dhalari_id,
                    user_type=UserType.DHALARI,
                    type=NotificationType.NEW_REQUEST,
                    title="New Contact Request",
                    message=f"Farmer {farmer_name} wants to connect with you.",
                    farmer_name=farmer_name,
                )
            # If Sender is Dhalari -> Notify Farmer
            else:
                 notification = Notification(
                    user_id=request_data.farmer_id,
                    user_type=UserType.FARMER,
                    type=NotificationType.NEW_REQUEST,
                    title="New Contact Request",
                    message=f"{current_user.business_name} wants to connect with you.",
                    dhalari_name=current_user.business_name,
                )
        else:
            # Crop Deal (Dhalari -> Farmer)
            if not crop:
                 raise HTTPException(status_code=400, detail="Crop required for crop deal")
                 
            notification = Notification(
                user_id=crop.farmer_id,
                user_type=UserType.FARMER,
                type=NotificationType.NEW_REQUEST,
                title="New Purchase Request",
                message=f"{current_user.business_name} wants to buy {request_data.requested_quantity} tons of {crop.name}",
                crop_name=crop.name,
                dhalari_name=current_user.business_name,
                amount=(request_data.offered_price or 0) * (request_data.requested_quantity or 0)
            )
        db.add(notification)
        
        db.commit()
        db.refresh(trader_request)
        
        # Send email notification to farmer
        try:
            from ..models import FarmerProfile, FarmerLogin
            farmer_id = crop.farmer_id if crop else request_data.farmer_id
            farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == farmer_id).first()
            farmer_login = db.query(FarmerLogin).filter(FarmerLogin.id == farmer_id).first()
            
            if farmer_profile and farmer_profile.email:
                farmer_email = farmer_profile.email
                farmer_name = farmer_profile.name or "Farmer"
                
                if request_data.request_type == "crop_deal" and crop:
                    send_new_deal_request_email_to_farmer(
                        email=farmer_email,
                        farmer_name=farmer_name,
                        dhalari_name=current_user.name,
                        dhalari_phone=current_user.phone,
                        crop_name=crop.name,
                        quantity=request_data.requested_quantity or 0,
                        price=request_data.offered_price or 0,
                        message=request_data.message or ""
                    )
                else:
                    send_contact_request_email_to_farmer(
                        email=farmer_email,
                        farmer_name=farmer_name,
                        dhalari_name=current_user.name,
                        dhalari_phone=current_user.phone,
                        message=request_data.message or ""
                    )
        except Exception as email_error:
            print(f"[EmailService] Error sending email to farmer: {email_error}")
        
        return trader_request
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error creating request: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{request_id}", response_model=TraderRequestWithDetails)
async def get_request(request_id: str, db: Session = Depends(get_db)):
    """Get a specific trader request by ID."""
    req = db.query(TraderRequest).filter(TraderRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    req_dict = TraderRequestResponse.model_validate(req).model_dump()
    req_dict["dhalari_name"] = req.dhalari.name if req.dhalari else None
    req_dict["dhalari_phone"] = req.dhalari.phone if req.dhalari else None
    req_dict["farmer_name"] = req.crop.farmer.name if req.crop and req.crop.farmer else None
    req_dict["farmer_phone"] = req.crop.farmer.phone if req.crop and req.crop.farmer else None
    req_dict["crop_name"] = req.crop.name if req.crop else None
    req_dict["crop_type"] = req.crop.name if req.crop else None
    return TraderRequestWithDetails(**req_dict)


@router.put("/{request_id}", response_model=TraderRequestResponse)
async def update_request_status(
    request_id: str,
    update_data: TraderRequestUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update request status. Only the farmer who owns the crop can accept/decline."""
    # Ensure user is farmer
    from ..models import FarmerLogin
    if not isinstance(current_user, (Farmer, FarmerLogin)):
         raise HTTPException(status_code=403, detail="Only farmers can update request status")
    """Update request status. Only the farmer who owns the crop can accept/decline."""
    req = db.query(TraderRequest).filter(TraderRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Verify current farmer owns the crop
    if req.farmer_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update requests for your own crops"
        )
    
    # Update status
    req.status = update_data.status
    if update_data.message:
        req.message = update_data.message
    
    # Create notification for dhalari
    farmer_name = "Farmer"
    from ..models import FarmerProfile
    profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == str(current_user.id)).first()
    if profile and profile.name:
         farmer_name = profile.name

    notification_type = NotificationType.DEAL_ACCEPTED if update_data.status == RequestStatus.ACCEPTED else NotificationType.DEAL_DECLINED
    notification = Notification(
        user_id=req.dhalari_id,
        user_type=UserType.DHALARI,
        type=notification_type,
        title=f"Request {update_data.status.value.capitalize()}",
        message=f"{farmer_name} has {update_data.status.value} your request for {req.crop.name}" if req.crop else f"{farmer_name} has {update_data.status.value} your request",
        crop_name=req.crop.name if req.crop else None,
        farmer_name=farmer_name,
        amount=(req.offered_price or 0) * (req.requested_quantity or 0)
    )
    db.add(notification)
    
    db.commit()
    db.refresh(req)
    
    # Send email notifications
    try:
        from ..models import FarmerProfile, FarmerLogin
        dhalari = db.query(Dhalari).filter(Dhalari.id == req.dhalari_id).first()
        farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == req.farmer_id).first()
        farmer_login = db.query(FarmerLogin).filter(FarmerLogin.id == req.farmer_id).first()
        
        crop_name = req.crop.name if req.crop else "Crop"
        quantity = req.requested_quantity or 0
        price = req.offered_price or 0
        farmer_phone = farmer_login.phone_number if farmer_login else "N/A"
        
        # Email to dhalari about status update
        if dhalari and dhalari.email:
            if req.request_type == "crop_deal":
                send_deal_status_email_to_dhalari(
                    email=dhalari.email,
                    dhalari_name=dhalari.name,
                    farmer_name=farmer_name,
                    crop_name=crop_name,
                    quantity=quantity,
                    price=price,
                    status=update_data.status.value
                )
            else:
                send_contact_response_email_to_dhalari(
                    email=dhalari.email,
                    dhalari_name=dhalari.name,
                    farmer_name=farmer_name,
                    farmer_phone=farmer_phone,
                    status=update_data.status.value
                )
        
        # Email to farmer confirming their action (for accepted deals)
        if update_data.status == RequestStatus.ACCEPTED:
            if farmer_profile and farmer_profile.email and dhalari:
                send_deal_accepted_email_to_farmer(
                    email=farmer_profile.email,
                    farmer_name=farmer_name,
                    dhalari_name=dhalari.name,
                    dhalari_phone=dhalari.phone,
                    crop_name=crop_name,
                    quantity=quantity,
                    price=price
                )
    except Exception as email_error:
        print(f"[EmailService] Error sending status update emails: {email_error}")
    
    return req


@router.get("/farmer/{farmer_id}", response_model=List[dict])
async def get_farmer_requests(farmer_id: str, db: Session = Depends(get_db)):
    """Get requests RECEIVED by a specific farmer (sent by dhalaris)."""
    try:
        print("DEBUG: Executing query...")
        try:
            # Only get requests where dhalari initiated OR legacy rows with NULL sender_type
            # These are requests the farmer RECEIVED
            query = db.query(TraderRequest).filter(
                TraderRequest.farmer_id == farmer_id,
                or_(TraderRequest.sender_type != 'farmer', TraderRequest.sender_type.is_(None))
            ).order_by(TraderRequest.created_at.desc())
            requests = query.all()
            print(f"DEBUG: Query executed. Found {len(requests)}")
        except Exception as e:
            print(f"DEBUG: Query execute failed: {e}")
            raise e
            
        result = []
        for i, req in enumerate(requests):
            print(f"DEBUG: Processing row {i} - ID {req.id}")
            try:
                # Type inspection
                print(f"DEBUG: Status type: {type(req.status)} Value: {req.status}")
                
                # Manually construct to bypass validation errors for debugging
                req_dict = {
                    "id": req.id,
                    "dhalari_id": req.dhalari_id,
                    "farmer_id": req.farmer_id,
                    "request_type": req.request_type,
                    "crop_id": req.crop_id,
                    "requested_quantity": req.requested_quantity,
                    "offered_price": req.offered_price,
                    "message": req.message,
                    "status": str(req.status).lower(), 
                    "created_at": req.created_at,
                    "updated_at": req.updated_at
                }
                
                # Helper to get Dhalari info safely
                dhalari_name = "Unknown Dealer"
                dhalari_phone = "N/A"
                
                if req.dhalari:
                    dhalari_name = req.dhalari.name
                    dhalari_phone = req.dhalari.phone
                elif req.dhalari_id:
                     dhalari = db.query(Dhalari).filter(Dhalari.id == req.dhalari_id).first()
                     if dhalari:
                         dhalari_name = dhalari.name
                         dhalari_phone = dhalari.phone
                
                req_dict["dhalari_name"] = dhalari_name
                req_dict["dhalari_phone"] = dhalari_phone
                
                # Farmer info
                req_dict["farmer_name"] = "Farmer" # simplified for debug
                req_dict["farmer_phone"] = "N/A"
                req_dict["crop_name"] = req.crop.name if req.crop else "General"
                req_dict["crop_type"] = "General"

                result.append(req_dict)
            except Exception as row_e:
                 print(f"DEBUG: Row {i} processing failed: {row_e}")
        
        return result
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        # print(f"Error fetching farmer requests: {e}")
        # return []
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}")


@router.get("/farmer/{farmer_id}/sent", response_model=List[dict])
async def get_farmer_sent_requests(farmer_id: str, db: Session = Depends(get_db)):
    """Get contact requests SENT by a farmer to dhalaris."""
    try:
        # Import here to avoid circular imports
        from ..models import FarmerProfile, FarmerLogin
        
        # The farmer sends contact requests where they are the one initiating
        # We need to find requests where farmer initiated contact to dhalari
        # In the current schema, when a farmer sends a contact request:
        # - farmer_id = the farmer sending
        # - dhalari_id = the dhalari receiving
        # - request_type = 'contact'
        
        # Get all contact requests where this farmer is the sender
        requests = db.query(TraderRequest).filter(
            TraderRequest.farmer_id == farmer_id,
            TraderRequest.request_type == "contact",
            TraderRequest.sender_type == "farmer"  # Only requests the farmer actually sent
        ).order_by(TraderRequest.created_at.desc()).all()
        
        result = []
        for req in requests:
            dhalari_name = "Unknown Dealer"
            dhalari_phone = "N/A"
            
            if req.dhalari_id:
                dhalari = db.query(Dhalari).filter(Dhalari.id == req.dhalari_id).first()
                if dhalari:
                    dhalari_name = dhalari.name or dhalari.business_name
                    dhalari_phone = dhalari.phone
            
            result.append({
                "id": req.id,
                "dhalari_id": req.dhalari_id,
                "dhalari_name": dhalari_name,
                "dhalari_phone": dhalari_phone,
                "status": str(req.status).lower(),
                "message": req.message,
                "created_at": req.created_at
            })
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error fetching farmer sent requests: {e}")
        return []


@router.get("/dhalari/{dhalari_id}", response_model=List[TraderRequestWithDetails])
async def get_dhalari_requests(dhalari_id: str, db: Session = Depends(get_db)):
    """Get all requests SENT by a specific dhalari (excludes requests received from farmers)."""
    try:
        # Only get requests initiated by the dhalari (sender_type='dhalari' or crop_deal or legacy NULL)
        requests = db.query(TraderRequest).filter(
            TraderRequest.dhalari_id == dhalari_id,
            or_(TraderRequest.sender_type != 'farmer', TraderRequest.sender_type.is_(None))
        ).order_by(TraderRequest.created_at.desc()).all()
        
        result = []
        for req in requests:
            req_dict = TraderRequestResponse.model_validate(req).model_dump()
            req_dict["dhalari_name"] = req.dhalari.name if req.dhalari else None
            req_dict["dhalari_phone"] = req.dhalari.phone if req.dhalari else None
            
            # Initialize farmer details as None
            req_dict["farmer_name"] = None
            req_dict["farmer_phone"] = None
            
            # Get farmer details from FarmerProfile and FarmerLogin
            if req.farmer_id:
                from ..models import FarmerProfile, FarmerLogin
                # Get name from FarmerProfile
                profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == req.farmer_id).first()
                if profile and profile.name:
                    req_dict["farmer_name"] = profile.name
                else:
                    req_dict["farmer_name"] = "Farmer"
                
                # Get phone from FarmerLogin
                farmer_login = db.query(FarmerLogin).filter(FarmerLogin.id == req.farmer_id).first()
                if farmer_login:
                    req_dict["farmer_phone"] = farmer_login.phone_number

            req_dict["crop_name"] = req.crop.name if req.crop else None
            req_dict["crop_type"] = req.crop.name if req.crop else None
            result.append(TraderRequestWithDetails(**req_dict))
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error fetching dhalari requests: {e}")
        return []


@router.get("/dhalari/{dhalari_id}/received", response_model=List[dict])
async def get_dhalari_received_requests(dhalari_id: str, db: Session = Depends(get_db)):
    """Get contact requests RECEIVED by a dhalari from farmers."""
    try:
        # Get contact requests where dhalari is the recipient (farmer sent to dhalari)
        requests = db.query(TraderRequest).filter(
            TraderRequest.dhalari_id == dhalari_id,
            TraderRequest.request_type == "contact",
            TraderRequest.sender_type == "farmer"  # Only requests farmers actually sent to this dhalari
        ).order_by(TraderRequest.created_at.desc()).all()
        
        result = []
        for req in requests:
            from ..models import FarmerProfile, FarmerLogin
            
            farmer_name = "Farmer"
            farmer_phone = "N/A"
            
            if req.farmer_id:
                profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == req.farmer_id).first()
                if profile and profile.name:
                    farmer_name = profile.name
                
                farmer_login = db.query(FarmerLogin).filter(FarmerLogin.id == req.farmer_id).first()
                if farmer_login:
                    farmer_phone = farmer_login.phone_number
            
            result.append({
                "id": req.id,
                "farmer_id": req.farmer_id,
                "farmer_name": farmer_name,
                "farmer_phone": farmer_phone,
                "status": str(req.status).lower(),
                "message": req.message,
                "created_at": req.created_at
            })
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error fetching dhalari received requests: {e}")
        return []


@router.put("/{request_id}/dhalari-respond", response_model=TraderRequestResponse)
async def dhalari_respond_to_request(
    request_id: str,
    update_data: TraderRequestUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allow dhalari to accept/decline contact requests from farmers."""
    # Ensure user is dhalari
    if not isinstance(current_user, Dhalari):
        raise HTTPException(status_code=403, detail="Only dhalaris can respond to contact requests sent to them")
    
    req = db.query(TraderRequest).filter(TraderRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Verify this request is for the current dhalari
    if req.dhalari_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only respond to requests sent to you"
        )
    
    # Only allow responding to contact requests
    if req.request_type != "contact":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This endpoint is only for contact requests"
        )
    
    # Update status
    req.status = update_data.status
    if update_data.message:
        req.message = update_data.message
    
    # Create notification for farmer
    dhalari_name = current_user.business_name or current_user.name
    notification_type = NotificationType.DEAL_ACCEPTED if update_data.status == RequestStatus.ACCEPTED else NotificationType.DEAL_DECLINED
    notification = Notification(
        user_id=req.farmer_id,
        user_type=UserType.FARMER,
        type=notification_type,
        title=f"Contact Request {update_data.status.value.capitalize()}",
        message=f"{dhalari_name} has {update_data.status.value} your contact request",
        dhalari_name=dhalari_name
    )
    db.add(notification)
    
    db.commit()
    db.refresh(req)
    
    return req



@router.get("/stats/{farmer_id}", response_model=RequestStats)
async def get_request_stats(farmer_id: str, db: Session = Depends(get_db)):
    """Get request statistics for a farmer."""
    requests = db.query(TraderRequest).filter(TraderRequest.farmer_id == farmer_id).all()
    
    return RequestStats(
        total=len(requests),
        pending=len([r for r in requests if r.status == RequestStatus.PENDING]),
        accepted=len([r for r in requests if r.status == RequestStatus.ACCEPTED]),
        declined=len([r for r in requests if r.status == RequestStatus.DECLINED])
    )
