from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ContentSearch(BaseModel):
    """Schema for content search requests."""
    query: str = Field(..., min_length=1, max_length=500, description="Search query string")
    status: Optional[str] = Field(None, description="Filter by verification status")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    page: int = Field(1, ge=1, description="Page number")
    per_page: int = Field(10, ge=1, le=100, description="Results per page")


class ContentResult(BaseModel):
    """Schema for content search result."""
    _id: str
    content_id: str
    author_id: str
    content_url: Optional[str] = None
    content_text: Optional[str] = None
    tags: List[str] = []
    status: str
    submission_date: datetime
    media_attachment: Optional[str] = None
    _score: Optional[float] = None


class SearchResponse(BaseModel):
    """Schema for search response."""
    results: List[ContentResult]
    total: int
    page: int
    per_page: int
    pages: int


class IndexContent(BaseModel):
    """Schema for indexing content in Elasticsearch."""
    content_id: str
    author_id: str
    content_url: Optional[str] = None
    content_text: Optional[str] = None
    tags: List[str] = []
    status: str = "pending"
    submission_date: datetime
    media_attachment: Optional[str] = None
