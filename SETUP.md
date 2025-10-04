# VeridiaApp Complete Setup Guide

This guide will help you set up and run the entire VeridiaApp stack on your local machine.

**🔥 Having trouble logging in after registration?** See [DATABASE_SETUP.md](DATABASE_SETUP.md) for solutions to common database and authentication issues.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+**: For backend microservices
- **Node.js 20+**: For the frontend application
- **PostgreSQL 14+**: For user_service and verification_service
- **MongoDB 6.0+**: For content_service (optional - can use Docker)
- **Elasticsearch 8.x**: For search_service (optional - can use Docker)
- **RabbitMQ 3.x**: For event messaging (optional - currently stubbed)

## Quick Start (Recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/MachariaP/VeridiaApp.git
cd VeridiaApp
```

### Step 2: Set Up Backend Services

#### User Service (Port 8000)

```bash
cd user_service
pip install -r requirements.txt

# Optional: Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/veridiadb"
# Or use SQLite (default if DATABASE_URL not set)

# Run the service
uvicorn app.main:app --reload --port 8000
```

The user service will:
- Use SQLite by default (stored as `veridiaapp.db`)
- Create database tables automatically on startup
- Be available at http://localhost:8000
- Provide API docs at http://localhost:8000/docs

**Note:** All required dependencies including `argon2-cffi` for password hashing are now included in `requirements.txt`. If you experience login issues after registration, see [DATABASE_SETUP.md](DATABASE_SETUP.md) for troubleshooting.

#### Content Service (Port 8001)

```bash
cd content_service
pip install -r requirements.txt

# Optional: Set environment variables
export MONGODB_URL="mongodb://localhost:27017"
export DATABASE_NAME="veridiadb"
# Note: MongoDB is optional - service uses in-memory storage if not available

# Run the service
uvicorn app.main:app --reload --port 8001
```

Available at http://localhost:8001 | Docs at http://localhost:8001/docs

#### Verification Service (Port 8002)

```bash
cd verification_service
pip install -r requirements.txt

# Optional: Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/veridiadb"
# Or use SQLite (default)

# Run the service
uvicorn app.main:app --reload --port 8002
```

Available at http://localhost:8002 | Docs at http://localhost:8002/docs

#### Search Service (Port 8003)

```bash
cd search_service
pip install -r requirements.txt

# Optional: Set environment variables
export ELASTICSEARCH_URL="http://localhost:9200"
# Note: Elasticsearch is optional - service uses in-memory storage if not available

# Run the service
uvicorn app.main:app --reload --port 8003
```

Available at http://localhost:8003 | Docs at http://localhost:8003/docs

### Step 3: Set Up Frontend

```bash
cd frontend_app
npm install

# Optional: Create .env.local file
cp .env.example .env.local
# Edit .env.local if needed to customize API URLs

# Run the development server
npm run dev
```

The frontend will be available at http://localhost:3000

## Accessing the Application

1. **Open your browser** to http://localhost:3000
2. **Register a new account** using the "Get Started" button
3. **Log in** with your credentials
4. **Explore the features**:
   - Dashboard: View your profile
   - Create Content: Submit content for verification
   - Discovery: Search and browse verified content
   - Content Details: Vote and comment on content

## API Endpoints Overview

### User Service (http://localhost:8000)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user profile (requires auth)

### Content Service (http://localhost:8001)
- `POST /api/v1/content/create` - Create content (requires auth)
- `GET /api/v1/content/{id}` - Get content by ID
- `GET /api/v1/content/` - List all content

### Verification Service (http://localhost:8002)
- `POST /api/v1/verify/{content_id}/vote` - Submit vote (requires auth)
- `GET /api/v1/verify/{content_id}/votes` - Get vote statistics
- `POST /api/v1/verify/{content_id}/comments` - Post comment (requires auth)
- `GET /api/v1/verify/{content_id}/comments` - Get all comments

### Search Service (http://localhost:8003)
- `GET /api/v1/search/` - Search content
- `GET /api/v1/search/categories` - Get available categories

## Testing the Setup

### Test User Service

```bash
# Test registration
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Save the token from login response and test profile endpoint
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Frontend Connection

1. Open http://localhost:3000 in your browser
2. Click "Get Started" to register
3. Fill in the registration form
4. After registration, log in
5. Access the dashboard to confirm everything is working

## Troubleshooting

### Issue: "Module not found" errors in backend

**Solution**: Make sure you installed all dependencies
```bash
pip install -r requirements.txt
pip install argon2-cffi  # For user_service
```

### Issue: Frontend can't connect to backend

**Solution**: 
1. Verify all backend services are running on their respective ports
2. Check that no CORS errors appear in browser console
3. Ensure you're using the correct API URLs (default: localhost:8000-8003)

### Issue: Database connection errors

**Solution**: 
- For PostgreSQL errors: The services will fall back to SQLite automatically
- For MongoDB errors: content_service uses in-memory storage as fallback
- For Elasticsearch errors: search_service uses in-memory storage as fallback

### Issue: Port already in use

**Solution**: 
```bash
# Find and kill process using the port (example for port 8000)
lsof -ti:8000 | xargs kill -9
```

### Issue: Password hashing error (argon2)

**Solution**:
```bash
pip install argon2-cffi
```

## Running in Production

For production deployment, consider:

1. **Use production databases**: PostgreSQL, MongoDB, Elasticsearch
2. **Set up RabbitMQ**: For real event-driven communication
3. **Configure environment variables**: Set all production URLs and secrets
4. **Use Docker**: Build and run services in containers
5. **Set up reverse proxy**: Use Nginx or similar
6. **Enable HTTPS**: Use Let's Encrypt or similar
7. **Set up monitoring**: Use tools like Prometheus, Grafana
8. **Configure CI/CD**: Automate testing and deployment

## Environment Variables Reference

### User Service
- `DATABASE_URL`: PostgreSQL connection string (default: SQLite)
- `SECRET_KEY`: JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

### Content Service
- `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: MongoDB database name
- `SECRET_KEY`: JWT secret key for validation

### Verification Service
- `DATABASE_URL`: PostgreSQL connection string (default: SQLite)
- `SECRET_KEY`: JWT secret key for validation
- `CONTENT_SERVICE_URL`: URL of content service

### Search Service
- `ELASTICSEARCH_URL`: Elasticsearch connection URL

### Frontend
- `NEXT_PUBLIC_API_URL`: User service URL (default: http://localhost:8000)
- `NEXT_PUBLIC_CONTENT_API_URL`: Content service URL (default: http://localhost:8001)
- `NEXT_PUBLIC_VERIFICATION_API_URL`: Verification service URL (default: http://localhost:8002)
- `NEXT_PUBLIC_SEARCH_API_URL`: Search service URL (default: http://localhost:8003)

## Architecture Notes

### Microservices Communication
- Services communicate via RESTful APIs
- JWT tokens are used for authentication across services
- Event-driven architecture (RabbitMQ) is stubbed for future implementation

### Database Strategy
- **user_service**: Uses SQLite by default, PostgreSQL in production
- **content_service**: Uses in-memory storage by default, MongoDB in production
- **verification_service**: Uses SQLite by default, PostgreSQL in production
- **search_service**: Uses in-memory storage by default, Elasticsearch in production

### Frontend Architecture
- Built with Next.js 15 and React 19
- Uses TypeScript for type safety
- Tailwind CSS 4 for styling
- Centralized API utilities in `src/lib/api.ts`
- JWT tokens stored in localStorage
- Environment variables for API URL configuration

## Next Steps

After setting up, you can:

1. **Customize the UI**: Modify components in `frontend_app/src/`
2. **Add features**: Extend the microservices with new endpoints
3. **Integrate real databases**: Replace SQLite with PostgreSQL/MongoDB
4. **Set up RabbitMQ**: Enable real event-driven communication
5. **Deploy to cloud**: Use Docker and Kubernetes for production

## Support

For issues or questions:
- Check the individual service README files
- Review the API documentation at `/docs` endpoints
- Open an issue on GitHub

## License

MIT License - See LICENSE file for details
