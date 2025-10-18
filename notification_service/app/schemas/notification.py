from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime


class NotificationCreate(BaseModel):
    """Schema for creating a notification."""
    user_id: str
    type: Literal["like", "comment", "follow", "system"]
    sender: Dict[str, Any]  # { id, name, avatar }
    target: Optional[str] = None  # e.g., post ID or user ID
    message: str


class NotificationOut(BaseModel):
    """Schema for notification response."""
    id: str = Field(..., alias="_id")
    user_id: str
    type: Literal["like", "comment", "follow", "system"]
    sender: Dict[str, Any]
    target: Optional[str] = None
    message: str
    timestamp: datetime
    is_read: bool = False
    
    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }


class NotificationMarkRead(BaseModel):
    """Schema for marking notifications as read."""
    notification_ids: list[str]
