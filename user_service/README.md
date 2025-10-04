# User Service: VeridiaApp Backend Microservice for User Management

This microservice handles user authentication, registration, profiles, and related functionalities as part of the VeridiaApp microservices architecture.

## Features
- ✅ User registration with email validation
- ✅ Secure login with JWT authentication
- ✅ Password hashing using Argon2 (production-grade security)
- ✅ Protected profile endpoint (/me)
- ✅ Event publishing to RabbitMQ (stub implementation)
- ✅ Comprehensive error handling
- ✅ Type safety with Pydantic models
- ✅ SQLAlchemy ORM for database operations
- ✅ Automatic database initialization
- ✅ CORS enabled for frontend integration

## Technologies
- **FastAPI** - Modern, fast web framework for building APIs
- **Pydantic** - Data validation using Python type annotations
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database (with SQLite fallback for development)
- **JWT (python-jose)** - JSON Web Tokens for authentication
- **Passlib** - Password hashing library with bcrypt and Argon2
- **Uvicorn** - ASGI server implementation

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
  - Request body: `{"username": "string", "email": "string", "password": "string"}`
  - Response: User object with id, username, email, is_active

- `POST /api/v1/auth/login` - Login and get JWT token
  - Request body: `{"username": "string", "password": "string"}`
  - Response: `{"access_token": "string", "token_type": "bearer"}`

- `GET /api/v1/auth/me` - Get current user profile (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Response: User object with id, username, email, is_active

## Setup and Running

### Local Development
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   
   **Note:** All required dependencies including `argon2-cffi` for password hashing are included in `requirements.txt`.

2. Set environment variables (optional):
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/veridiadb"
   export SECRET_KEY="your-secret-key-here"
   ```
   
   **Note:** If DATABASE_URL is not set, SQLite will be used as fallback (stored as `veridiaapp.db`).

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   
   The database will be initialized automatically on startup.

4. Access the API:
   - API: http://localhost:8000
   - Interactive API docs (Swagger UI): http://localhost:8000/docs
   - Alternative API docs (ReDoc): http://localhost:8000/redoc

## Troubleshooting

### Unable to login after registration

If you can register but not login, check:

1. **Missing argon2-cffi dependency**: 
   ```bash
   pip install argon2-cffi
   ```
   This should already be in `requirements.txt`, but if you installed before the update, install it manually.

2. **Database not initialized properly**:
   ```bash
   # Check if database file exists
   ls -lh veridiaapp.db
   
   # View database schema
   sqlite3 veridiaapp.db ".schema users"
   
   # Check registered users
   sqlite3 veridiaapp.db "SELECT id, username, email, is_active FROM users;"
   ```

3. **Service logs**: Check the terminal output for error messages when attempting to register or login.

For more detailed troubleshooting, see the [DATABASE_SETUP.md](../DATABASE_SETUP.md) guide in the root directory.

## Database Management

### View Database Contents
```bash
# View all users (excluding passwords)
sqlite3 veridiaapp.db "SELECT id, username, email, is_active, created_at FROM users;"

# Count total users
sqlite3 veridiaapp.db "SELECT COUNT(*) as total_users FROM users;"

# Check specific user
sqlite3 veridiaapp.db "SELECT * FROM users WHERE username='testuser';"
```

### Reset Database
```bash
# Backup first (optional)
cp veridiaapp.db veridiaapp.db.backup

# Remove database
rm veridiaapp.db

# Restart service to recreate
uvicorn app.main:app --reload --port 8000
```

See `init_db.sql` for the complete database schema reference.

### Docker
1. Build the Docker image:
   ```bash
   docker build -t user-service .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 user-service
   ```

## Architecture

This service follows best practices:
- **Dependency Injection** - FastAPI's DI system for database sessions
- **Layered Architecture** - Separation of concerns (routes, models, schemas, core)
- **Type Safety** - Full type hints and Pydantic validation
- **Security** - Password hashing, JWT tokens, CORS configuration
- **Event-Driven** - RabbitMQ event publishing (stub for future implementation)

## Directory Structure
```
user_service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── auth.py          # Authentication endpoints
│   ├── core/
│   │   ├── database.py              # Database configuration
│   │   └── security.py              # Password hashing & JWT utilities
│   ├── models/
│   │   └── user.py                  # SQLAlchemy User model
│   ├── schemas/
│   │   └── user.py                  # Pydantic schemas
│   ├── utils/
│   │   └── messaging.py             # RabbitMQ event publisher (stub)
│   └── main.py                      # FastAPI application entry point
├── Dockerfile
├── requirements.txt
└── README.md
```

## Testing
```bash
# Test registration
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Test profile (use token from login)
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your-token-here>"
```
