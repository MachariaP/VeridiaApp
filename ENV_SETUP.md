# Environment Variables Setup Guide

This guide explains how to set up environment variables for VeridiaApp.

## Overview

VeridiaApp uses environment variables to configure:
- Database connections
- API endpoints
- Service URLs
- Secret keys

## Files You Need to Create

### 1. Frontend: `frontend_app/.env.local`

**Purpose:** Configures which backend services the frontend connects to.

**How to create:**
```bash
cd frontend_app
cp .env.example .env.local
```

**Default content (for local development):**
```bash
# Backend API URLs for local development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8001
NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:8003
```

**Important:** 
- These values should match the ports your backend services are running on
- After changing this file, you must restart the frontend dev server
- `.env.local` is gitignored and won't be committed

### 2. Verification Service: `verification_service/.env`

**Purpose:** Configures database and messaging for the verification service.

**How to create:**
```bash
cd verification_service
cp .env.example .env
```

**Content for PostgreSQL setup:**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/veridiadb
RABBITMQ_URL=amqp://username:password@localhost:5672/
SECRET_KEY=your-secret-key-change-in-production
CONTENT_SERVICE_URL=http://localhost:8001
```

**Content for SQLite setup (development only):**
```bash
# DATABASE_URL is commented out - service will use SQLite
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
SECRET_KEY=your-secret-key-change-in-production
CONTENT_SERVICE_URL=http://localhost:8001
```

**Important:**
- If `DATABASE_URL` is not set, service uses SQLite (verification.db file)
- RabbitMQ connection is optional - service will start without it
- `.env` is gitignored and won't be committed

### 3. User Service: `user_service/.env` (Optional)

**How to create:**
```bash
cd user_service
cp .env.example .env
```

**Content:**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/veridiadb
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Note:** If not created, service uses SQLite by default.

### 4. Content Service: `content_service/.env` (Optional)

**How to create:**
```bash
cd content_service
cp .env.example .env
```

**Content:**
```bash
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=veridiadb
SECRET_KEY=your-secret-key-here
```

**Note:** If not created, service uses in-memory storage.

### 5. Search Service: `search_service/.env` (Optional)

**How to create:**
```bash
cd search_service
cp .env.example .env
```

**Content:**
```bash
ELASTICSEARCH_URL=http://localhost:9200
```

**Note:** If not created, service uses in-memory storage.

## Quick Setup for Local Development

If you want to quickly get started without setting up PostgreSQL, MongoDB, etc.:

```bash
# Only create frontend .env.local
cd frontend_app
cp .env.example .env.local

# All backend services will use their defaults (SQLite/in-memory storage)
# No need to create .env files for backend services
```

## Full Setup with All Databases

For production-like setup:

1. **Install and configure databases:**
   - PostgreSQL (port 5432)
   - MongoDB (port 27017)
   - RabbitMQ (port 5672)
   - Elasticsearch (port 9200)

2. **Create all .env files:**
   ```bash
   # Frontend
   cd frontend_app && cp .env.example .env.local && cd ..
   
   # Backend services
   cd user_service && cp .env.example .env && cd ..
   cd content_service && cp .env.example .env && cd ..
   cd verification_service && cp .env.example .env && cd ..
   cd search_service && cp .env.example .env && cd ..
   ```

3. **Update each .env file with your database credentials**

## Verifying Your Setup

### Check Frontend Configuration

1. Open `frontend_app/.env.local`
2. Verify these URLs match your running services:
   - `NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002` (NOT 8003!)
   - Other services on their respective ports

### Check Backend Services

For each service that uses a database:

1. Open the `.env` file
2. Verify `DATABASE_URL` or connection string is correct
3. Test the connection manually if possible

### Test Connections

```bash
# Test each service health endpoint
curl http://localhost:8000/health  # User Service
curl http://localhost:8001/health  # Content Service
curl http://localhost:8002/health  # Verification Service
curl http://localhost:8003/health  # Search Service
```

## Common Issues

### Issue: Frontend connects to wrong port

**Symptom:** Browser shows `net::ERR_CONNECTION_REFUSED` or tries to connect to port 8003 for verification service

**Solution:**
1. Check `frontend_app/.env.local` exists and has correct URLs
2. Make sure `NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002`
3. Restart the frontend dev server: `npm run dev`
4. Clear Next.js cache: `rm -rf .next`

### Issue: Backend service fails to start

**Symptom:** `Connection failed` or `Database error` when starting service

**Solution:**
1. Check if the database is running (PostgreSQL/MongoDB/etc.)
2. Verify credentials in `.env` file
3. Try removing `DATABASE_URL` from `.env` to use default (SQLite/in-memory)

### Issue: Changes to .env not taking effect

**Solution:**
- Backend: Restart the service
- Frontend: Restart dev server AND clear cache (`rm -rf .next`)
- Environment variables are read at startup, not dynamically

## Environment Variables Priority

The application loads environment variables in this order (later ones override earlier):

1. **System environment variables** (e.g., `export VAR=value`)
2. **`.env` file** (backend services)
3. **`.env.local` file** (frontend only)
4. **Code defaults** (if no env var is set)

For frontend specifically:
- `.env.local` > `.env` > code defaults
- Only variables starting with `NEXT_PUBLIC_` are exposed to the browser

## Security Notes

⚠️ **Never commit `.env` or `.env.local` files to Git!**

- They contain sensitive credentials
- They are already in `.gitignore`
- Use `.env.example` as a template for others

⚠️ **Change default secrets in production!**

- `SECRET_KEY` should be a long random string
- Database passwords should be strong
- API keys should never be hardcoded

## Need Help?

See the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide for detailed solutions to common problems.
