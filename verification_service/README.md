# Verification Service: VeridiaApp Content Verification Microservice

This microservice handles the core verification logic for content, managing community voting, discussions, and AI-assisted verification. It represents the "Fostering Community" aspect of VeridiaApp.

## Features
- ✅ Community voting system (verified/disputed votes)
- ✅ Discussion comments on content
- ✅ PostgreSQL for structured voting data
- ✅ RabbitMQ consumer for ContentCreated events
- ✅ AI verification stub (ready for ML integration)
- ✅ Status update logic based on votes
- ✅ SQLAlchemy ORM with type safety
- ✅ JWT authentication for protected endpoints
- ✅ CORS enabled for frontend integration
- ✅ Docker containerization

## Technologies
- **FastAPI** - Modern, fast web framework for building APIs
- **Pydantic** - Data validation using Python type annotations
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database for voting data
- **RabbitMQ** - Message broker for event-driven architecture
- **Pika** - Python RabbitMQ client
- **JWT (python-jose)** - JSON Web Tokens for authentication
- **Uvicorn** - ASGI server implementation

## API Endpoints

### Verification & Voting
- `POST /api/v1/verify/{content_id}/vote` - Submit verification vote (authenticated)
  - Request body: `{ "vote": true }` (true = verified, false = disputed)
  - Returns: Vote record with timestamp
  - Note: One vote per user per content (updates existing vote)

- `GET /api/v1/verify/{content_id}/votes` - Get vote statistics (public)
  - Returns: Total votes, verified/disputed counts, verification percentage

### Discussions
- `POST /api/v1/verify/{content_id}/comments` - Post discussion comment (authenticated)
  - Request body: `{ "comment": "string" }`
  - Returns: Comment with user info and timestamp

- `GET /api/v1/verify/{content_id}/comments` - Get discussion comments (public)
  - Query params: `skip` (default: 0), `limit` (default: 50)
  - Returns: List of comments ordered by newest first

### System Endpoints
- `GET /` - Root endpoint with service information
- `GET /health` - Health check endpoint

## Setup and Running

### Prerequisites
- Python 3.11+
- PostgreSQL (local or remote instance)
- RabbitMQ (for event consumption)

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables (optional):
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/veridiadb"
   export RABBITMQ_URL="amqp://guest:guest@localhost:5672/"
   export SECRET_KEY="your-secret-key-here"
   export CONTENT_SERVICE_URL="http://localhost:8001"
   ```
   Note: If DATABASE_URL is not set, SQLite will be used as fallback.

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8002
   ```
   Or alternatively:
   ```bash
   python main.py
   ```

4. Access the API:
   - API: http://localhost:8002
   - Interactive API docs (Swagger UI): http://localhost:8002/docs
   - Alternative API docs (ReDoc): http://localhost:8002/redoc

### Docker

1. Build the Docker image:
   ```bash
   docker build -t verification-service .
   ```

2. Run the container:
   ```bash
   docker run -p 8002:8002 \
     -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/veridiadb" \
     -e RABBITMQ_URL="amqp://guest:guest@host.docker.internal:5672/" \
     verification-service
   ```

## Architecture

This service follows microservices best practices:
- **Event-Driven Architecture** - Consumes ContentCreated events from RabbitMQ
- **Repository Pattern** - SQLAlchemy models with proper separation
- **JWT Authentication** - Token-based security for protected endpoints
- **Type Safety** - Full type hints and Pydantic validation
- **Dependency Injection** - FastAPI's DI system
- **Background Processing** - RabbitMQ consumer runs in background thread

## Directory Structure
```
verification_service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── verify.py          # Verification endpoints
│   ├── core/
│   │   ├── database.py                # PostgreSQL configuration
│   │   └── security.py                # JWT validation
│   ├── models/
│   │   └── verification.py            # SQLAlchemy models
│   ├── schemas/
│   │   └── verification.py            # Pydantic schemas
│   ├── utils/
│   │   ├── messaging.py               # RabbitMQ consumer
│   │   ├── ai_verification.py         # AI verification stub
│   │   └── status_updater.py          # Content status logic
│   └── main.py                        # FastAPI application
├── Dockerfile
├── requirements.txt
├── main.py                            # Entry point
└── README.md
```

## Event Consumption

The service consumes `ContentCreated` events from RabbitMQ:

**Exchange:** `content_events`  
**Queue:** `verification_queue`  
**Routing Key:** `content.created`  

**Event Payload:**
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

**Processing Flow:**
1. Receive ContentCreated event
2. Perform AI verification check (stub)
3. Determine initial status based on AI result
4. Update content status via content_service API (stub)
5. Content is now ready for community voting

## Verification Status Logic

Content status is determined by community votes:

- **Pending Community Verification** - Less than 5 votes
- **Verified** - 70% or more verified votes (minimum 5 votes)
- **Disputed** - 30% or less verified votes (minimum 5 votes)
- **Under Review** - Between 30% and 70% verified votes

## AI Verification Stub

The `perform_ai_verification()` function is currently a stub that:
- Checks for suspicious keywords in title
- Simulates a confidence score
- Returns verification recommendation

**Production Implementation Would:**
- Use NLP models for content analysis
- Check source credibility against databases
- Detect misinformation patterns
- Cross-reference with fact-checking APIs
- Analyze sentiment and bias

## Testing

```bash
# Submit a vote (requires valid JWT token)
curl -X POST http://localhost:8002/api/v1/verify/{content_id}/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"vote": true}'

# Get vote statistics
curl http://localhost:8002/api/v1/verify/{content_id}/votes

# Post a comment (requires authentication)
curl -X POST http://localhost:8002/api/v1/verify/{content_id}/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"comment": "This looks legitimate to me"}'

# Get comments
curl http://localhost:8002/api/v1/verify/{content_id}/comments
```

## Integration with Other Services

### content_service
- Consumes ContentCreated events
- Updates content status based on verification
- TODO: Call content_service API to update status

### Frontend (frontend_app)
- Calls verification API for voting
- Displays vote statistics
- Shows discussion comments
- Allows authenticated users to participate

### search_service
- Receives content status updates
- Only indexes verified content for search

## Database Schema

### verification_votes
- `id` (PK): Vote ID
- `content_id`: Content being voted on
- `user_id`: User who submitted vote
- `vote`: Boolean (true=verified, false=disputed)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### discussion_comments
- `id` (PK): Comment ID
- `content_id`: Content being discussed
- `user_id`: User who posted comment
- `username`: Username for display
- `comment`: Comment text
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Future Enhancements
- Real AI/ML model integration for verification
- Reputation system for voters
- Moderation tools for comments
- Vote weighting based on user reputation
- Detailed verification reports
- Appeal system for disputed content
- Real-time notifications via WebSocket
