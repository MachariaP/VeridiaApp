# API Documentation and Design - VeridiaApp

**Version**: 1.0  
**Last Updated**: 2024  
**Target Audience**: Backend developers, API designers, and technical writers

---

## Overview

This guide covers API design principles, RESTful conventions, and documentation strategies for VeridiaApp. The goal is to create **consistent, intuitive, and well-documented APIs** that are easy to consume and maintain.

### API Architecture

```
┌──────────────────────────────────────────┐
│         VeridiaApp API Layer             │
├──────────────────────────────────────────┤
│ RESTful APIs         │ Authentication    │
│ - User Service       │ - JWT Tokens      │
│ - Content Service    │ - Role-Based      │
│ - Verification       │ - OAuth (Future)  │
│ - Search Service     │                   │
├──────────────────────────────────────────┤
│ Documentation Tools: OpenAPI/Swagger     │
│ Versioning: /api/v1/...                  │
│ Response Format: JSON                    │
└──────────────────────────────────────────┘
```

---

## Part 1: API Design Principles

### RESTful Design Conventions

VeridiaApp follows **REST (Representational State Transfer)** architectural style with these core principles:

#### 1. Resource-Based URLs

**Good**: `/api/v1/users/123` (noun, resource-based)  
**Bad**: `/api/v1/getUser?id=123` (verb, action-based)

**Resources in VeridiaApp:**
- `/users` - User accounts
- `/content` - Content items (articles, posts)
- `/verify/{content_id}/votes` - Verification votes
- `/verify/{content_id}/comments` - Comments
- `/search` - Search queries

---

#### 2. HTTP Methods (Verbs)

Use standard HTTP methods to indicate actions:

| Method | Action | Example | Description |
|--------|--------|---------|-------------|
| `GET` | Read | `GET /users/123` | Retrieve a specific user |
| `GET` | List | `GET /users` | Retrieve list of users |
| `POST` | Create | `POST /users` | Create a new user |
| `PUT` | Update (full) | `PUT /users/123` | Update entire user |
| `PATCH` | Update (partial) | `PATCH /users/123` | Update specific fields |
| `DELETE` | Delete | `DELETE /users/123` | Delete a user |

**Examples from VeridiaApp:**
- `POST /api/v1/auth/register` - Create new user account
- `GET /api/v1/content` - List all content
- `POST /api/v1/content` - Create new content
- `GET /api/v1/content/{id}` - Get specific content
- `PUT /api/v1/content/{id}` - Update content
- `DELETE /api/v1/content/{id}` - Delete content

---

#### 3. Status Codes

Use appropriate HTTP status codes:

| Code | Meaning | Usage |
|------|---------|-------|
| `200 OK` | Success | Successful GET, PUT, PATCH |
| `201 Created` | Resource created | Successful POST |
| `204 No Content` | Success, no body | Successful DELETE |
| `400 Bad Request` | Invalid input | Validation errors |
| `401 Unauthorized` | Not authenticated | Missing/invalid token |
| `403 Forbidden` | Not authorized | Insufficient permissions |
| `404 Not Found` | Resource not found | Invalid ID |
| `409 Conflict` | Resource conflict | Duplicate username |
| `500 Internal Server Error` | Server error | Unexpected errors |

---

#### 4. Consistent Response Format

**Success Response:**
```json
{
  "id": "content_123",
  "title": "Article Title",
  "content_type": "article",
  "body": "Article content...",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Response:**
```json
{
  "detail": "Content not found",
  "status_code": 404,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**List Response (with pagination):**
```json
{
  "content": [
    { "id": "1", "title": "First Article" },
    { "id": "2", "title": "Second Article" }
  ],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

---

#### 5. API Versioning

**Version in URL**: `/api/v1/users`

**Benefits:**
- Clear version identification
- Easy to maintain multiple versions
- Backward compatibility

**Version Strategy:**
- `v1`: Current stable version
- `v2`: Next version with breaking changes
- Support at least 2 versions simultaneously

---

#### 6. Filtering, Sorting, and Pagination

**Filtering:**
```
GET /api/v1/content?content_type=article&tag=technology
```

**Sorting:**
```
GET /api/v1/content?sort_by=created_at&order=desc
```

**Pagination:**
```
GET /api/v1/content?page=2&page_size=20
```

**Combined:**
```
GET /api/v1/content?content_type=article&sort_by=created_at&order=desc&page=1&page_size=20
```

---

### Security Best Practices

#### 1. Authentication

**JWT (JSON Web Tokens)** for stateless authentication:

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Structure:**
```json
{
  "sub": "user_123",
  "username": "john_doe",
  "role": "user",
  "exp": 1705315200
}
```

---

#### 2. Rate Limiting

Prevent abuse with rate limiting:

**Response Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705315200
```

**Example (FastAPI):**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/content")
@limiter.limit("100/minute")
async def list_content():
    # ...
```

---

#### 3. Input Validation

**Always validate and sanitize input:**
- Use Pydantic models (FastAPI)
- Validate data types, lengths, formats
- Sanitize to prevent SQL injection, XSS

**Example:**
```python
from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=50)
    email: EmailStr
    password: constr(min_length=8, max_length=100)
```

---

#### 4. CORS Configuration

**Production CORS settings:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)
```

---

## Part 2: API Documentation with OpenAPI/Swagger

### Automatic Documentation (FastAPI)

FastAPI automatically generates OpenAPI documentation. Access at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

---

### Enhancing API Documentation

#### 1. Add Descriptions to Endpoints

**Good Documentation:**
```python
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter()

@router.get(
    "/content",
    response_model=List[ContentResponse],
    summary="List all content items",
    description="""
    Retrieve a list of all content items.
    
    **Supports:**
    - Filtering by content_type and tags
    - Sorting by created_at, updated_at
    - Pagination with page and page_size parameters
    
    **Example:**
    ```
    GET /api/v1/content?content_type=article&page=1&page_size=20
    ```
    """,
    response_description="List of content items with pagination metadata",
    tags=["Content"]
)
async def list_content(
    content_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
):
    """
    List content with optional filtering and pagination.
    """
    # Implementation...
```

---

#### 2. Document Request/Response Models

**Request Model:**
```python
from pydantic import BaseModel, Field
from typing import Optional, Dict

class ContentCreate(BaseModel):
    """
    Schema for creating new content.
    """
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Content title",
        example="Breaking News: Major Discovery"
    )
    content_type: str = Field(
        ...,
        description="Type of content",
        example="article"
    )
    body: str = Field(
        ...,
        min_length=10,
        description="Main content body",
        example="Scientists have made a groundbreaking discovery..."
    )
    metadata: Optional[Dict] = Field(
        default={},
        description="Additional metadata (tags, source, etc.)",
        example={
            "tags": ["science", "research"],
            "source": "https://example.com/article"
        }
    )
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Climate Change Report 2024",
                "content_type": "article",
                "body": "The latest climate report reveals...",
                "metadata": {
                    "tags": ["climate", "environment"],
                    "source": "https://climate.example.com"
                }
            }
        }
```

---

#### 3. Document Error Responses

```python
from fastapi import HTTPException, status

@router.get(
    "/content/{content_id}",
    response_model=ContentResponse,
    responses={
        200: {
            "description": "Content retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "content_123",
                        "title": "Sample Article",
                        "content_type": "article",
                        "body": "Article content...",
                        "created_at": "2024-01-15T10:30:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Content not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Content with id 'content_123' not found"
                    }
                }
            }
        },
        401: {
            "description": "Authentication required",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Not authenticated"
                    }
                }
            }
        }
    },
    tags=["Content"]
)
async def get_content(content_id: str):
    """Retrieve a specific content item by ID."""
    # Implementation...
```

---

### Complete API Endpoint Documentation Template

Here's a complete template for the `/users` resource:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ============================================
# Schemas (Request/Response Models)
# ============================================

class UserBase(BaseModel):
    """Base user schema with common fields."""
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern="^[a-zA-Z0-9_-]+$",
        description="Username (alphanumeric, underscore, hyphen only)",
        example="john_doe"
    )
    email: EmailStr = Field(
        ...,
        description="Valid email address",
        example="john@example.com"
    )

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password (minimum 8 characters)",
        example="SecurePassword123!"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "SecurePassword123!"
            }
        }

class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    email: Optional[EmailStr] = Field(
        None,
        description="New email address",
        example="newemail@example.com"
    )
    password: Optional[str] = Field(
        None,
        min_length=8,
        description="New password",
        example="NewSecurePassword456!"
    )

class UserResponse(UserBase):
    """Schema for user response (excludes password)."""
    id: str = Field(..., description="Unique user ID", example="user_123")
    role: str = Field(..., description="User role", example="user")
    created_at: str = Field(..., description="Account creation timestamp", example="2024-01-15T10:30:00Z")
    updated_at: str = Field(..., description="Last update timestamp", example="2024-01-15T10:30:00Z")
    
    class Config:
        orm_mode = True

# ============================================
# API Router
# ============================================

router = APIRouter(
    prefix="/api/v1",
    tags=["Users"]
)

# ============================================
# Endpoints
# ============================================

@router.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="""
    Create a new user account.
    
    **Requirements:**
    - Username: 3-50 characters, alphanumeric with underscore/hyphen
    - Email: Valid email format
    - Password: Minimum 8 characters
    
    **Returns:**
    - User object (without password)
    - HTTP 201 on success
    
    **Errors:**
    - 400: Invalid input data
    - 409: Username or email already exists
    """,
    response_description="Newly created user object",
    responses={
        201: {
            "description": "User registered successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "user_123",
                        "username": "john_doe",
                        "email": "john@example.com",
                        "role": "user",
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-15T10:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Username must be 3-50 characters"
                    }
                }
            }
        },
        409: {
            "description": "User already exists",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Username 'john_doe' already exists"
                    }
                }
            }
        }
    }
)
async def register_user(user_data: UserCreate):
    """
    Register a new user account.
    
    Args:
        user_data: User registration data
    
    Returns:
        UserResponse: Created user object
    
    Raises:
        HTTPException: 400 if validation fails, 409 if user exists
    """
    # Implementation here
    pass

@router.get(
    "/users",
    response_model=List[UserResponse],
    summary="List all users",
    description="""
    Retrieve a list of all registered users.
    
    **Supports:**
    - Pagination with `page` and `page_size`
    - Role filtering with `role` parameter
    
    **Authentication:**
    - Requires valid JWT token
    - Only accessible by admin users
    
    **Example:**
    ```
    GET /api/v1/users?page=1&page_size=20&role=user
    ```
    """,
    response_description="List of users",
    responses={
        200: {"description": "List retrieved successfully"},
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"}
    }
)
async def list_users(
    page: int = 1,
    page_size: int = 20,
    role: Optional[str] = None,
    current_user = Depends(get_current_admin_user)
):
    """
    List all users (admin only).
    
    Args:
        page: Page number (default: 1)
        page_size: Items per page (default: 20)
        role: Filter by role
        current_user: Current authenticated admin user
    
    Returns:
        List[UserResponse]: List of users
    """
    # Implementation here
    pass

@router.get(
    "/users/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="""
    Retrieve the profile of the currently authenticated user.
    
    **Authentication:**
    - Requires valid JWT token in Authorization header
    
    **Returns:**
    - Current user profile
    """,
    response_description="Current user profile",
    responses={
        200: {"description": "Profile retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """
    Get current user's profile.
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        UserResponse: User profile
    """
    return current_user

@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
    description="""
    Retrieve a specific user's profile by their ID.
    
    **Authentication:**
    - Optional: Public profiles visible without auth
    - Private profiles require authentication
    """,
    response_description="User profile",
    responses={
        200: {"description": "User found"},
        404: {"description": "User not found"}
    }
)
async def get_user_by_id(user_id: str):
    """
    Get user profile by ID.
    
    Args:
        user_id: User's unique ID
    
    Returns:
        UserResponse: User profile
    
    Raises:
        HTTPException: 404 if user not found
    """
    # Implementation here
    pass

@router.put(
    "/users/me",
    response_model=UserResponse,
    summary="Update current user profile",
    description="""
    Update the profile of the currently authenticated user.
    
    **Updatable Fields:**
    - email
    - password
    
    **Authentication:**
    - Requires valid JWT token
    """,
    response_description="Updated user profile",
    responses={
        200: {"description": "Profile updated successfully"},
        400: {"description": "Invalid input data"},
        401: {"description": "Not authenticated"}
    }
)
async def update_current_user(
    user_update: UserUpdate,
    current_user = Depends(get_current_user)
):
    """
    Update current user's profile.
    
    Args:
        user_update: Fields to update
        current_user: Current authenticated user
    
    Returns:
        UserResponse: Updated user profile
    """
    # Implementation here
    pass

@router.delete(
    "/users/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete current user account",
    description="""
    Permanently delete the current user's account.
    
    **Warning:**
    - This action is irreversible
    - All user data will be deleted
    
    **Authentication:**
    - Requires valid JWT token
    - Requires password confirmation (in request body)
    """,
    responses={
        204: {"description": "Account deleted successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Password confirmation failed"}
    }
)
async def delete_current_user(
    password_confirmation: str,
    current_user = Depends(get_current_user)
):
    """
    Delete current user's account.
    
    Args:
        password_confirmation: User's password for confirmation
        current_user: Current authenticated user
    
    Raises:
        HTTPException: 403 if password is incorrect
    """
    # Implementation here
    pass
```

---

## Part 3: API Testing via Documentation

### Using Swagger UI for Testing

**Step 1: Access Swagger UI**
```
http://localhost:8000/docs
```

**Step 2: Authorize**
1. Click "Authorize" button
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"

**Step 3: Test Endpoint**
1. Expand the endpoint (e.g., `POST /api/v1/content`)
2. Click "Try it out"
3. Modify request body
4. Click "Execute"
5. Review response

---

### Mock API Testing Examples

#### Example 1: User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "username": "test_user",
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response (201):**
```json
{
  "id": "user_abc123",
  "username": "test_user",
  "email": "test@example.com",
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

#### Example 2: Create Content

**Endpoint:** `POST /api/v1/content`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "title": "Understanding Quantum Computing",
  "content_type": "article",
  "body": "Quantum computing represents a paradigm shift in computational power...",
  "metadata": {
    "tags": ["technology", "quantum", "computing"],
    "source": "https://example.com/quantum-article",
    "author_notes": "Peer-reviewed content"
  }
}
```

**Expected Response (201):**
```json
{
  "id": "content_xyz789",
  "title": "Understanding Quantum Computing",
  "content_type": "article",
  "body": "Quantum computing represents a paradigm shift...",
  "metadata": {
    "tags": ["technology", "quantum", "computing"],
    "source": "https://example.com/quantum-article",
    "author_notes": "Peer-reviewed content"
  },
  "author_id": "user_abc123",
  "created_at": "2024-01-15T10:35:00Z",
  "updated_at": "2024-01-15T10:35:00Z",
  "verification_status": "pending"
}
```

---

#### Example 3: Vote on Content

**Endpoint:** `POST /api/v1/verify/{content_id}/vote`

**Request:**
```json
{
  "vote": true
}
```

**Expected Response (200):**
```json
{
  "content_id": "content_xyz789",
  "user_id": "user_abc123",
  "vote": true,
  "voted_at": "2024-01-15T10:40:00Z"
}
```

---

#### Example 4: Get Vote Statistics

**Endpoint:** `GET /api/v1/verify/{content_id}/votes`

**Expected Response (200):**
```json
{
  "content_id": "content_xyz789",
  "upvotes": 42,
  "downvotes": 5,
  "total_votes": 47,
  "verification_score": 0.89,
  "status": "verified",
  "updated_at": "2024-01-15T10:45:00Z"
}
```

---

#### Example 5: Search Content

**Endpoint:** `GET /api/v1/search?query=quantum&content_type=article`

**Expected Response (200):**
```json
{
  "query": "quantum",
  "results": [
    {
      "id": "content_xyz789",
      "title": "Understanding Quantum Computing",
      "content_type": "article",
      "excerpt": "Quantum computing represents a paradigm shift...",
      "score": 9.5,
      "metadata": {
        "tags": ["technology", "quantum", "computing"]
      }
    },
    {
      "id": "content_abc456",
      "title": "Quantum Mechanics Explained",
      "content_type": "article",
      "excerpt": "The fundamentals of quantum mechanics...",
      "score": 8.2,
      "metadata": {
        "tags": ["science", "quantum", "physics"]
      }
    }
  ],
  "total_results": 15,
  "page": 1,
  "page_size": 10
}
```

---

## Part 4: Alternative Documentation Tools

### Option 1: Postman Collections

**Export OpenAPI Spec:**
```bash
curl http://localhost:8000/openapi.json > veridiaapp-openapi.json
```

**Import to Postman:**
1. Open Postman
2. File → Import
3. Select `veridiaapp-openapi.json`
4. Postman auto-generates collection

**Share Collection:**
1. Click "Share" in Postman
2. Generate public link or export JSON
3. Add to repository: `docs/postman/veridiaapp-collection.json`

---

### Option 2: ReDoc (Alternative UI)

Already available at: `http://localhost:8000/redoc`

**Benefits:**
- Cleaner, more readable layout
- Better for documentation reading (vs testing)
- Three-panel design
- Export as static HTML

---

### Option 3: Stoplight Studio

**For Advanced Documentation:**
1. Install Stoplight Studio (free)
2. Import OpenAPI spec
3. Add additional documentation (guides, tutorials)
4. Publish to Stoplight Docs

---

## Part 5: API Versioning Strategy

### URL Versioning (Current Implementation)

```
/api/v1/users
/api/v1/content
/api/v2/users (future)
```

**Migration Path:**
1. Release v2 endpoints
2. Support both v1 and v2 for 6 months
3. Deprecate v1 (add warnings in responses)
4. Remove v1 after deprecation period

---

### Deprecation Notice Example

**Response Header:**
```
Warning: 299 - "API v1 is deprecated. Please migrate to v2 by 2024-12-31"
Sunset: Tue, 31 Dec 2024 23:59:59 GMT
```

**Response Body (v1):**
```json
{
  "id": "user_123",
  "username": "john_doe",
  "_meta": {
    "deprecated": true,
    "deprecation_date": "2024-06-30",
    "sunset_date": "2024-12-31",
    "migration_guide": "https://docs.veridiaapp.com/api/v1-to-v2-migration"
  }
}
```

---

## Summary

### API Design Checklist

**Core Principles:**
- [ ] RESTful resource-based URLs
- [ ] Proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Appropriate status codes (200, 201, 400, 401, 404, 500)
- [ ] Consistent response format (JSON)
- [ ] API versioning (/api/v1/...)

**Security:**
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Input validation (Pydantic)
- [ ] CORS configuration

**Documentation:**
- [ ] OpenAPI/Swagger auto-generation
- [ ] Detailed endpoint descriptions
- [ ] Request/response examples
- [ ] Error responses documented
- [ ] Postman collection available

**Testing:**
- [ ] All endpoints testable via Swagger UI
- [ ] Mock examples provided
- [ ] Integration tests written
- [ ] API versioning strategy defined

### Key Takeaways

1. **REST Principles**: Use resource-based URLs and proper HTTP methods
2. **Documentation**: Leverage FastAPI's automatic OpenAPI generation
3. **Security**: Always authenticate, validate, and rate-limit
4. **Consistency**: Maintain consistent patterns across all endpoints
5. **Testing**: Make APIs easy to test via Swagger UI and Postman

### Resources

- **OpenAPI Specification**: https://swagger.io/specification/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **REST API Best Practices**: https://restfulapi.net/
- **HTTP Status Codes**: https://httpstatuses.com/

---

## Conclusion

You now have a complete understanding of:
1. **Local Setup**: How to run VeridiaApp locally
2. **Deployment**: Cloud deployment strategies with CI/CD
3. **Databases**: Configuration and testing of PostgreSQL, MongoDB, Elasticsearch
4. **Testing**: Unit, integration, and E2E testing strategies
5. **API Design**: RESTful conventions and comprehensive documentation

**Next Steps:**
- Implement these guidelines in your rebuild
- Set up monitoring and logging
- Create a staging environment
- Plan for scalability and performance optimization

🎉 **Congratulations! You're ready to rebuild VeridiaApp with confidence!**
