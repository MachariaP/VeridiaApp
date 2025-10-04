"""
Search API endpoints for content discovery.
"""
from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from app.core.elasticsearch import get_elasticsearch_client, ELASTICSEARCH_INDEX


router = APIRouter()


class SearchResult(BaseModel):
    """Schema for search result."""
    content_id: str
    title: str
    description: str
    source_url: str
    category: str
    status: str
    created_by_username: Optional[str] = None
    created_at: Optional[str] = None
    score: float = Field(description="Relevance score")


class SearchResponse(BaseModel):
    """Schema for search response."""
    query: str
    total: int
    results: List[SearchResult]
    took_ms: int = Field(description="Search time in milliseconds")


@router.get("/", response_model=SearchResponse)
async def search_content(
    query: str = Query(..., description="Search query string", min_length=1),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: str = Query("relevance", description="Sort by: relevance, date"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Results per page")
):
    """
    Search for content using Elasticsearch full-text search.
    
    - **query**: Search terms (searches in title and description)
    - **category**: Optional category filter
    - **sort_by**: Sort results by relevance or date
    - **page**: Page number for pagination
    - **page_size**: Number of results per page (max 100)
    
    Returns ranked search results with relevance scores.
    """
    es_client = get_elasticsearch_client()
    
    # Calculate pagination
    from_index = (page - 1) * page_size
    
    # Build Elasticsearch query
    must_clauses = [
        {
            "multi_match": {
                "query": query,
                "fields": ["title^2", "description"],  # Boost title matches
                "fuzziness": "AUTO",  # Enable fuzzy matching for typos
                "operator": "or"
            }
        }
    ]
    
    # Add category filter if provided
    if category:
        must_clauses.append({
            "term": {
                "category": category
            }
        })
    
    # Build sort clause
    if sort_by == "date":
        sort_clause = [{"created_at": {"order": "desc"}}]
    else:
        sort_clause = ["_score"]  # Default: sort by relevance
    
    # Execute search
    try:
        response = es_client.search(
            index=ELASTICSEARCH_INDEX,
            body={
                "query": {
                    "bool": {
                        "must": must_clauses
                    }
                },
                "sort": sort_clause,
                "from": from_index,
                "size": page_size,
                "track_total_hits": True
            }
        )
        
        # Parse results
        results = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            results.append(SearchResult(
                content_id=source.get("content_id", ""),
                title=source.get("title", ""),
                description=source.get("description", ""),
                source_url=source.get("source_url", ""),
                category=source.get("category", ""),
                status=source.get("status", ""),
                created_by_username=source.get("created_by_username"),
                created_at=source.get("created_at"),
                score=hit["_score"]
            ))
        
        return SearchResponse(
            query=query,
            total=response["hits"]["total"]["value"],
            results=results,
            took_ms=response["took"]
        )
        
    except Exception as e:
        print(f"Search error: {e}")
        # Return empty results on error
        return SearchResponse(
            query=query,
            total=0,
            results=[],
            took_ms=0
        )


@router.get("/categories")
async def get_categories():
    """
    Get list of available content categories.
    Useful for filtering and UI dropdowns.
    """
    es_client = get_elasticsearch_client()
    
    try:
        # Aggregate to get unique categories
        response = es_client.search(
            index=ELASTICSEARCH_INDEX,
            body={
                "size": 0,
                "aggs": {
                    "categories": {
                        "terms": {
                            "field": "category",
                            "size": 50
                        }
                    }
                }
            }
        )
        
        categories = [
            bucket["key"]
            for bucket in response["aggregations"]["categories"]["buckets"]
        ]
        
        return {
            "categories": categories,
            "count": len(categories)
        }
        
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return {
            "categories": [],
            "count": 0
        }
