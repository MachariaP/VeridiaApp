# Search Service: VeridiaApp Content Search and Discovery Microservice

This microservice provides high-performance search and discovery capabilities for verified content using Elasticsearch. It represents the "Driving Discovery" aspect of VeridiaApp.

## Features
- ✅ Full-text search with fuzzy matching
- ✅ Elasticsearch integration for fast queries
- ✅ Category filtering
- ✅ Relevance-based and date-based sorting
- ✅ Pagination support
- ✅ RabbitMQ consumer for automatic indexing
- ✅ Real-time content indexing
- ✅ Public search API (no authentication required)
- ✅ CORS enabled for frontend integration
- ✅ Docker containerization

## Technologies
- **FastAPI** - Modern, fast web framework for building APIs
- **Pydantic** - Data validation using Python type annotations
- **Elasticsearch** - Search and analytics engine
- **RabbitMQ** - Message broker for event-driven indexing
- **Pika** - Python RabbitMQ client
- **Uvicorn** - ASGI server implementation

## API Endpoints

### Search
- `GET /api/v1/search/` - Search for content
  - Query params:
    - `query` (required): Search terms
    - `category` (optional): Filter by category
    - `sort_by` (optional): "relevance" (default) or "date"
    - `page` (optional): Page number (default: 1)
    - `page_size` (optional): Results per page (default: 10, max: 100)
  - Returns: Ranked search results with scores

- `GET /api/v1/search/categories` - Get available categories
  - Returns: List of all content categories

### System Endpoints
- `GET /` - Root endpoint with service information
- `GET /health` - Health check endpoint

## Setup and Running

### Prerequisites
- Python 3.11+
- Elasticsearch 8.x (local or remote instance)
- RabbitMQ (for automatic indexing)

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables (optional):
   ```bash
   export ELASTICSEARCH_URL="http://localhost:9200"
   export RABBITMQ_URL="amqp://guest:guest@localhost:5672/"
   export ELASTICSEARCH_INDEX="veridiaapp_content"
   ```

3. Start Elasticsearch (if not running):
   ```bash
   # Using Docker:
   docker run -d --name elasticsearch \
     -p 9200:9200 -p 9300:9300 \
     -e "discovery.type=single-node" \
     -e "xpack.security.enabled=false" \
     elasticsearch:8.11.0
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8003
   ```
   Or alternatively:
   ```bash
   python main.py
   ```

5. Access the API:
   - API: http://localhost:8003
   - Interactive API docs (Swagger UI): http://localhost:8003/docs
   - Alternative API docs (ReDoc): http://localhost:8003/redoc

### Docker

1. Build the Docker image:
   ```bash
   docker build -t search-service .
   ```

2. Run the container:
   ```bash
   docker run -p 8003:8003 \
     -e ELASTICSEARCH_URL="http://host.docker.internal:9200" \
     -e RABBITMQ_URL="amqp://guest:guest@host.docker.internal:5672/" \
     search-service
   ```

## Architecture

This service follows microservices best practices:
- **Event-Driven Indexing** - Automatically indexes content from RabbitMQ events
- **Full-Text Search** - Elasticsearch for fast, relevant search results
- **Fuzzy Matching** - Handles typos and variations in search queries
- **Type Safety** - Full type hints and Pydantic validation
- **Scalability** - Elasticsearch can handle millions of documents
- **Background Processing** - RabbitMQ consumer runs in background thread

## Directory Structure
```
search_service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── search.py         # Search endpoints
│   ├── core/
│   │   └── elasticsearch.py          # Elasticsearch configuration
│   ├── utils/
│   │   └── messaging.py              # RabbitMQ consumer
│   └── main.py                       # FastAPI application
├── Dockerfile
├── requirements.txt
├── main.py                           # Entry point
└── README.md
```

## Event Consumption

The service consumes `ContentCreated` events from RabbitMQ for indexing:

**Exchange:** `content_events`  
**Queue:** `search_index_queue`  
**Routing Key:** `content.created`  

**Event Payload:**
```json
{
  "event_type": "ContentCreated",
  "content_id": "string",
  "user_id": 123,
  "metadata": {
    "title": "string",
    "description": "string",
    "category": "string",
    "source_url": "string",
    "created_at": "timestamp"
  },
  "timestamp": "timestamp"
}
```

**Processing Flow:**
1. Receive ContentCreated event
2. Extract content metadata
3. Index document in Elasticsearch
4. Content is now searchable

## Elasticsearch Index

**Index Name:** `veridiaapp_content`

**Document Structure:**
```json
{
  "content_id": "string",
  "title": "text with keyword field",
  "description": "text",
  "source_url": "keyword",
  "category": "keyword",
  "status": "keyword",
  "created_by_username": "keyword",
  "created_at": "date",
  "indexed_at": "date"
}
```

**Search Features:**
- Multi-field search (title and description)
- Title field boosted 2x for relevance
- Fuzzy matching for typos (AUTO fuzziness)
- Category filtering
- Sort by relevance or date
- Pagination support

## Search Query Examples

### Basic Search
```bash
curl "http://localhost:8003/api/v1/search/?query=climate+change"
```

### Search with Category Filter
```bash
curl "http://localhost:8003/api/v1/search/?query=technology&category=Science"
```

### Search with Date Sorting
```bash
curl "http://localhost:8003/api/v1/search/?query=news&sort_by=date"
```

### Paginated Search
```bash
curl "http://localhost:8003/api/v1/search/?query=health&page=2&page_size=20"
```

### Get Categories
```bash
curl "http://localhost:8003/api/v1/search/categories"
```

## Testing

```bash
# Search for content
curl "http://localhost:8003/api/v1/search/?query=test"

# Search with filters
curl "http://localhost:8003/api/v1/search/?query=science&category=Technology&sort_by=date"

# Get available categories
curl "http://localhost:8003/api/v1/search/categories"

# Health check
curl "http://localhost:8003/health"
```

## Integration with Other Services

### content_service
- Publishes ContentCreated events
- Search service automatically indexes new content
- TODO: Listen for status updates to re-index

### verification_service
- Updates content verification status
- Search service should re-index on status changes
- Can filter search by verification status

### Frontend (frontend_app)
- Calls search API for content discovery
- Displays search results in discovery page
- Implements search UI with filters

## Performance Considerations

### Elasticsearch Optimization
- Index sharding for large datasets
- Replica shards for high availability
- Index refresh interval tuning
- Query caching

### Search Relevance
- Title field boosted for better ranking
- Fuzzy matching with AUTO fuzziness
- Multi-field search across title and description
- Can be enhanced with:
  - Custom analyzers
  - Synonyms
  - Stop words
  - Stemming rules

### Scalability
- Elasticsearch can handle millions of documents
- Horizontal scaling with multiple nodes
- Index partitioning by date or category
- Query result caching

## Future Enhancements
- Advanced filtering (date range, status, user)
- Autocomplete and suggestions
- Related content recommendations
- Search analytics and trending queries
- Personalized search results
- Geo-location based search
- Image and media search
- ML-powered relevance tuning
- Real-time indexing optimizations
- Content popularity scoring
