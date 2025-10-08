"""
Pydantic schemas for content validation and serialization.
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class ContentIn(BaseModel):
    """
    Schema for creating new content.
    Enhanced validation per requirements:
    - Title: Max 250 characters
    - Description: Min 50, Max 5000 characters
    - Source URL: Must be valid URL (HTTPS preferred)
    - Category: Must be from predefined list
    """
    title: str = Field(..., min_length=1, max_length=250, description="Content title (max 250 chars)")
    source_url: HttpUrl = Field(..., description="Original source URL (HTTPS preferred)")
    description: str = Field(..., min_length=50, max_length=5000, description="Content description (50-5000 chars)")
    category: str = Field(..., description="Content category (must be from predefined list)")


class ContentOut(BaseModel):
    """Schema for content output."""
    id: str = Field(..., description="Content ID")
    title: str
    source_url: str
    description: str
    category: str
    status: str = Field(default="Pending Verification", description="Verification status")
    created_by_user_id: Optional[int] = Field(None, description="User ID who created the content")
    created_by_username: Optional[str] = Field(None, description="Username who created the content")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ContentUpdate(BaseModel):
    """Schema for updating content."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    category: Optional[str] = None
    status: Optional[str] = None
