# Content Submission Service

The Content Submission Service is a FastAPI-based microservice for handling content submissions in the VeridiaApp platform. It uses MongoDB for document storage and supports file uploads for media attachments.

## Features

- **Content Submission**: Submit content for verification with text, URLs, or both
- **Media Upload**: Support for file uploads (text, images, PDFs)
- **JWT Authentication**: Secure authentication using JWT tokens from the User Service
- **MongoDB Storage**: Flexible document storage for content data
- **Tag Management**: Support for content categorization with tags
- **REST API**: Clean RESTful API with automatic OpenAPI documentation

## Tech Stack

- **FastAPI**: Modern, high-performance web framework
- **MongoDB**: NoSQL document database
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation and settings management
- **python-multipart**: File upload support
- **pytest**: Testing framework

## Project Structure

```
content_service/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   └── content.py      # Content endpoints
│   │   │   └── api.py              # API router
│   │   └── dependencies.py         # Auth dependencies
│   ├── core/
│   │   ├── config.py               # Configuration
│   │   └── security.py             # JWT utilities
│   ├── db/
│   │   └── mongodb.py              # MongoDB connection
│   ├── schemas/
│   │   └── content.py              # Pydantic models
│   ├── tests/
│   │   ├── conftest.py             # Test fixtures
│   │   └── test_content.py         # Content tests
│   └── main.py                     # FastAPI application
├── docker-compose.yml              # Docker services
├── Dockerfile                      # Container config
├── requirements.txt                # Python dependencies
├── pytest.ini                      # Pytest configuration
└── README.md                       # This file
```

## Installation

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start MongoDB:
```bash
# Using Docker
docker compose up -d mongodb

# Or install MongoDB locally
# https://docs.mongodb.com/manual/installation/
```

3. Create `.env` file (optional):
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the service:
```bash
uvicorn app.main:app --reload --port 8001
```

The service will be available at http://localhost:8001

### Docker Deployment

Start all services (MongoDB + Content Service):
```bash
docker compose up -d
```

## API Documentation

Once the service is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## API Endpoints

### Root & Health

- `GET /` - Service information
- `GET /health` - Health check

### Content Management

- `POST /api/v1/content/` - Create new content submission

## Content Submission

### Create Content

**Endpoint**: `POST /api/v1/content/`

**Authentication**: Required (JWT Bearer token)

**Request Body** (multipart/form-data):
- `content_url` (optional): URL of content to verify
- `content_text` (optional): Text content to verify
- `tags` (optional): Comma-separated tags
- `media_file` (optional): Media file attachment

**Note**: At least one of `content_url` or `content_text` must be provided.

**Example using cURL**:

```bash
# With content URL and text
curl -X POST "http://localhost:8001/api/v1/content/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content_url=https://example.com/article" \
  -F "content_text=Article content here" \
  -F "tags=news,technology,ai"

# With file upload
curl -X POST "http://localhost:8001/api/v1/content/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content_text=Check this document" \
  -F "media_file=@/path/to/file.pdf" \
  -F "tags=document,verification"
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "author_id": "123",
  "content_url": "https://example.com/article",
  "content_text": "Article content here",
  "media_attachment": "/uploads/uuid-filename.pdf",
  "status": "pending",
  "tags": ["news", "technology", "ai"],
  "submission_date": "2024-10-18T08:00:00.000Z"
}
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Database name | `veridiapp_content_db` |
| `JWT_SECRET_KEY` | JWT secret key (must match user service) | **REQUIRED - no default** |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `UPLOAD_DIR` | File upload directory | `/tmp/veridiapp_uploads` |
| `MAX_UPLOAD_SIZE` | Maximum file size (bytes) | `10485760` (10MB) |

**⚠️ Security Note**: The `JWT_SECRET_KEY` environment variable MUST be set and must match the value used by the User Service. For security reasons, no default value is provided. The application will fail to authenticate requests if this is not properly configured.

## File Upload

### Supported File Types

- Text files: `.txt`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`

### File Size Limit

- Maximum: 10MB (configurable via `MAX_UPLOAD_SIZE`)

### File Storage

Files are currently stored in a local directory (`UPLOAD_DIR`). For production, consider:
- Cloud storage (AWS S3, Google Cloud Storage, Azure Blob Storage)
- CDN integration for public content
- Image optimization and processing

## Testing

Run all tests:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app --cov-report=html
```

Run specific test file:
```bash
pytest app/tests/test_content.py -v
```

## MongoDB Collections

### contents

Document structure:
```javascript
{
  _id: ObjectId("..."),
  author_id: "123",                    // User ID from JWT
  content_url: "https://...",          // Optional
  content_text: "...",                 // Optional
  media_attachment: "/uploads/...",    // Optional
  status: "pending",                   // pending, verified, disputed, false
  tags: ["tag1", "tag2"],             // Array of strings
  submission_date: ISODate("...")     // Timestamp
}
```

## Integration with User Service

This service integrates with the User Service for authentication:

1. User logs in via User Service and receives JWT token
2. User includes JWT token in Authorization header
3. Content Service validates token using shared JWT_SECRET_KEY
4. Author ID is extracted from token and used for content submission

**Important**: The `JWT_SECRET_KEY` must match between services.

## Development

### Adding New Endpoints

1. Create endpoint in `app/api/v1/endpoints/`
2. Add router to `app/api/v1/api.py`
3. Write tests in `app/tests/`
4. Update documentation

### Database Indexes

For production, consider adding indexes:
```python
# In MongoDB shell or via Motor
db.contents.createIndex({"author_id": 1})
db.contents.createIndex({"status": 1})
db.contents.createIndex({"submission_date": -1})
db.contents.createIndex({"tags": 1})
```

## Security Considerations

- JWT tokens are validated but user data is not stored locally
- File uploads are validated for type and size
- Files are stored with unique UUIDs to prevent conflicts
- Input validation via Pydantic models
- CORS configured for specific origins

## Future Enhancements

- [ ] Cloud storage integration (S3, GCS, Azure)
- [ ] Image processing and optimization
- [ ] Content retrieval endpoints (GET, LIST)
- [ ] Content update and deletion
- [ ] Advanced search and filtering
- [ ] Content versioning
- [ ] Webhook notifications
- [ ] Rate limiting
- [ ] Content moderation integration

## License

MIT License - See repository root for details

## Support

For issues or questions, please open an issue in the GitHub repository.

---

**Created By**: Phinehas Macharia  
**Last Updated**: October 2024  
**Version**: 1.0.0
