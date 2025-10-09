# VeridiaApp - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker 20.10+
- Docker Compose 1.29+

### 1. Start All Services

```bash
# Clone repository (if not already cloned)
git clone https://github.com/MachariaP/VeridiaApp.git
cd VeridiaApp

# Start all services with Docker Compose
docker-compose up --build
```

This command will:
- Build all microservices
- Start PostgreSQL (VeridiaDB) on port 5432
- Start Redis on port 6379
- Start Core API Gateway on port 8000
- Start AI Verification Engine on port 8002
- Start Audit & Scoring Service on port 8003

### 2. Verify Services Are Running

Open a new terminal and check health endpoints:

```bash
# Core API Gateway
curl http://localhost:8000/health

# AI Verification Engine
curl http://localhost:8002/health

# Audit & Scoring Service
curl http://localhost:8003/health
```

All should return HTTP 200 with status information.

### 3. Access API Documentation

Open your browser:
- **Core API Gateway**: http://localhost:8000/docs
- **AI Verification Engine**: http://localhost:8002/docs
- **Audit & Scoring Service**: http://localhost:8003/docs

### 4. Test the API

#### Register a User

```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123"
  }'
```

#### Get JWT Token

```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo&password=demo123"
```

Copy the `access_token` from the response.

#### Create Content (Async Verification)

```bash
curl -X POST http://localhost:8000/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Verified Content",
    "body": "This content will be verified by AI asynchronously",
    "category": "general"
  }'
```

Notice the response returns immediately with status `PENDING_VERIFICATION` (HTTP 202).

### 5. Test Rate Limiting

The Audit & Scoring Service has rate limiting (100 requests per 60 seconds):

```bash
# This should work (within limit)
curl -X POST http://localhost:8003/votes \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "content_123",
    "user_id": "user_456",
    "vote_type": "UPVOTE"
  }'
```

### 6. Frontend Setup (Optional - Local Development)

If you want to run the frontend locally for development:

```bash
cd frontend_app

# Install dependencies
npm install

# Generate runtime configuration
npm run generate-config

# Start development server
npm run dev
```

Access the frontend at: http://localhost:3000

## 🏗️ Architecture Overview

```
Frontend (Next.js) ──┐
Port 3000            │
                     ▼
         ┌───────────────────────┐
         │  Core API Gateway     │
         │  Port 8000            │
         │  - JWT Auth           │
         │  - User Management    │
         │  - Content CRUD       │
         └──────┬────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌────────┐  ┌────────┐  ┌────────┐
│  AI    │  │ Audit  │  │ Redis  │
│ Verify │  │ Score  │  │ Cache  │
│  8002  │  │  8003  │  │  6379  │
└────────┘  └────────┘  └────────┘
                ▼
        ┌──────────────┐
        │  PostgreSQL  │
        │  VeridiaDB   │
        │    5432      │
        └──────────────┘
```

## 🔑 Key Features Demonstrated

### ✅ CORS Configuration
- All HTTP methods and headers allowed
- Credentials enabled for JWT
- Dynamic origins from configuration

### ✅ Runtime Configuration Injection (Frontend)
- API URL can change without rebuilding
- Configuration loaded at runtime
- No hardcoded paths

### ✅ Structured Configuration (Backend)
- Pydantic Settings for type-safe config
- No direct OS environment variables
- Hierarchical configuration loading

### ✅ Asynchronous Processing
- Content verification runs in background
- API returns immediately (202 Accepted)
- No blocking operations

### ✅ Redis-Based Rate Limiting
- Centralized rate counting
- Protects expensive ML resources
- 100 requests per 60 seconds default

### ✅ Health Checks
- All services expose /health endpoint
- Returns HTTP 200 when healthy
- Includes service status information

### ✅ JWT Authentication
- OAuth2 password flow
- Secure token generation
- Protected endpoints

### ✅ Database Integration
- PostgreSQL (VeridiaDB)
- Fixed password: 30937594PHINE
- Persistent data storage

## 📊 Database Details

- **Name**: VeridiaDB (mandated)
- **User**: veridia_user
- **Password**: 30937594PHINE (mandated, fixed)
- **Port**: 5432
- **Image**: postgres:14-alpine
- **Volume**: veridia_data (persistent)

## 🛠️ Common Commands

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f core-api-gateway
docker-compose logs -f ai-verification-engine
docker-compose logs -f audit-scoring-service
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Start)

```bash
docker-compose down -v
```

### Rebuild Services

```bash
docker-compose up --build --force-recreate
```

### Access Database

```bash
docker exec -it veridia-postgres psql -U veridia_user -d VeridiaDB
```

### Access Redis

```bash
docker exec -it veridia-redis redis-cli
```

## 🐛 Troubleshooting

### Port Already in Use

If you get port conflicts:

```bash
# Find process using port
lsof -i :8000
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Services Won't Start

Check logs:
```bash
docker-compose logs
```

### Database Connection Failed

Ensure PostgreSQL is healthy:
```bash
docker-compose ps
docker-compose logs veridia-postgres
```

### Frontend Config Not Loading

Regenerate config:
```bash
cd frontend_app
npm run generate-config
cat public/config.js
```

## 📚 Next Steps

1. **Read Full Documentation**: See [IMPLEMENTATION.md](./IMPLEMENTATION.md)
2. **Follow Tutorials**: Check [tutorial/README.md](./tutorial/README.md)
3. **Explore API**: Use Swagger UI at http://localhost:8000/docs
4. **Test Rate Limiting**: Try exceeding 100 requests/minute
5. **Deploy to Production**: Review deployment checklist in IMPLEMENTATION.md

## 🔐 Security Notes

- Change `SECRET_KEY` in production
- Update CORS origins for your domain
- Use HTTPS in production
- Rotate database password
- Enable Redis authentication

## 📞 Support

For issues:
1. Check logs: `docker-compose logs [service]`
2. Verify health: `curl http://localhost:8000/health`
3. Review IMPLEMENTATION.md
4. Check GitHub issues

---

**Built with FastAPI + Next.js + TypeScript + PostgreSQL + Redis**
**Architecture**: Microservices with Async Processing
**Status**: ✅ Production-Ready
