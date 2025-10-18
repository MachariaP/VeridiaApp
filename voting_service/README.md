# VeridiaApp Voting Service

Democratic voting system for content verification with vote aggregation.

## Features

- Vote on content authenticity (authentic, false, unsure)
- One vote per user per content (enforced at DB level)
- Vote aggregation and status calculation
- Real-time verification status updates
- Vote history tracking

## Technology Stack

- FastAPI for RESTful API
- PostgreSQL for transactional integrity
- SQLAlchemy ORM
- Alembic for migrations
- JWT authentication
- Python 3.11+

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- JWT_SECRET_KEY (must match user_service)

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head
```

## Running the Service

### With Docker Compose

```bash
docker-compose up -d
```

### Manual Start

```bash
# Start PostgreSQL
docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:14

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

Service will be available at http://localhost:8003

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Service status | No |
| GET | `/health` | Health check | No |
| POST | `/api/v1/votes/` | Submit a vote | Yes (JWT) |
| GET | `/api/v1/votes/content/{id}/results` | Get vote results | No |
| GET | `/api/v1/votes/user/votes` | Get user's votes | Yes (JWT) |
| GET | `/api/v1/votes/content/{id}/user-vote` | Check user vote on content | Yes (JWT) |

## Database Schema

### Vote Model

```python
- id: UUID (primary key)
- user_id: UUID (indexed)
- content_id: UUID (indexed)
- vote_type: ENUM (authentic, false, unsure)
- reasoning: TEXT (optional)
- voted_at: TIMESTAMP
- UNIQUE CONSTRAINT (user_id, content_id)
```

## Vote Aggregation Logic

- **Verified**: ≥70% authentic votes
- **False**: ≥70% false votes
- **Disputed**: Neither threshold met
- **Pending**: No votes yet

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/veridiapp_votes

# JWT Settings (must match user_service)
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# Vote thresholds
VERIFIED_THRESHOLD=0.70
FALSE_THRESHOLD=0.70

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

## API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8003/docs
- ReDoc: http://localhost:8003/redoc

## Example Usage

### Submit Vote

```bash
curl -X POST http://localhost:8003/api/v1/votes/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "123e4567-e89b-12d3-a456-426614174000",
    "vote_type": "authentic",
    "reasoning": "Source is credible and well-documented"
  }'
```

### Get Vote Results

```bash
curl http://localhost:8003/api/v1/votes/content/123e4567-e89b-12d3-a456-426614174000/results
```

## License

MIT License
