# VeridiaApp - API Examples

This document provides comprehensive examples of using the VeridiaApp API endpoints.

## Prerequisites

Ensure all services are running:
```bash
docker compose up
```

## Core API Gateway (Port 8000)

### 1. Health Check

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Core API Gateway",
  "timestamp": "2024-01-01T12:00:00"
}
```

### 2. User Registration

```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (201 Created):**
```json
{
  "id": "user_johndoe",
  "username": "johndoe",
  "email": "john@example.com",
  "created_at": "2024-01-01T12:00:00"
}
```

### 3. Login (Get JWT Token)

```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo&password=demo123"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Save the token:**
```bash
export TOKEN="your_access_token_here"
```

### 4. Create Content (Async Verification)

This endpoint demonstrates **asynchronous processing** - it returns immediately with HTTP 202 Accepted, while verification runs in the background.

```bash
curl -X POST http://localhost:8000/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Climate Change Facts",
    "body": "Comprehensive analysis of climate data from 1950-2024",
    "category": "science"
  }'
```

**Response (202 Accepted):**
```json
{
  "id": "content_1234567890",
  "title": "Climate Change Facts",
  "body": "Comprehensive analysis of climate data from 1950-2024",
  "category": "science",
  "status": "PENDING_VERIFICATION",
  "created_at": "2024-01-01T12:00:00",
  "author_id": "demo"
}
```

**Key Points:**
- HTTP 202 indicates async processing
- Status is `PENDING_VERIFICATION`
- AI verification runs in background
- No blocking - immediate response

### 5. Get Content

```bash
curl -X GET http://localhost:8000/content/content_1234567890 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "id": "content_1234567890",
  "title": "Climate Change Facts",
  "body": "Comprehensive analysis of climate data from 1950-2024",
  "category": "science",
  "status": "VERIFIED",
  "created_at": "2024-01-01T12:00:00",
  "author_id": "demo"
}
```

Status will change from `PENDING_VERIFICATION` → `VERIFIED` or `FLAGGED` after AI processing.

### 6. Get Current User

```bash
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "username": "demo"
}
```

## AI Verification Engine (Port 8002)

### 1. Health Check

```bash
curl http://localhost:8002/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Verification Engine",
  "timestamp": "2024-01-01T12:00:00"
}
```

### 2. Trigger Verification (Internal Use)

This endpoint is typically called by the Core API Gateway.

```bash
curl -X POST http://localhost:8002/verify \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "content_1234567890",
    "content": {
      "title": "Climate Change Facts",
      "body": "Comprehensive analysis...",
      "category": "science"
    }
  }'
```

**Response:**
```json
{
  "content_id": "content_1234567890",
  "status": "PROCESSING",
  "message": "Verification initiated, processing in background"
}
```

## Audit & Scoring Service (Port 8003)

### 1. Health Check (with Redis Status)

```bash
curl http://localhost:8003/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Audit & Scoring Service",
  "timestamp": "2024-01-01T12:00:00",
  "redis_connected": true
}
```

### 2. Create Vote (Rate Limited)

This endpoint is **rate limited** to 100 requests per 60 seconds.

```bash
curl -X POST http://localhost:8003/votes \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "content_1234567890",
    "user_id": "user_johndoe",
    "vote_type": "UPVOTE"
  }'
```

**Response:**
```json
{
  "id": "vote_1234567890",
  "content_id": "content_1234567890",
  "user_id": "user_johndoe",
  "vote_type": "UPVOTE",
  "created_at": "2024-01-01T12:00:00"
}
```

**Rate Limit Exceeded (429):**
```json
{
  "error": "Rate limit exceeded",
  "detail": "100 per 60 seconds"
}
```

### 3. Create Comment (Rate Limited)

```bash
curl -X POST http://localhost:8003/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "content_1234567890",
    "user_id": "user_johndoe",
    "text": "Great analysis! Very informative."
  }'
```

**Response:**
```json
{
  "id": "comment_1234567890",
  "content_id": "content_1234567890",
  "user_id": "user_johndoe",
  "text": "Great analysis! Very informative.",
  "created_at": "2024-01-01T12:00:00"
}
```

### 4. Get Content Score

```bash
curl http://localhost:8003/content/content_1234567890/score
```

**Response:**
```json
{
  "content_id": "content_1234567890",
  "trust_score": 0.87,
  "upvotes": 145,
  "downvotes": 12,
  "comment_count": 23,
  "verification_status": "VERIFIED"
}
```

### 5. Get Audit Logs

```bash
curl "http://localhost:8003/audit-logs?limit=5"
```

**Response:**
```json
[
  {
    "id": "audit_1234567890",
    "action": "VOTE_CREATED",
    "user_id": "user_johndoe",
    "resource_id": "content_1234567890",
    "timestamp": "2024-01-01T12:00:00",
    "metadata": {"vote_type": "UPVOTE"}
  }
]
```

## Testing Rate Limiting

### Test Redis-Based Rate Limiting

```bash
# This script will trigger rate limiting after 100 requests
for i in {1..105}; do
  echo "Request $i"
  curl -X POST http://localhost:8003/votes \
    -H "Content-Type: application/json" \
    -d "{
      \"content_id\": \"content_test\",
      \"user_id\": \"user_test\",
      \"vote_type\": \"UPVOTE\"
    }"
  echo ""
done
```

**Expected:**
- Requests 1-100: HTTP 200 (Success)
- Requests 101-105: HTTP 429 (Too Many Requests)

## Testing Async Processing

### 1. Create Content

```bash
# Create content - should return immediately
time curl -X POST http://localhost:8000/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Async",
    "body": "Testing asynchronous verification",
    "category": "test"
  }'
```

**Expected:**
- Returns in < 1 second
- HTTP 202 Accepted
- Status: PENDING_VERIFICATION

### 2. Check Status (Poll)

```bash
# Wait a few seconds, then check
sleep 3
curl http://localhost:8000/content/content_id \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- Status changed to VERIFIED or FLAGGED
- Verification completed in background

## Configuration Testing

### Frontend Runtime Configuration

The frontend uses **Runtime Configuration Injection (RCI)** to avoid rebuilds.

**1. Check current config:**
```bash
curl http://localhost:3000/config.js
```

**Response:**
```javascript
window.VERIDIA_CONFIG = {
  API_BASE_URL: 'http://localhost:8000',
  VERSION: '1.0.0',
  ENVIRONMENT: 'development'
};
```

**2. Change config without rebuild:**
```bash
# Generate new config with different API URL
cd frontend_app
export NEXT_PUBLIC_API_URL=https://api.production.com
npm run generate-config

# Verify change
cat public/config.js
```

**Key Points:**
- No rebuild needed
- Config loaded at runtime
- Enables deployment flexibility

## Database Testing

### PostgreSQL (VeridiaDB)

```bash
# Connect to database
docker exec -it veridia-postgres psql -U veridia_user -d VeridiaDB

# Inside psql:
# List tables
\dt

# Query
SELECT * FROM users LIMIT 5;

# Exit
\q
```

### Redis

```bash
# Connect to Redis
docker exec -it veridia-redis redis-cli

# Inside redis-cli:
# Test connection
PING

# Check rate limit keys
KEYS *

# Get rate limit counter
GET "slowapi:127.0.0.1"

# Exit
exit
```

## Interactive API Documentation

All services provide interactive Swagger UI documentation:

- **Core API**: http://localhost:8000/docs
- **AI Engine**: http://localhost:8002/docs
- **Audit Service**: http://localhost:8003/docs

You can test all endpoints directly from the browser!

## Complete Workflow Example

Here's a complete workflow demonstrating all features:

```bash
#!/bin/bash

# 1. Register user
echo "1. Registering user..."
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'

# 2. Get token
echo -e "\n2. Getting JWT token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo&password=demo123")
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:20}..."

# 3. Create content (async)
echo -e "\n3. Creating content (async processing)..."
CONTENT_RESPONSE=$(curl -s -X POST http://localhost:8000/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "My First Post",
    "body": "This will be verified by AI",
    "category": "general"
  }')
echo $CONTENT_RESPONSE
CONTENT_ID=$(echo $CONTENT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# 4. Vote on content
echo -e "\n4. Voting on content..."
curl -X POST http://localhost:8003/votes \
  -H "Content-Type: application/json" \
  -d "{
    \"content_id\": \"$CONTENT_ID\",
    \"user_id\": \"user_demo\",
    \"vote_type\": \"UPVOTE\"
  }"

# 5. Add comment
echo -e "\n5. Adding comment..."
curl -X POST http://localhost:8003/comments \
  -H "Content-Type: application/json" \
  -d "{
    \"content_id\": \"$CONTENT_ID\",
    \"user_id\": \"user_demo\",
    \"text\": \"Great post!\"
  }"

# 6. Get content score
echo -e "\n6. Getting content score..."
curl http://localhost:8003/content/$CONTENT_ID/score

# 7. Check audit logs
echo -e "\n7. Checking audit logs..."
curl http://localhost:8003/audit-logs?limit=3

echo -e "\n\n✅ Workflow complete!"
```

## Error Handling

### Authentication Errors

**Missing Token:**
```bash
curl http://localhost:8000/users/me
```
**Response (401):**
```json
{
  "detail": "Not authenticated"
}
```

**Invalid Token:**
```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8000/users/me
```
**Response (401):**
```json
{
  "detail": "Could not validate credentials"
}
```

### Validation Errors

**Invalid Email:**
```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "not-an-email",
    "password": "test123"
  }'
```
**Response (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

## Performance Testing

### Load Test Rate Limiting

```bash
# Install apache bench
sudo apt-get install apache2-utils

# Test rate limiting (500 requests, 10 concurrent)
ab -n 500 -c 10 -p vote.json -T application/json \
  http://localhost:8003/votes
```

### Measure Async Processing Speed

```bash
# Time content creation (should be < 1 second)
time curl -X POST http://localhost:8000/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @content.json
```

## Troubleshooting

### Check Service Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs core-api-gateway
docker compose logs ai-verification-engine
docker compose logs audit-scoring-service
```

### Verify Health

```bash
# Quick health check script
for port in 8000 8002 8003; do
  echo "Port $port: $(curl -s http://localhost:$port/health | grep -o '"status":"[^"]*"')"
done
```

---

**For more examples, visit the interactive API documentation:**
- http://localhost:8000/docs
- http://localhost:8002/docs
- http://localhost:8003/docs
