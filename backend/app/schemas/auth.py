from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class Token(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[UUID] = None
    user_type: Optional[str] = None
