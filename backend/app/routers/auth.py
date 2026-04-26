from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from ..database import get_db
from ..models import Farmer, Dhalari
from ..schemas import FarmerCreate, FarmerResponse, DhalariCreate, DhalariResponse, Token
from ..schemas.google_auth import GoogleLoginRequest
from ..services.auth import AuthService, get_current_user
from ..services.email_service import send_dhalari_welcome_email
from ..config import get_settings

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
settings = get_settings()


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str
    user_type: str  # "farmer" or "dhalari"


@router.post("/register/farmer", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
def register_farmer(farmer_data: FarmerCreate, db: Session = Depends(get_db)):
    """Register a new farmer."""
    # Check if email already exists
    existing = db.query(Farmer).filter(Farmer.email == farmer_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    existing_phone = db.query(Farmer).filter(Farmer.phone == farmer_data.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create farmer
    hashed_password = AuthService.get_password_hash(farmer_data.password)
    farmer = Farmer(
        name=farmer_data.name,
        phone=farmer_data.phone,
        email=farmer_data.email,
        password_hash=hashed_password,
        location=farmer_data.location,
        land_size=farmer_data.land_size,
        experience=farmer_data.experience,
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer


@router.post("/register/dhalari", response_model=DhalariResponse, status_code=status.HTTP_201_CREATED)
def register_dhalari(dhalari_data: DhalariCreate, db: Session = Depends(get_db)):
    """Register a new dhalari (trader)."""
    # Check if email already exists
    existing = db.query(Dhalari).filter(Dhalari.email == dhalari_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    existing_phone = db.query(Dhalari).filter(Dhalari.phone == dhalari_data.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create dhalari
    hashed_password = AuthService.get_password_hash(dhalari_data.password)
    dhalari = Dhalari(
        name=dhalari_data.name,
        business_name=dhalari_data.business_name,
        phone=dhalari_data.phone,
        email=dhalari_data.email,
        password_hash=hashed_password,
        location=dhalari_data.location,
        specialization=dhalari_data.specialization,
        commission=dhalari_data.commission,
        experience=dhalari_data.experience,
    )
    db.add(dhalari)
    db.commit()
    db.refresh(dhalari)
    
    # Send welcome email
    send_dhalari_welcome_email(dhalari.email, dhalari.name)
    
    return dhalari


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login for both farmers and dhalaris."""
    user = None
    user_type = login_data.user_type.lower()
    
    if user_type == "farmer":
        user = AuthService.authenticate_farmer(db, login_data.email, login_data.password)
    elif user_type == "dhalari":
        user = AuthService.authenticate_dhalari(db, login_data.email, login_data.password)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user type. Must be 'farmer' or 'dhalari'"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "type": user_type},
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/google-login", response_model=Token)
def google_login(login_data: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Google Login for Dhalari."""
    try:
        # Verify Token
        id_info = id_token.verify_oauth2_token(
            login_data.id_token, 
            google_requests.Request(), 
            settings.google_client_id
        )

        email = id_info['email']
        
        # Check if user exists
        user = db.query(Dhalari).filter(Dhalari.email == email).first()
        
        if not user:
            # Auto-register new Dhalari with data from Google
            import uuid
            name = id_info.get('name', 'Google User')
            picture = id_info.get('picture')
            user = Dhalari(
                id=str(uuid.uuid4()),
                name=name,
                business_name=f"{name}'s Business",
                email=email,
                password_hash="google_oauth",
                phone=f"pending-{str(uuid.uuid4())[:8]}",
                location="Not set",
                specialization=[],
                commission=5.0,
                experience=0,
                profile_image=picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Send welcome email for new dhalari
            send_dhalari_welcome_email(email, name)

        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "type": "dhalari"},
            expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )


@router.post("/google-signup", response_model=Token)
def google_signup(login_data: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Google Signup/Login for Dhalari - Auto-registers if not exists."""
    try:
        # Verify Token
        id_info = id_token.verify_oauth2_token(
            login_data.id_token, 
            google_requests.Request(), 
            settings.google_client_id
        )

        email = id_info.get('email')
        name = id_info.get('name', 'Google User')
        picture = id_info.get('picture')
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if user exists
        user = db.query(Dhalari).filter(Dhalari.email == email).first()
        
        if not user:
            # Auto-register new User based on type
            import uuid
            
            user_type = login_data.user_type if hasattr(login_data, 'user_type') else "dhalari"
            
            if user_type == "farmer":
                # Check farmer table
                 user = db.query(Farmer).filter(Farmer.email == email).first()
                 if not user:
                    user = Farmer(
                        name=name,
                        email=email,
                        password_hash="google_oauth",
                        phone=f"pending-{str(uuid.uuid4())[:8]}",
                        location="Not set",
                        land_size=0.0,
                        experience=0,
                        profile_image=picture
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                    
            else:
                # Default to Dhalari
                user = Dhalari(
                    id=str(uuid.uuid4()),
                    name=name,
                    business_name=f"{name}'s Business",
                    email=email,
                    password_hash="google_oauth",
                    phone=f"pending-{str(uuid.uuid4())[:8]}",
                    location="Not set",
                    specialization=[],
                    commission=5.0,
                    experience=0,
                    profile_image=picture,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                # Send welcome email for new dhalari
                send_dhalari_welcome_email(email, name)

        user_type_str = "farmer" if isinstance(user, Farmer) else "dhalari"
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "type": user_type_str},
            expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")

    except ValueError as e:
        print(f"Google token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        print(f"Google signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )

@router.get("/me")
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current authenticated user information."""
    if isinstance(current_user, Farmer):
        return {"user_type": "farmer", "user": FarmerResponse.model_validate(current_user)}
    else:
        return {"user_type": "dhalari", "user": DhalariResponse.model_validate(current_user)}


class FarmerLoginRequest(BaseModel):
    action: str  # "send-otp" or "verify-otp"
    phone: str
    otp: str = None


@router.post("/farmer-login")
def farmer_login(request: FarmerLoginRequest, db: Session = Depends(get_db)):
    """
    Handle Farmer Login with OTP using decoupled FarmerLogin table.
    Action: 'send-otp' -> Generates OTP, saves to FarmerLogin.
    Action: 'verify-otp' -> Verifies OTP, updates is_verified, Returns Token.
    """
    if request.action == "send-otp":
        if not request.phone:
            raise HTTPException(status_code=400, detail="Phone number required")
        
        # Generate 6-digit OTP
        import random
        generated_otp = str(random.randint(100000, 999999))
        
        # Check if login record exists
        from ..models import FarmerLogin
        
        login_record = db.query(FarmerLogin).filter(FarmerLogin.phone_number == request.phone).first()
        
        if login_record:
            login_record.otp = generated_otp
        else:
            # Create new login record
            login_record = FarmerLogin(
                phone_number=request.phone,
                otp=generated_otp,
                is_verified=False
            )
            db.add(login_record)
            
        db.commit()
        
        # In a real app, send SMS here. For dev, return it.
        return {
            "success": True, 
            "message": "OTP sent", 
            "otpForDemo": generated_otp 
        }

    elif request.action == "verify-otp":
        if not request.phone or not request.otp:
            raise HTTPException(status_code=400, detail="Phone and OTP required")
        
        from ..models import FarmerLogin, FarmerProfile
        
        # Verify OTP against DB
        login_record = db.query(FarmerLogin).filter(FarmerLogin.phone_number == request.phone).first()
        
        if not login_record or login_record.otp != request.otp:
             raise HTTPException(status_code=401, detail="Invalid OTP")

        # Mark as verified
        login_record.is_verified = True
        
        # Ensure Profile exists
        profile = db.query(FarmerProfile).filter(FarmerProfile.farmer_id == login_record.id).first()
        if not profile:
            profile = FarmerProfile(farmer_id=login_record.id)
            db.add(profile)
        
        db.commit()
        db.refresh(login_record)
        db.refresh(profile)
        
        # Generate Token
        # We use the login_record.id (UUID) as the 'sub'
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = AuthService.create_access_token(
            data={"sub": str(login_record.id), "type": "farmer"},
            expires_delta=access_token_expires
        )
        
        return {
            "success": True,
            "user": {
                "id": str(login_record.id),
                "name": profile.name or "Farmer",
                "phone": login_record.phone_number,
                "type": "farmer",
                "is_profile_complete": profile.is_profile_complete
            },
            "access_token": access_token
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid action")
