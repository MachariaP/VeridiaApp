# Content Service: VeridiaApp Content Management Microservice

This microservice manages the lifecycle of user-submitted content including creation, retrieval, and updates. It integrates with MongoDB for data storage and RabbitMQ for event-driven communication.

## Features
- ✅ Content creation with JWT authentication
- ✅ Public content retrieval endpoints
- ✅ User-specific content listing
- ✅ MongoDB for unstructured content storage
- ✅ RabbitMQ event publishing (ContentCreated events)
- ✅ Pydantic models for type safety
- ✅ RESTful API design
- ✅ CORS enabled for frontend integration
- ✅ Docker containerization

## Technologies
- **FastAPI** - Modern, fast web framework for building APIs
- **Pydantic** - Data validation using Python type annotations
- **MongoDB** - NoSQL database for content documents
- **PyMongo** - MongoDB driver for Python
- **RabbitMQ** - Message broker for inter-service communication
- **Pika** - Python RabbitMQ client
- **JWT (python-jose)** - JSON Web Tokens for authentication
- **Uvicorn** - ASGI server implementation

## API Endpoints

### Content Management
- `POST /api/v1/content/create` - Create new content (authenticated)
  - Request body: `{ "title": "string", "source_url": "url", "description": "string", "category": "string" }`
  - Returns: Created content with ID and status
  - Publishes ContentCreated event to RabbitMQ

- `GET /api/v1/content/{id}` - Get content by ID (public)
  - Returns: Content details

- `GET /api/v1/content/mine` - Get user's content (authenticated)
  - Query params: `skip` (default: 0), `limit` (default: 10)
  - Returns: List of content created by authenticated user

- `GET /api/v1/content/` - List all content (public)
  - Query params: `skip` (default: 0), `limit` (default: 10)
  - Returns: Paginated list of all content

### System Endpoints
- `GET /` - Root endpoint with service information
- `GET /health` - Health check endpoint

## Setup and Running

### Prerequisites
- Python 3.11+
- MongoDB (local or remote instance)
- RabbitMQ (optional for event publishing)

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables (optional):
   ```bash
   export MONGODB_URL="mongodb://localhost:27017"
   export MONGODB_DB_NAME="veridiadb"
   export RABBITMQ_URL="amqp://guest:guest@localhost:5672/"
   export SECRET_KEY="your-secret-key-here"
   export USER_SERVICE_URL="http://localhost:8000"
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```
   Or alternatively:
   ```bash
   python main.py
   ```

4. Access the API:
   - API: http://localhost:8001
   - Interactive API docs (Swagger UI): http://localhost:8001/docs
   - Alternative API docs (ReDoc): http://localhost:8001/redoc

### Docker

1. Build the Docker image:
   ```bash
   docker build -t content-service .
   ```

2. Run the container:
   ```bash
   docker run -p 8001:8001 \
     -e MONGODB_URL="mongodb://host.docker.internal:27017" \
     -e RABBITMQ_URL="amqp://guest:guest@host.docker.internal:5672/" \
     content-service
   ```

## Architecture

This service follows microservices best practices:
- **Repository Pattern** - Data access layer abstraction
- **Event-Driven Architecture** - RabbitMQ for async communication
- **JWT Authentication** - Token-based security
- **Type Safety** - Full type hints and Pydantic validation
- **Dependency Injection** - FastAPI's DI system
- **RESTful Design** - Clear, consistent API endpoints

## Directory Structure
```
content_service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── content.py        # Content endpoints
│   ├── core/
│   │   ├── database.py               # MongoDB configuration
│   │   └── security.py               # JWT validation
│   ├── models/
│   │   └── content.py                # MongoDB repository
│   ├── schemas/
│   │   └── content.py                # Pydantic schemas
│   ├── utils/
│   │   └── messaging.py              # RabbitMQ publisher
│   └── main.py                       # FastAPI application
├── Dockerfile
├── requirements.txt
├── main.py                           # Entry point
└── README.md
```

## Event Publishing

When content is created, the service publishes a `ContentCreated` event to RabbitMQ:

**Exchange:** `content_events`  
**Routing Key:** `content.created`  
**Payload:**
```json
{
  "event_type": "ContentCreated",
  "content_id": "string",
  "user_id": 123,
  "metadata": {
    "title": "string",
    "category": "string",
    "source_url": "string",
    "created_at": "timestamp"
  },
  "timestamp": "timestamp"
}
```

This event is consumed by:
- **verification_service** - Initiates verification pipeline
- **search_service** - Indexes content for search (after verification)

## Testing

```bash
# Create content (requires valid JWT token from user_service)
curl -X POST http://localhost:8001/api/v1/content/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Test Content",
    "source_url": "https://example.com/article",
    "description": "This is a test content submission",
    "category": "Technology"
  }'

# Get content by ID
curl http://localhost:8001/api/v1/content/{content_id}

# Get user's content (requires authentication)
curl http://localhost:8001/api/v1/content/mine \
  -H "Authorization: Bearer <your-token>"

# List all content
curl http://localhost:8001/api/v1/content/
```

## Integration with Other Services

### user_service
- Validates JWT tokens for authenticated endpoints
- TODO: Call user_service API to get full user details

### verification_service
- Consumes ContentCreated events
- Initiates verification workflow
- Updates content status

### Frontend (frontend_app)
- Calls content API for creation and retrieval
- Displays content in UI
- Manages user content submissions

## Future Enhancements
- Full integration with user_service for user details
- Content update and deletion endpoints
- Advanced filtering and search within service
- Content versioning
- File upload support for media content
- Rate limiting for content creation
