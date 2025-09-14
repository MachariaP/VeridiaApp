# User Service: VeridiaApp Backend Microservice for User Management

This microservice handles user authentication, registration, profiles, and related functionalities.

## Features
- User registration and login with JWT authentication.
- Profile management.
- Secure password hashing.

## Technologies
- FastAPI for API development.
- PostgreSQL for data storage.
- JWT for auth tokens.

## Setup and Running
1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables in `.env` (copy from `.env.example`).
3. Run locally: `uvicorn app.main:app --reload`
4. Build and run with Docker: `docker build -t user-service .` then `docker run -p 8000:8000 user-service`

Visit http://localhost:8000/docs for API documentation (Swagger UI).
