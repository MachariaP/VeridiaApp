# VeridiaApp Search Service

Elasticsearch-powered full-text search service for content discovery.

## Features

- Full-text search with fuzzy matching
- Filter by verification status and tags
- Real-time content indexing
- Advanced search with pagination
- Synchronization with Content Service

## Technology Stack

- FastAPI for RESTful API
- Elasticsearch for full-text search
- JWT authentication
- Python 3.11+

## Prerequisites

- Python 3.11+
- Elasticsearch 8.x
- JWT_SECRET_KEY (must match user_service)

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Running the Service

### With Docker Compose

```bash
docker-compose up -d
```

### Manual Start

```bash
# Start Elasticsearch
docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

Service will be available at http://localhost:8002

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Service status | No |
| GET | `/health` | Health check | No |
| GET | `/api/v1/search/query` | Search content | No |
| POST | `/api/v1/search/index` | Index content | Yes (JWT) |
| PUT | `/api/v1/search/index/{id}` | Update indexed content | Yes (JWT) |
| DELETE | `/api/v1/search/index/{id}` | Delete indexed content | Yes (JWT) |

## Environment Variables

Create a `.env` file:

```env
# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=content_index

# JWT Settings (must match user_service)
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

## API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8002/docs
- ReDoc: http://localhost:8002/redoc

## Example Usage

### Search Content

```bash
curl "http://localhost:8002/api/v1/search/query?query=misinformation&status=verified&page=1&per_page=10"
```

### Index Content (Requires JWT)

```bash
curl -X POST http://localhost:8002/api/v1/search/index \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "123e4567-e89b-12d3-a456-426614174000",
    "author_id": "123e4567-e89b-12d3-a456-426614174001",
    "content_text": "This is content to verify",
    "tags": ["news", "politics"],
    "status": "pending",
    "submission_date": "2024-10-18T09:00:00Z"
  }'
```

## License

MIT License
