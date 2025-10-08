# API Enhancements Documentation

## Overview

This document outlines the API enhancements made to VeridiaApp to support the comprehensive requirements for establishing a best-in-class information ecosystem. All enhancements follow RESTful principles and maintain backward compatibility.

---

## Table of Contents

1. [User Service Enhancements](#user-service-enhancements)
2. [Content Service Enhancements](#content-service-enhancements)
3. [Verification Service Enhancements](#verification-service-enhancements)
4. [Search Service Enhancements](#search-service-enhancements)

---

## User Service Enhancements

**Base URL**: `http://localhost:8000/api/v1`

### New Endpoints

#### 1. Export User Data (GDPR Article 20)

```http
GET /gdpr/export
Authorization: Bearer <jwt_token>
```

**Description**: Export all user data in machine-readable format

**Response** (200 OK):
```json
{
  "profile": {
    "id": 123,
    "username": "alice",
    "email": "alice@example.com",
    "role": "standard",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "audit_logs": [
    {
      "action": "user_registered",
      "resource_type": "user",
      "resource_id": "123",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "action": "data_exported",
      "resource_type": "user",
      "resource_id": "123",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Delete User Account (GDPR Article 17)

```http
DELETE /gdpr/account
Authorization: Bearer <jwt_token>
```

**Description**: Permanently delete user account and all associated data

**Response** (204 No Content)

**Notes**:
- Triggers cross-service deletion via event bus
- Preserves anonymized aggregate statistics
- Logs deletion request for compliance

### Enhanced Endpoints

#### User Profile with Role

```http
GET /auth/me
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "id": 123,
  "username": "alice",
  "email": "alice@example.com",
  "is_active": true,
  "role": "standard"  // NEW: User role for RBAC
}
```

**Role Values**:
- `"standard"` - Default user
- `"verified_contributor"` - Trusted contributor with priority queue
- `"moderator"` - Community moderator with elevated permissions

---

## Content Service Enhancements

**Base URL**: `http://localhost:8001/api/v1`

### New Endpoints

#### Get Valid Categories

```http
GET /content/categories
```

**Description**: Get list of valid content categories for submission

**Response** (200 OK):
```json
[
  "Technology",
  "Science",
  "Health",
  "Politics",
  "Business",
  "Environment",
  "Education",
  "Entertainment",
  "Sports",
  "Other"
]
```

**Use Case**: Populate category dropdown in frontend submission form

### Enhanced Endpoints

#### Content Creation with Validation

```http
POST /content/create
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "New scientific breakthrough in quantum computing",
  "source_url": "https://example.com/article",
  "description": "A detailed description of at least 50 characters explaining the content. This ensures quality and context for community verification. The description should be comprehensive and informative.",
  "category": "Technology"
}
```

**Enhanced Validation**:
- ✅ **Title**: Max 250 characters, sensationalism check
- ✅ **URL**: HTTPS preferred, malware domain checking, non-HTTPS warning
- ✅ **Description**: Min 50, max 5000 characters
- ✅ **Category**: Must be from valid categories list

**Response** (201 Created):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "New scientific breakthrough in quantum computing",
  "source_url": "https://example.com/article",
  "description": "A detailed description...",
  "category": "Technology",
  "status": "Pending Verification",
  "created_by_user_id": 123,
  "created_by_username": "alice",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:

```json
// 400 Bad Request - Invalid URL
{
  "detail": "URL must use HTTP or HTTPS protocol"
}

// 400 Bad Request - Title too long
{
  "detail": "Title must be 250 characters or less"
}

// 400 Bad Request - Description too short
{
  "detail": "Description must be at least 50 characters"
}

// 400 Bad Request - Invalid category
{
  "detail": "Category must be one of: Technology, Science, Health, ..."
}
```

---

## Verification Service Enhancements

**Base URL**: `http://localhost:8002/api/v1`

### Enhanced Endpoints

#### Vote Statistics with Calculated Status

```http
GET /verify/{content_id}/votes
```

**Description**: Get voting statistics with calculated verification status

**Response** (200 OK):
```json
{
  "content_id": "507f1f77bcf86cd799439011",
  "total_votes": 75,
  "verified_votes": 68,
  "disputed_votes": 7,
  "verification_percentage": 90.67,
  "status": "Verified"  // NEW: Calculated based on thresholds
}
```

**Status Calculation Logic**:

```python
# Verified: 85% verified votes AND total > 50
if verification_percentage >= 85 and total_votes > 50:
    status = "Verified"
    
# Disputed: 35% or more disputed votes
elif disputed_percentage >= 35:
    status = "Disputed"
    
# Under Review: Enough votes but not verified
elif total_votes >= 50:
    status = "Under Review"
    
# Pending: Not enough votes yet
else:
    status = "Pending Verification"
```

**Status Thresholds** (from requirements):

| Status | Trigger Condition |
|--------|-------------------|
| **Verified** (✓) | 85% verified votes AND total > 50 |
| **Disputed** (⚠) | 35% disputed votes OR moderator flag |
| **Under Review** | 50+ votes but doesn't meet verified threshold |
| **Pending Verification** (⏱) | Less than 50 votes |

#### Vote Submission with Status Change Detection

```http
POST /verify/{content_id}/vote
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "vote": true  // true = verified, false = disputed
}
```

**Response** (201 Created):
```json
{
  "id": 456,
  "content_id": "507f1f77bcf86cd799439011",
  "user_id": 123,
  "vote": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Enhanced Behavior**:
- ✅ Detects status changes (e.g., Pending → Verified)
- ✅ Logs status changes for transparency
- ✅ Publishes StatusUpdated events (future)
- ✅ Triggers notifications (future)

**Status Change Log Example**:
```
[STATUS CHANGE] Content 507f1f77bcf86cd799439011: Pending Verification -> Verified
[STATUS CHANGE] Trigger: Community voting (90.67% verified)
```

---

## Search Service Enhancements

**Base URL**: `http://localhost:8003/api/v1`

### Planned Enhancements

#### Enhanced Search with Status Boosting

```http
GET /search?q=quantum&status=verified&boost_verified=true
```

**Description**: Search with relevance boosting for verified content

**Query Parameters**:
- `q`: Search query
- `status`: Filter by status (verified, disputed, pending)
- `boost_verified`: Boost verified content in rankings (default: true)
- `category`: Filter by category
- `timeframe`: today, week, month, all

**Response** (200 OK):
```json
{
  "query": "quantum",
  "total": 42,
  "results": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Quantum computing breakthrough",
      "description": "...",
      "status": "Verified",
      "relevance_score": 0.95,  // Boosted for verified status
      "verification_percentage": 90.67,
      "category": "Technology"
    }
  ]
}
```

**Relevance Boosting Logic**:
```python
# Base relevance from text matching
base_score = elasticsearch_score

# Apply status multiplier
if status == "Verified":
    final_score = base_score * 1.5  # 50% boost
elif status == "Under Review":
    final_score = base_score * 1.0  # No change
elif status == "Disputed":
    final_score = base_score * 0.5  # 50% penalty
else:  # Pending
    final_score = base_score * 0.8  # 20% penalty
```

---

## Cross-Service Events

### Event Types

#### 1. ContentCreated

**Publisher**: content_service  
**Consumers**: verification_service, search_service

```json
{
  "event_type": "ContentCreated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "content_id": "507f1f77bcf86cd799439011",
    "user_id": 123,
    "metadata": {
      "title": "Quantum computing breakthrough",
      "category": "Technology",
      "source_url": "https://example.com/article",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Actions**:
- verification_service: Initialize AI verification, set status to "Pending"
- search_service: Index content for immediate discoverability

#### 2. StatusUpdated (Future)

**Publisher**: verification_service  
**Consumers**: content_service, search_service, notification_service

```json
{
  "event_type": "StatusUpdated",
  "timestamp": "2024-01-15T12:00:00Z",
  "data": {
    "content_id": "507f1f77bcf86cd799439011",
    "old_status": "Pending Verification",
    "new_status": "Verified",
    "trigger": "Community Consensus: 90.67% verified",
    "total_votes": 75
  }
}
```

**Actions**:
- content_service: Update persistent content record
- search_service: Update relevance index, boost in rankings
- notification_service: Notify content creator

#### 3. AccountDeletionRequested (Implemented)

**Publisher**: user_service  
**Consumers**: content_service, verification_service, search_service

```json
{
  "event_type": "AccountDeletionRequested",
  "timestamp": "2024-01-15T14:00:00Z",
  "data": {
    "user_id": 123,
    "username": "alice"
  }
}
```

**Actions**:
- content_service: Delete user's content or anonymize
- verification_service: Delete user's votes and comments
- search_service: Remove user data from indexes

---

## Authentication & Security

### JWT Token Structure

```json
{
  "sub": "alice",  // Username
  "exp": 1705326600,  // Expiration timestamp
  "type": "access"  // "access" or "refresh"
}
```

### Token Types

#### Access Token
- **Lifetime**: 30 minutes
- **Purpose**: Authenticate API requests
- **Usage**: Include in Authorization header

#### Refresh Token (New)
- **Lifetime**: 7 days
- **Purpose**: Obtain new access token
- **Usage**: Exchange for new access token when expired

**Refresh Token Flow** (Future):
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."  // New refresh token (rotation)
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions (RBAC) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., username taken) |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting (Planned)

### Limits by Role

| Role | Requests per Hour | Burst |
|------|-------------------|-------|
| Anonymous | 100 | 10 |
| Standard User | 1000 | 50 |
| Verified Contributor | 5000 | 100 |
| Moderator | 10000 | 200 |

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1705326600
```

---

## Versioning

**Current API Version**: v1  
**URL Format**: `/api/v1/...`

### Deprecation Policy
- New features added to current version
- Breaking changes require new version (v2)
- Old versions supported for minimum 12 months
- Deprecation notices given 6 months in advance

---

## Testing

### Example cURL Commands

#### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "SecurePass123!"
  }'
```

#### Create Content
```bash
curl -X POST http://localhost:8001/api/v1/content/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quantum breakthrough",
    "source_url": "https://example.com/article",
    "description": "A comprehensive description of at least 50 characters...",
    "category": "Technology"
  }'
```

#### Submit Vote
```bash
curl -X POST http://localhost:8002/api/v1/verify/<content_id>/vote \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vote": true}'
```

#### Export Data
```bash
curl -X GET http://localhost:8000/api/v1/gdpr/export \
  -H "Authorization: Bearer <token>" \
  > my_data.json
```

---

## OpenAPI Documentation

Each service exposes interactive API documentation:

- **User Service**: http://localhost:8000/docs
- **Content Service**: http://localhost:8001/docs
- **Verification Service**: http://localhost:8002/docs
- **Search Service**: http://localhost:8003/docs

---

## Changelog

### Version 1.1.0 (2024-01-15)

**Added**:
- GDPR endpoints (data export, account deletion)
- RBAC support with user roles
- Content validation enhancements
- Status calculation with thresholds
- Valid categories endpoint
- Audit logging infrastructure

**Enhanced**:
- User profile includes role
- Vote stats include calculated status
- Content creation with comprehensive validation
- JWT token support for refresh tokens

**Planned**:
- Rate limiting middleware
- Refresh token rotation endpoint
- StatusUpdated event publishing
- Notification service integration
- User statistics endpoints

---

## Support

For API questions or issues:
- **Documentation**: https://docs.veridiaapp.com
- **GitHub Issues**: https://github.com/MachariaP/VeridiaApp/issues
- **Email**: api-support@veridiaapp.com
