"""
Content API endpoints for creating, retrieving, and managing content.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from app.schemas.content import ContentIn, ContentOut
from app.core.database import get_database
from app.core.security import verify_token
from app.models.content import ContentRepository, serialize_content
from app.utils.messaging import get_event_publisher
from pymongo.database import Database


router = APIRouter()


def get_current_user(authorization: Optional[str] = Header(None)) -> tuple[str, int]:
    """
    Dependency to extract and validate JWT token from Authorization header.
    Returns username and user_id (stub for user_id - would need user_service integration).
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    
    username = verify_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # TODO: In production, call user_service to get user_id from username
    # For now, use a stub user_id based on username hash
    user_id = hash(username) % 1000000
    
    return username, user_id


@router.post("/create", response_model=ContentOut, status_code=status.HTTP_201_CREATED)
async def create_content(
    content_in: ContentIn,
    current_user: tuple = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """
    Create new content for verification.
    Requires JWT authentication.
    Publishes ContentCreated event to RabbitMQ.
    """
    username, user_id = current_user
    
    # Create content in MongoDB
    repo = ContentRepository(db)
    content_doc = repo.create_content(
        title=content_in.title,
        source_url=str(content_in.source_url),
        description=content_in.description,
        category=content_in.category,
        user_id=user_id,
        username=username
    )
    
    # Serialize for response
    content_data = serialize_content(content_doc.copy())
    content_id = content_data["id"]
    
    # Publish ContentCreated event to RabbitMQ
    event_publisher = get_event_publisher()
    event_publisher.publish_content_created(
        content_id=content_id,
        user_id=user_id,
        metadata={
            "title": content_in.title,
            "category": content_in.category,
            "source_url": str(content_in.source_url),
            "created_at": str(content_data["created_at"])
        }
    )
    
    return ContentOut(**content_data)


@router.get("/{content_id}", response_model=ContentOut)
async def get_content(
    content_id: str,
    db: Database = Depends(get_database)
):
    """
    Get content by ID.
    Public endpoint - no authentication required.
    """
    repo = ContentRepository(db)
    content_doc = repo.get_content_by_id(content_id)
    
    if not content_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content_data = serialize_content(content_doc)
    return ContentOut(**content_data)


@router.get("/mine", response_model=List[ContentOut])
async def get_my_content(
    skip: int = 0,
    limit: int = 10,
    current_user: tuple = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """
    Get all content created by the authenticated user.
    Requires JWT authentication.
    """
    username, user_id = current_user
    
    repo = ContentRepository(db)
    content_docs = repo.get_user_content(user_id, skip, limit)
    
    content_list = []
    for doc in content_docs:
        content_data = serialize_content(doc)
        content_list.append(ContentOut(**content_data))
    
    return content_list


@router.get("/", response_model=List[ContentOut])
async def list_content(
    skip: int = 0,
    limit: int = 10,
    db: Database = Depends(get_database)
):
    """
    List all content with pagination.
    Public endpoint - no authentication required.
    """
    repo = ContentRepository(db)
    content_docs = repo.get_all_content(skip, limit)
    
    content_list = []
    for doc in content_docs:
        content_data = serialize_content(doc)
        content_list.append(ContentOut(**content_data))
    
    return content_list


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: str,
    current_user: tuple = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """
    Delete content by ID.
    Only the content creator can delete their own content.
    Requires JWT authentication.
    """
    username, user_id = current_user
    
    repo = ContentRepository(db)
    content_doc = repo.get_content_by_id(content_id)
    
    if not content_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Check if user is the content creator
    if content_doc.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own content"
        )
    
    # Delete the content
    repo.delete_content(content_id)
    
    return None
