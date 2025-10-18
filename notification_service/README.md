# VeridiaApp Notification Service

## Overview

The Notification Service manages user notifications for the VeridiaApp platform. It provides RESTful APIs for fetching, managing, and marking notifications as read.

## Features

- **User Notifications**: Store and retrieve notifications for users
- **Notification Types**: Support for like, comment, follow, and system notifications
- **Mark as Read**: Individual and bulk mark as read functionality
- **Unread Count**: Track unread notification counts
- **Pagination**: Efficient pagination for notification lists
- **Filtering**: Filter by read/unread status
- **JWT Authentication**: Secure API endpoints with JWT tokens

## Tech Stack

- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database for notification storage
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation and settings management
- **python-jose**: JWT token handling

## API Endpoints

### GET /api/v1/notifications
Fetch paginated notifications for the authenticated user.

**Query Parameters:**
- `page` (int, default: 1): Page number
- `per_page` (int, default: 20, max: 100): Items per page
- `unread_only` (bool, default: false): Show only unread notifications

**Response:** Array of notification objects

### POST /api/v1/notifications/mark-read
Mark specific notifications as read.

**Body:**
```json
{
  "notification_ids": ["id1", "id2"]
}
```

**Response:**
```json
{
  "message": "Marked N notification(s) as read",
  "count": N
}
```

### POST /api/v1/notifications/mark-all-read
Mark all unread notifications as read for the current user.

**Response:**
```json
{
  "message": "Marked N notification(s) as read",
  "count": N
}
```

### GET /api/v1/notifications/unread-count
Get count of unread notifications.

**Response:**
```json
{
  "unread_count": N
}
```

## Setup

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=veridiapp_notifications

# JWT (must match user service configuration)
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
```

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

### Docker

```bash
# Build image
docker build -t veridiapp-notification-service .

# Run container
docker run -p 8005:8005 --env-file .env veridiapp-notification-service
```

## Development

### Running Locally

```bash
# Start MongoDB
docker run -d -p 27017:27017 mongo:7

# Run service
uvicorn app.main:app --reload --port 8005
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8005/docs
- ReDoc: http://localhost:8005/redoc

## MongoDB Schema

### Notification Document

```javascript
{
  "_id": ObjectId,
  "user_id": "string",           // User receiving the notification
  "type": "string",              // "like", "comment", "follow", "system"
  "sender": {                    // User who triggered the notification
    "id": "string",
    "name": "string",
    "avatar": "string"
  },
  "target": "string",            // Optional: ID of related content/user
  "message": "string",           // Notification message
  "timestamp": ISODate,          // When notification was created
  "is_read": boolean             // Read status
}
```

### Indexes

Recommended indexes for performance:
```javascript
db.notifications.createIndex({ "user_id": 1, "timestamp": -1 })
db.notifications.createIndex({ "user_id": 1, "is_read": 1 })
```

## Integration

### Creating Notifications

Other services can create notifications by directly inserting into MongoDB:

```python
from datetime import datetime, timezone

notification = {
    "user_id": "user123",
    "type": "like",
    "sender": {
        "id": "user456",
        "name": "John Doe",
        "avatar": "https://..."
    },
    "target": "post789",
    "message": "John Doe liked your post",
    "timestamp": datetime.now(timezone.utc),
    "is_read": False
}

await collection.insert_one(notification)
```

## Future Enhancements

- [ ] WebSocket support for real-time notifications
- [ ] Notification preferences and filtering
- [ ] Email notification digests
- [ ] Push notifications for mobile apps
- [ ] Notification templates
- [ ] Batch notification creation
- [ ] Notification expiration/cleanup

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## License

MIT License - See root LICENSE file
