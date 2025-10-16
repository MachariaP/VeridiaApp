# VeridiaApp User Account Service

A FastAPI-based microservice for user authentication and authorization with JWT tokens and role-based access control (RBAC).

## Features

### ✅ Implemented

- **User Registration** - Secure user registration with email validation and password hashing
- **JWT Authentication** - Access tokens (15 min) and refresh tokens (7 days)
- **Login/Logout** - OAuth2-compatible login endpoint
- **Token Refresh** - Refresh token rotation for enhanced security
- **Password Hashing** - Bcrypt-based secure password hashing with salt
- **Role-Based Access Control (RBAC)** - Support for user, moderator, and admin roles
- **Protected Endpoints** - Authentication middleware with JWT verification
- **User Profile** - Get current user profile endpoint
- **Database Migrations** - Alembic for schema version control
- **Comprehensive Testing** - 22 passing tests covering all functionality

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` - Register a new user
- `POST /token` - Login and get access/refresh tokens (OAuth2 compatible)
- `POST /refresh` - Refresh access token using refresh token

### Users (`/api/v1/users`)

- `GET /me` - Get current authenticated user profile (protected)

### Health Check

- `GET /` - Service status
- `GET /health` - Health check

## Quick Start

### 1. Install Dependencies

```bash
cd user_service
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the configuration:

```bash
cp .env.example .env
```

For development, the service uses SQLite. For production, configure PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/veridiapp_user_db
JWT_SECRET_KEY=your-secret-key-here
```

### 3. Run Database Migrations

```bash
alembic upgrade head
```

### 4. Start the Service

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 5. View API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Running Tests

```bash
pytest app/tests/ -v
```

For coverage report:

```bash
pytest app/tests/ --cov=app --cov-report=html
```

## Usage Examples

### Register a New User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Get Current User Profile

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST "http://localhost:8000/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## Architecture

### Technology Stack

- **FastAPI** - Modern, high-performance web framework
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **Passlib + Bcrypt** - Secure password hashing
- **PyJWT / python-jose** - JWT token creation and validation
- **PostgreSQL/SQLite** - Database (SQLite for dev, PostgreSQL for production)
- **pytest** - Testing framework

### Security Features

1. **Password Hashing** - Uses Bcrypt with automatic salt generation
2. **JWT Tokens** - HS256 algorithm (configurable to RS256 for production)
3. **Token Types** - Separate access and refresh tokens
4. **Token Expiration** - Short-lived access tokens (15 min)
5. **Refresh Token Rotation** - New tokens issued on each refresh
6. **Input Validation** - Pydantic schemas validate all input
7. **SQL Injection Protection** - SQLAlchemy ORM with parameterized queries
8. **CORS** - Configurable cross-origin resource sharing

### Database Schema

**User Table:**
- `id` - Primary key
- `email` - Unique, indexed
- `hashed_password` - Bcrypt hashed password
- `first_name` - Optional
- `last_name` - Optional
- `role` - user, moderator, or admin
- `is_active` - Account status flag
- `created_at` - Timestamp of account creation

## Project Structure

```
user_service/
├── alembic/                    # Database migrations
│   ├── versions/              # Migration scripts
│   └── env.py                 # Alembic configuration
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py   # Authentication endpoints
│   │       │   └── users.py  # User endpoints
│   │       └── api.py        # API router
│   ├── core/
│   │   ├── config.py         # Application configuration
│   │   └── security.py       # Security utilities (JWT, hashing)
│   ├── db/
│   │   └── base.py           # Database connection
│   ├── models/
│   │   └── user.py           # SQLAlchemy User model
│   ├── schemas/
│   │   └── user.py           # Pydantic schemas
│   ├── tests/                # Test suite
│   │   ├── conftest.py       # Test fixtures
│   │   ├── test_auth.py      # Authentication tests
│   │   ├── test_models.py    # Model tests
│   │   ├── test_security.py  # Security tests
│   │   └── test_users.py     # User endpoint tests
│   └── main.py               # FastAPI application
├── .env.example              # Example environment variables
├── alembic.ini               # Alembic configuration
├── pytest.ini                # Pytest configuration
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Development

### Adding New Endpoints

1. Create endpoint function in `app/api/v1/endpoints/`
2. Add route to router in `app/api/v1/api.py`
3. Add tests in `app/tests/`

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

### Role-Based Access Control

To protect an endpoint with role requirements:

```python
from app.api.dependencies import require_role

@router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
def admin_only_endpoint():
    return {"message": "Admin access granted"}
```

## Production Deployment

### Environment Variables

Set the following for production:

```env
DATABASE_URL=postgresql://user:password@db-host:5432/veridiapp_db
JWT_SECRET_KEY=long-random-secret-key-min-32-chars
JWT_ALGORITHM=RS256  # Use RS256 with key pairs for production
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t veridiapp-user-service .
docker run -p 8000:8000 --env-file .env veridiapp-user-service
```

## License

MIT License - See LICENSE file for details.

## Contributors

- Phinehas Macharia - Lead Software Architect
