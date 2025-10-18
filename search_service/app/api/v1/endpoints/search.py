from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from app.schemas.search import SearchResponse, IndexContent
from app.db.elasticsearch import search_content, index_content, update_content, delete_content
from app.api.dependencies import get_current_user
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/query", response_model=SearchResponse)
async def search_query(
    query: str = Query(..., min_length=1, max_length=500, description="Search query string"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by verification status"),
    tags: Optional[str] = Query(None, description="Comma-separated list of tags"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Results per page")
):
    """
    Search for content using full-text search with filters.
    
    Args:
        query: Search query string
        status_filter: Optional filter by verification status
        tags: Optional comma-separated list of tags
        page: Page number (default: 1)
        per_page: Results per page (default: 10, max: 100)
        
    Returns:
        SearchResponse with matching content items
    """
    try:
        # Parse tags if provided
        tags_list = None
        if tags:
            tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        # Search Elasticsearch
        result = await search_content(
            query=query,
            status=status_filter,
            tags=tags_list,
            page=page,
            per_page=per_page
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search operation failed"
        )


@router.post("/index", status_code=status.HTTP_201_CREATED)
async def index_document(
    content: IndexContent,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Index a new content document in Elasticsearch.
    
    This endpoint is typically called internally by the Content Service
    after a new content item is created.
    
    Args:
        content: Content data to index
        current_user: Current authenticated user (from JWT)
        
    Returns:
        Success message
    """
    try:
        # Prepare content data for indexing
        content_data = content.model_dump()
        content_id = content_data.pop("content_id")
        
        # Index in Elasticsearch
        await index_content(content_id, content_data)
        
        return {
            "message": "Content indexed successfully",
            "content_id": content_id
        }
        
    except Exception as e:
        logger.error(f"Indexing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to index content"
        )


@router.put("/index/{content_id}", status_code=status.HTTP_200_OK)
async def update_document(
    content_id: str,
    content: IndexContent,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a content document in Elasticsearch.
    
    This endpoint is called when content is updated in the Content Service
    to keep the search index synchronized.
    
    Args:
        content_id: ID of content to update
        content: Updated content data
        current_user: Current authenticated user (from JWT)
        
    Returns:
        Success message
    """
    try:
        # Prepare content data for update
        content_data = content.model_dump()
        content_data.pop("content_id", None)
        
        # Update in Elasticsearch
        await update_content(content_id, content_data)
        
        return {
            "message": "Content updated successfully",
            "content_id": content_id
        }
        
    except Exception as e:
        logger.error(f"Update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update content"
        )


@router.delete("/index/{content_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    content_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a content document from Elasticsearch.
    
    This endpoint is called when content is deleted in the Content Service
    to keep the search index synchronized.
    
    Args:
        content_id: ID of content to delete
        current_user: Current authenticated user (from JWT)
        
    Returns:
        Success message
    """
    try:
        # Delete from Elasticsearch
        await delete_content(content_id)
        
        return {
            "message": "Content deleted successfully",
            "content_id": content_id
        }
        
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete content"
        )
