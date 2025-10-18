from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.vote import VoteType


class VoteCreate(BaseModel):
    """Schema for creating a vote."""
    content_id: UUID = Field(..., description="ID of content to vote on")
    vote_type: VoteType = Field(..., description="Type of vote (authentic, false, unsure)")
    reasoning: Optional[str] = Field(None, max_length=1000, description="Optional reasoning for the vote")


class VoteOut(BaseModel):
    """Schema for vote response."""
    id: UUID
    user_id: UUID
    content_id: UUID
    vote_type: VoteType
    reasoning: Optional[str] = None
    voted_at: datetime
    
    class Config:
        from_attributes = True


class VoteResults(BaseModel):
    """Schema for vote aggregation results."""
    content_id: UUID
    total_votes: int
    authentic_count: int
    false_count: int
    unsure_count: int
    authentic_percentage: float
    false_percentage: float
    unsure_percentage: float
    verification_result: str


class VerificationResult(BaseModel):
    """Schema for verification status."""
    status: str = Field(..., description="Verification status (verified, false, disputed, pending)")
