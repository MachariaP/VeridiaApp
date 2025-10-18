from elasticsearch import AsyncElasticsearch
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Global Elasticsearch client
es_client: Optional[AsyncElasticsearch] = None


async def get_elasticsearch() -> AsyncElasticsearch:
    """
    Get the Elasticsearch client instance.
    
    Returns:
        AsyncElasticsearch client
    """
    global es_client
    if es_client is None:
        raise RuntimeError("Elasticsearch client not initialized")
    return es_client


async def connect_elasticsearch():
    """
    Initialize connection to Elasticsearch and create index if it doesn't exist.
    """
    global es_client
    
    try:
        es_client = AsyncElasticsearch([settings.ELASTICSEARCH_URL])
        
        # Test connection
        if await es_client.ping():
            logger.info("Successfully connected to Elasticsearch")
        else:
            logger.error("Failed to connect to Elasticsearch")
            raise ConnectionError("Cannot connect to Elasticsearch")
        
        # Create index with mapping if it doesn't exist
        index_name = settings.ELASTICSEARCH_INDEX
        if not await es_client.indices.exists(index=index_name):
            await create_content_index()
            logger.info(f"Created index: {index_name}")
        else:
            logger.info(f"Index already exists: {index_name}")
            
    except Exception as e:
        logger.error(f"Error connecting to Elasticsearch: {e}")
        raise


async def disconnect_elasticsearch():
    """
    Close the Elasticsearch connection.
    """
    global es_client
    if es_client:
        await es_client.close()
        logger.info("Elasticsearch connection closed")


async def create_content_index():
    """
    Create the content_index with proper mapping for full-text search.
    """
    index_name = settings.ELASTICSEARCH_INDEX
    
    mapping = {
        "mappings": {
            "properties": {
                "content_id": {"type": "keyword"},
                "author_id": {"type": "keyword"},
                "content_url": {"type": "text"},
                "content_text": {
                    "type": "text",
                    "analyzer": "standard",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "tags": {"type": "keyword"},
                "status": {"type": "keyword"},
                "submission_date": {"type": "date"},
                "media_attachment": {"type": "text"}
            }
        },
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "analysis": {
                "analyzer": {
                    "standard": {
                        "type": "standard",
                        "stopwords": "_english_"
                    }
                }
            }
        }
    }
    
    await es_client.indices.create(index=index_name, body=mapping)


async def index_content(content_id: str, content_data: dict):
    """
    Index a content document in Elasticsearch.
    
    Args:
        content_id: Unique identifier for the content
        content_data: Dictionary containing content fields
    """
    index_name = settings.ELASTICSEARCH_INDEX
    
    try:
        await es_client.index(
            index=index_name,
            id=content_id,
            document=content_data
        )
        logger.info(f"Indexed content: {content_id}")
    except Exception as e:
        logger.error(f"Error indexing content {content_id}: {e}")
        raise


async def update_content(content_id: str, content_data: dict):
    """
    Update a content document in Elasticsearch.
    
    Args:
        content_id: Unique identifier for the content
        content_data: Dictionary containing updated fields
    """
    index_name = settings.ELASTICSEARCH_INDEX
    
    try:
        await es_client.update(
            index=index_name,
            id=content_id,
            doc=content_data
        )
        logger.info(f"Updated content: {content_id}")
    except Exception as e:
        logger.error(f"Error updating content {content_id}: {e}")
        raise


async def delete_content(content_id: str):
    """
    Delete a content document from Elasticsearch.
    
    Args:
        content_id: Unique identifier for the content
    """
    index_name = settings.ELASTICSEARCH_INDEX
    
    try:
        await es_client.delete(
            index=index_name,
            id=content_id
        )
        logger.info(f"Deleted content: {content_id}")
    except Exception as e:
        logger.error(f"Error deleting content {content_id}: {e}")
        raise


async def search_content(
    query: str,
    status: Optional[str] = None,
    tags: Optional[list] = None,
    page: int = 1,
    per_page: int = 10
):
    """
    Search for content in Elasticsearch.
    
    Args:
        query: Search query string
        status: Filter by verification status
        tags: List of tags to filter by
        page: Page number (1-indexed)
        per_page: Results per page
        
    Returns:
        Dictionary with search results and metadata
    """
    index_name = settings.ELASTICSEARCH_INDEX
    
    # Calculate pagination
    from_index = (page - 1) * per_page
    
    # Build query
    must_clauses = []
    
    # Full-text search on content_text and content_url
    if query:
        must_clauses.append({
            "multi_match": {
                "query": query,
                "fields": ["content_text^2", "content_url", "tags"],
                "type": "best_fields",
                "fuzziness": "AUTO"
            }
        })
    
    # Filter by status
    filter_clauses = []
    if status:
        filter_clauses.append({"term": {"status": status}})
    
    # Filter by tags
    if tags:
        filter_clauses.append({"terms": {"tags": tags}})
    
    # Build the full query
    if must_clauses or filter_clauses:
        search_query = {
            "bool": {
                "must": must_clauses if must_clauses else [{"match_all": {}}],
                "filter": filter_clauses
            }
        }
    else:
        search_query = {"match_all": {}}
    
    try:
        response = await es_client.search(
            index=index_name,
            query=search_query,
            from_=from_index,
            size=per_page,
            sort=[{"submission_date": {"order": "desc"}}]
        )
        
        hits = response["hits"]
        results = []
        
        for hit in hits["hits"]:
            result = hit["_source"]
            result["_id"] = hit["_id"]
            result["_score"] = hit["_score"]
            results.append(result)
        
        return {
            "results": results,
            "total": hits["total"]["value"],
            "page": page,
            "per_page": per_page,
            "pages": (hits["total"]["value"] + per_page - 1) // per_page
        }
        
    except Exception as e:
        logger.error(f"Error searching content: {e}")
        raise
