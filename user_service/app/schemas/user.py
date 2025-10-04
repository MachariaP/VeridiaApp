from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserIn(UserBase):
    """Schema for user registration input."""
    password: str = Field(..., min_length=8, max_length=100)


class UserOut(UserBase):
    """Schema for user output (response)."""
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for JWT token payload data."""
    username: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login input."""
    username: str
    password: str
