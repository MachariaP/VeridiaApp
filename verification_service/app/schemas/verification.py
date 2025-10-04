"""
Pydantic schemas for verification service.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class VoteIn(BaseModel):
    """Schema for submitting a verification vote."""
    vote: bool = Field(..., description="True for verified, False for disputed")


class VoteOut(BaseModel):
    """Schema for vote output."""
    id: int
    content_id: str
    user_id: int
    vote: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class CommentIn(BaseModel):
    """Schema for creating a discussion comment."""
    comment: str = Field(..., min_length=1, max_length=2000, description="Comment text")


class CommentOut(BaseModel):
    """Schema for comment output."""
    id: int
    content_id: str
    user_id: int
    username: str
    comment: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class VoteStats(BaseModel):
    """Schema for vote statistics."""
    content_id: str
    total_votes: int
    verified_votes: int
    disputed_votes: int
    verification_percentage: float
