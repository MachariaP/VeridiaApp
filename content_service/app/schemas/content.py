from pydantic import BaseModel, Field, UUID4, field_validator
from typing import Optional, List
from datetime import datetime


class ContentCreate(BaseModel):
    """Schema for content submission request."""
    content_url: Optional[str] = Field(None, max_length=2048)
    content_text: Optional[str] = Field(None, max_length=10000)
    tags: List[str] = Field(default_factory=list, max_length=20)
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        """Validate tags list."""
        if len(v) > 20:
            raise ValueError('Maximum 20 tags allowed')
        # Remove duplicates and empty strings
        return list(set(tag.strip() for tag in v if tag.strip()))


class ContentOut(BaseModel):
    """Schema for content response."""
    id: str = Field(..., alias="_id")
    author_id: str
    content_url: Optional[str] = None
    content_text: Optional[str] = None
    media_attachment: Optional[str] = None
    status: str = "pending"
    tags: List[str] = []
    submission_date: datetime
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }
