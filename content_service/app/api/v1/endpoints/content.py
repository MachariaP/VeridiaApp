from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import aiofiles
from pathlib import Path
from bson import ObjectId
from bson.errors import InvalidId

from app.schemas.content import ContentCreate, ContentOut
from app.api.dependencies import get_current_user
from app.db.mongodb import get_collection
from app.core.config import settings

router = APIRouter()


async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save uploaded file to local directory and return the path.
    
    Args:
        upload_file: The uploaded file
        
    Returns:
        The file path/URL where the file is stored
    """
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Validate file extension
    file_ext = Path(upload_file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await upload_file.read()
            # Check file size
            if len(content) > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
                )
            await f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Return placeholder URL/path
    return f"/uploads/{unique_filename}"


@router.post("/", response_model=ContentOut, status_code=status.HTTP_201_CREATED)
async def create_content(
    content_url: Optional[str] = Form(None),
    content_text: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated tags
    media_file: Optional[UploadFile] = File(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new content submission.
    
    Accepts content via form data to support file uploads.
    At least one of content_url or content_text must be provided.
    
    Args:
        content_url: Optional URL of content to verify
        content_text: Optional text content to verify
        tags: Optional comma-separated tags
        media_file: Optional media file attachment
        current_user: Current authenticated user from JWT token
        
    Returns:
        Created content document with HTTP 201 status
    """
    # Validate that at least one content field is provided
    if not content_url and not content_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of content_url or content_text must be provided"
        )
    
    # Parse tags
    tag_list = []
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        tag_list = list(set(tag_list))  # Remove duplicates
        if len(tag_list) > 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 20 tags allowed"
            )
    
    # Handle file upload
    media_attachment = None
    if media_file and media_file.filename:
        media_attachment = await save_upload_file(media_file)
    
    # Create content document
    content_data = {
        "author_id": current_user["user_id"],
        "content_url": content_url,
        "content_text": content_text,
        "media_attachment": media_attachment,
        "status": "pending",
        "tags": tag_list,
        "submission_date": datetime.now(timezone.utc)
    }
    
    # Save to MongoDB
    collection = get_collection("contents")
    result = await collection.insert_one(content_data)
    
    # Retrieve and return the created document
    created_content = await collection.find_one({"_id": result.inserted_id})
    if not created_content:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created content"
        )
    
    # Convert ObjectId to string for JSON serialization
    created_content["_id"] = str(created_content["_id"])
    
    return ContentOut(**created_content)


@router.get("/{content_id}", response_model=ContentOut)
async def get_content(content_id: str):
    """
    Retrieve a content submission by ID.
    
    Args:
        content_id: The MongoDB ObjectId of the content
        
    Returns:
        Content document
    """
    # Validate ObjectId format
    try:
        object_id = ObjectId(content_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content ID format"
        )
    
    # Retrieve from MongoDB
    collection = get_collection("contents")
    content = await collection.find_one({"_id": object_id})
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Convert ObjectId to string for JSON serialization
    content["_id"] = str(content["_id"])
    
    return ContentOut(**content)
