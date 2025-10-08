# VeridiaApp Troubleshooting Guide

## Connection Refused Errors (ERR_CONNECTION_REFUSED)

### Problem
Browser console shows errors like:
```
GET http://localhost:8003/api/v1/verify/{id}/comments net::ERR_CONNECTION_REFUSED
POST http://localhost:8003/api/v1/verify/{id}/vote net::ERR_CONNECTION_REFUSED
Failed to fetch vote stats: TypeError: Failed to fetch
Failed to fetch comments: TypeError: Failed to fetch
```

### Root Cause
The issue occurs when:
1. **Missing or incorrect environment variables** - The frontend is trying to connect to the wrong port for the verification service
2. **Verification service not running** - The service needs to be started on port 8002
3. **Missing database configuration** - The verification service requires a proper DATABASE_URL to start

### Solution

#### Step 1: Configure Verification Service Environment

Create or update `verification_service/.env` with the following content:

```bash
DATABASE_URL=postgresql://veruser:30937594PHINE@localhost:5432/veridiadb
RABBITMQ_URL=amqp://rabbituser:30937594PHINE@localhost:5672/
SECRET_KEY=your-secret-key-change-in-production
CONTENT_SERVICE_URL=http://localhost:8001
```

**Important Notes:**
- Replace `veruser:30937594PHINE` with your actual PostgreSQL username and password
- Replace `rabbituser:30937594PHINE` with your actual RabbitMQ username and password
- The `DATABASE_URL` is **required** - without it, the service will fail to start
- Make sure PostgreSQL is running on port 5432 with the database `veridiadb` created

#### Step 2: Configure Frontend Environment

Create or update `frontend_app/.env.local` with the correct API URLs:

```bash
# Backend API URLs for local development
# User Service (authentication)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Content Service (content management)
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8001

# Verification Service (voting and comments)
NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002

# Search Service (search and discovery)
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:8003
```

**Critical:** Ensure `NEXT_PUBLIC_VERIFICATION_API_URL` is set to `http://localhost:8002` (NOT 8003)

#### Step 3: Setup PostgreSQL Database

1. Make sure PostgreSQL is running:
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   # Or on macOS
   brew services list | grep postgresql
   ```

2. Create the database and user:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create user
   CREATE USER veruser WITH PASSWORD '30937594PHINE';
   
   # Create database
   CREATE DATABASE veridiadb;
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE veridiadb TO veruser;
   
   # Exit
   \q
   ```

#### Step 4: Setup RabbitMQ (Optional but recommended)

1. Install and start RabbitMQ:
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install rabbitmq-server
   sudo systemctl start rabbitmq-server
   
   # On macOS
   brew install rabbitmq
   brew services start rabbitmq
   ```

2. Create RabbitMQ user:
   ```bash
   # Create user
   sudo rabbitmqctl add_user rabbituser 30937594PHINE
   
   # Set permissions
   sudo rabbitmqctl set_permissions -p / rabbituser ".*" ".*" ".*"
   ```

#### Step 5: Start the Verification Service

```bash
cd verification_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

You should see output like:
```
INFO:     Uvicorn running on http://127.0.0.1:8002
INFO:     Application startup complete.
Verification Service starting up...
Database initialized
```

#### Step 6: Restart the Frontend

If the frontend is already running, **you must restart it** for environment variable changes to take effect:

```bash
# Stop the current dev server (Ctrl+C)
cd frontend_app
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

### Verification

1. **Check verification service is running:**
   ```bash
   curl http://localhost:8002/health
   ```
   Expected response: `{"status":"healthy"}`

2. **Check verification service endpoints:**
   ```bash
   # Replace {content_id} with an actual content ID
   curl http://localhost:8002/api/v1/verify/{content_id}/votes
   ```

3. **Check browser console:** After restarting frontend, requests should now go to port 8002

### Common Mistakes

1. **❌ Forgetting to create `.env` file** - The verification service needs DATABASE_URL configured
2. **❌ Using `.env.example` instead of `.env`** - The `.env.example` is just a template
3. **❌ Not restarting the frontend** - Environment variables are read at build/start time
4. **❌ PostgreSQL not running** - The service requires a running database
5. **❌ Wrong port in NEXT_PUBLIC_VERIFICATION_API_URL** - Must be 8002, not 8003

### Alternative: Using SQLite for Development

If you don't want to setup PostgreSQL, the verification service can fall back to SQLite:

1. Remove or comment out `DATABASE_URL` from `verification_service/.env`:
   ```bash
   # DATABASE_URL=postgresql://veruser:30937594PHINE@localhost:5432/veridiadb
   RABBITMQ_URL=amqp://rabbituser:30937594PHINE@localhost:5672/
   SECRET_KEY=your-secret-key-change-in-production
   CONTENT_SERVICE_URL=http://localhost:8001
   ```

2. The service will automatically use SQLite (`verification.db` file)

### Testing the Fix

1. Start all services (user_service on 8000, content_service on 8001, verification_service on 8002, search_service on 8003)
2. Start frontend on port 3000
3. Navigate to a content detail page
4. Check browser console - should see successful API calls to port 8002
5. Try voting and commenting - should work without errors

### Still Having Issues?

If you continue to see connection errors:

1. **Check all services are running on correct ports:**
   ```bash
   lsof -i :8000 # user_service
   lsof -i :8001 # content_service
   lsof -i :8002 # verification_service
   lsof -i :8003 # search_service
   ```

2. **Check frontend environment variables are loaded:**
   - Add `console.log(process.env.NEXT_PUBLIC_VERIFICATION_API_URL)` in your code
   - It should print `http://localhost:8002`

3. **Clear browser cache:** Sometimes browser caches failed requests

4. **Check CORS settings:** Make sure the backend services allow requests from localhost:3000

## Other Common Issues

### Port Already in Use

If you see "Address already in use" errors:

```bash
# Find process using the port
lsof -i :8002
# Kill the process
kill -9 <PID>
```

### Database Connection Failed

Check your PostgreSQL connection:
```bash
psql -U veruser -d veridiadb -h localhost
```

If connection fails, verify:
- PostgreSQL is running
- User exists and has correct password
- Database exists
- pg_hba.conf allows local connections

### RabbitMQ Connection Failed

The service will start even if RabbitMQ is not available (it just logs warnings). However, for full functionality:

```bash
# Check RabbitMQ status
sudo rabbitmqctl status
```
