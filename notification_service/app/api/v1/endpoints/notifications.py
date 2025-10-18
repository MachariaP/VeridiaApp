from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId

from app.schemas.notification import NotificationOut, NotificationMarkRead
from app.api.dependencies import get_current_user
from app.db.mongodb import get_collection

router = APIRouter()


@router.get("/", response_model=List[NotificationOut])
async def get_notifications(
    page: int = 1,
    per_page: int = 20,
    unread_only: bool = False,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    
    Args:
        page: Page number (default: 1)
        per_page: Number of items per page (default: 20, max: 100)
        unread_only: Filter to show only unread notifications
        current_user: Current authenticated user from JWT token
        
    Returns:
        List of notifications
    """
    # Validate pagination parameters
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 20
    if per_page > 100:
        per_page = 100
    
    skip = (page - 1) * per_page
    
    # Build query
    query = {"user_id": current_user["user_id"]}
    if unread_only:
        query["is_read"] = False
    
    # Retrieve from MongoDB
    collection = get_collection("notifications")
    cursor = collection.find(query).sort("timestamp", -1).skip(skip).limit(per_page)
    
    notifications = []
    async for notification in cursor:
        notification["_id"] = str(notification["_id"])
        notifications.append(NotificationOut(**notification))
    
    return notifications


@router.post("/mark-read")
async def mark_notifications_as_read(
    data: NotificationMarkRead,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Mark notifications as read.
    
    Args:
        data: List of notification IDs to mark as read
        current_user: Current authenticated user from JWT token
        
    Returns:
        Success message with count of updated notifications
    """
    collection = get_collection("notifications")
    
    # Convert string IDs to ObjectId
    try:
        object_ids = [ObjectId(id_str) for id_str in data.notification_ids]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID format"
        )
    
    # Update notifications
    result = await collection.update_many(
        {
            "_id": {"$in": object_ids},
            "user_id": current_user["user_id"]  # Ensure user owns these notifications
        },
        {"$set": {"is_read": True}}
    )
    
    return {
        "message": f"Marked {result.modified_count} notification(s) as read",
        "count": result.modified_count
    }


@router.post("/mark-all-read")
async def mark_all_as_read(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Mark all notifications as read for the current user.
    
    Args:
        current_user: Current authenticated user from JWT token
        
    Returns:
        Success message with count of updated notifications
    """
    collection = get_collection("notifications")
    
    # Update all unread notifications for the user
    result = await collection.update_many(
        {
            "user_id": current_user["user_id"],
            "is_read": False
        },
        {"$set": {"is_read": True}}
    )
    
    return {
        "message": f"Marked {result.modified_count} notification(s) as read",
        "count": result.modified_count
    }


@router.get("/unread-count")
async def get_unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get count of unread notifications for the current user.
    
    Args:
        current_user: Current authenticated user from JWT token
        
    Returns:
        Count of unread notifications
    """
    collection = get_collection("notifications")
    
    count = await collection.count_documents({
        "user_id": current_user["user_id"],
        "is_read": False
    })
    
    return {"unread_count": count}
