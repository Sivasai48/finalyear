from datetime import datetime, timedelta
from typing import Optional, Union
from uuid import UUID
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import Farmer, Dhalari
from ..schemas import TokenData

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


class AuthService:
    """Authentication service for handling user authentication."""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash."""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> TokenData:
        """Decode and validate a JWT token."""
        try:
            # print(f"DEBUG: Attempting to decode token (first 50 chars): {token[:50]}...")
            # print(f"DEBUG: Using secret_key: {settings.secret_key[:10]}... algorithm: {settings.algorithm}")
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            # print(f"DEBUG: Token decoded successfully. Payload: {payload}")
            user_id: str = payload.get("sub")
            user_type: str = payload.get("type")
            if user_id is None:
                print("DEBUG: user_id (sub) is None in token payload")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            # Try to parse as UUID, but allow string if it fails
            try:
                parsed_id = UUID(user_id)
            except ValueError:
                # If not a valid UUID, use it as-is (will be treated as string)
                parsed_id = UUID(user_id.replace("-", "")[:32].ljust(32, "0")) if len(user_id) >= 32 else None
                if parsed_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid user ID format",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
            # print(f"DEBUG: Returning TokenData with user_id={parsed_id}, user_type={user_type}")
            return TokenData(user_id=parsed_id, user_type=user_type)
        except JWTError as e:
            print(f"JWT decode error: {e}")
            print(f"DEBUG: Token that failed: {token[:100]}...")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def authenticate_farmer(db: Session, email: str, password: str) -> Optional[Farmer]:
        """Authenticate a farmer by email and password."""
        farmer = db.query(Farmer).filter(Farmer.email == email).first()
        if not farmer:
            return None
        if not AuthService.verify_password(password, farmer.password_hash):
            return None
        return farmer
    
    @staticmethod
    def authenticate_dhalari(db: Session, email: str, password: str) -> Optional[Dhalari]:
        """Authenticate a dhalari by email and password."""
        dhalari = db.query(Dhalari).filter(Dhalari.email == email).first()
        if not dhalari:
            return None
        if not AuthService.verify_password(password, dhalari.password_hash):
            return None
        return dhalari


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Union[Farmer, Dhalari, "FarmerLogin"]:
    """Get the current authenticated user from token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token_data = AuthService.decode_token(token)
    
    if token_data.user_type == "farmer":
        from ..models import FarmerLogin
        user = db.query(FarmerLogin).filter(FarmerLogin.id == str(token_data.user_id)).first()
    elif token_data.user_type == "dhalari":
        user = db.query(Dhalari).filter(Dhalari.id == str(token_data.user_id)).first()
    else:
        user = None
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[Union[Farmer, Dhalari, "FarmerLogin"]]:
    """Get the current authenticated user if token is present, else None."""
    if not token:
        return None
        
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None


async def get_current_farmer(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> "FarmerLogin":
    """Get current authenticated farmer."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token_data = AuthService.decode_token(token)
    
    if token_data.user_type != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Farmer account required."
        )
    
    from ..models import FarmerLogin
    farmer = db.query(FarmerLogin).filter(FarmerLogin.id == str(token_data.user_id)).first()
    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found"
        )
    return farmer


async def get_current_dhalari(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Dhalari:
    """Get current authenticated dhalari."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = AuthService.decode_token(token)
    
    if token_data.user_type != "dhalari":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Dhalari account required."
        )
    
    dhalari_id_str = str(token_data.user_id)
    # print(f"DEBUG: Looking up Dhalari with ID: {dhalari_id_str}")
    dhalari = db.query(Dhalari).filter(Dhalari.id == dhalari_id_str).first()
    if dhalari is None:
        print(f"DEBUG: Dhalari not found for ID: {dhalari_id_str}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dhalari not found"
        )
    return dhalari
