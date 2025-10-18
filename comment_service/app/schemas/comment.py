from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CommentCreate(BaseModel):
    """Schema for creating a comment."""
    content_id: UUID = Field(..., description="ID of content being commented on")
    parent_comment_id: Optional[UUID] = Field(None, description="ID of parent comment for replies")
    comment_text: str = Field(..., min_length=1, max_length=5000, description="Comment text")


class CommentUpdate(BaseModel):
    """Schema for updating a comment."""
    comment_text: str = Field(..., min_length=1, max_length=5000, description="Updated comment text")


class CommentOut(BaseModel):
    """Schema for comment response."""
    id: UUID
    user_id: UUID
    content_id: UUID
    parent_comment_id: Optional[UUID] = None
    comment_text: str
    is_deleted: bool
    created_at: datetime
    replies: List["CommentOut"] = []
    
    class Config:
        from_attributes = True


# Update forward reference
CommentOut.model_rebuild()
