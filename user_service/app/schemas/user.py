from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, Literal
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)


class UserOut(BaseModel):
    """Schema for user response (excludes password)."""
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str


class TokenRefresh(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


class ProfileOut(BaseModel):
    """Schema for profile response."""
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    bio: Optional[str]
    avatar: Optional[str]
    cover_photo: Optional[str]
    location: Optional[str]
    website: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    """Schema for profile update request."""
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=160)
    avatar: Optional[str] = Field(None, max_length=512)
    cover_photo: Optional[str] = Field(None, max_length=512)
    location: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)


class SettingsOut(BaseModel):
    """Schema for settings response."""
    notifications_enabled: bool
    theme: Literal["light", "dark"]
    language: str
    privacy_posts: Literal["public", "followers", "private"]
    privacy_profile: Literal["public", "private"]
    
    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    """Schema for settings update request."""
    notifications_enabled: Optional[bool] = None
    theme: Optional[Literal["light", "dark"]] = None
    language: Optional[str] = Field(None, max_length=10)
    privacy_posts: Optional[Literal["public", "followers", "private"]] = None
    privacy_profile: Optional[Literal["public", "private"]] = None


class AccountUpdate(BaseModel):
    """Schema for account update request."""
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    current_password: str = Field(..., min_length=8, max_length=100)
