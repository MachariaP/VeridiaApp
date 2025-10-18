# VeridiaApp Comment Service

Discussion and comment threading service for community engagement.

## Features

- Create comments and nested replies
- Threaded discussions with parent-child relationships
- XSS protection with HTML sanitization
- Soft deletion for comment management
- Role-based permissions (author or moderator can edit/delete)
- Comment history tracking

## Technology Stack

- FastAPI for RESTful API
- PostgreSQL for relational data
- SQLAlchemy ORM with threading support
- Alembic for migrations
- Bleach for XSS protection
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
docker run -d -p 5434:5432 -e POSTGRES_PASSWORD=postgres postgres:14

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

Service will be available at http://localhost:8004

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Service status | No |
| GET | `/health` | Health check | No |
| POST | `/api/v1/comments/` | Create comment | Yes (JWT) |
| GET | `/api/v1/comments/content/{id}` | Get comments for content | No |
| GET | `/api/v1/comments/{id}` | Get specific comment | No |
| PATCH | `/api/v1/comments/{id}` | Update comment | Yes (Author/Mod) |
| DELETE | `/api/v1/comments/{id}` | Delete comment | Yes (Author/Mod) |
| GET | `/api/v1/comments/user/comments` | Get user's comments | Yes (JWT) |

## Database Schema

### Comment Model

```python
- id: UUID (primary key)
- user_id: UUID (indexed)
- content_id: UUID (indexed)
- parent_comment_id: UUID (optional, foreign key to comments.id)
- comment_text: TEXT
- is_deleted: BOOLEAN (soft delete)
- created_at: TIMESTAMP
```

## XSS Protection

Comments are sanitized using Bleach library. Allowed HTML tags:
- `p`, `br`, `strong`, `em`, `u`
- `a` (with href and title attributes)
- `ul`, `ol`, `li`
- `blockquote`, `code`, `pre`

## Permissions

- **Create**: Any authenticated user
- **Read**: Anyone (including unauthenticated)
- **Update**: Comment author OR moderator/admin
- **Delete**: Comment author OR moderator/admin

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/veridiapp_comments

# JWT Settings (must match user_service)
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

## API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8004/docs
- ReDoc: http://localhost:8004/redoc

## Example Usage

### Create Comment

```bash
curl -X POST http://localhost:8004/api/v1/comments/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "123e4567-e89b-12d3-a456-426614174000",
    "comment_text": "This content seems credible based on the sources provided.",
    "parent_comment_id": null
  }'
```

### Create Reply

```bash
curl -X POST http://localhost:8004/api/v1/comments/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "123e4567-e89b-12d3-a456-426614174000",
    "comment_text": "I agree with your assessment.",
    "parent_comment_id": "987e4567-e89b-12d3-a456-426614174000"
  }'
```

### Get Comments for Content

```bash
curl http://localhost:8004/api/v1/comments/content/123e4567-e89b-12d3-a456-426614174000
```

## License

MIT License
