# Local Setup Guide - VeridiaApp

**Version**: 1.0  
**Last Updated**: 2024  
**Target Audience**: New developers setting up VeridiaApp locally for the first time

---

## Overview

This guide provides step-by-step instructions to clone, configure, and run VeridiaApp on your local machine. VeridiaApp follows a **microservices architecture** with four backend services and a Next.js frontend.

### Architecture at a Glance

```
Frontend (Next.js 15 + React 19)
    ↓
┌──────────────────────────────────────────┐
│         Backend Microservices            │
├──────────────────────────────────────────┤
│ user_service (Port 8000)      PostgreSQL │
│ content_service (Port 8001)   MongoDB    │
│ verification_service (Port 8002) PostgreSQL │
│ search_service (Port 8003)    Elasticsearch │
└──────────────────────────────────────────┘
```

---

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

### Required Software

1. **Python 3.11 or higher**
   - Check version: `python3 --version`
   - Download: [python.org](https://www.python.org/downloads/)

2. **Node.js 20 or higher**
   - Check version: `node --version`
   - Download: [nodejs.org](https://nodejs.org/)

3. **npm (comes with Node.js)**
   - Check version: `npm --version`

4. **Git**
   - Check version: `git --version`
   - Download: [git-scm.com](https://git-scm.com/downloads)

### Optional Dependencies (for production-like setup)

These are optional for local development. The services will use fallback in-memory or SQLite databases if not available:

- **PostgreSQL 14+**: For user_service and verification_service
- **MongoDB 6.0+**: For content_service
- **Elasticsearch 8.x**: For search_service
- **RabbitMQ 3.x**: For event-driven messaging

---

## Step 1: Clone the Repository

Open your terminal and run:

```bash
# Clone the repository
git clone https://github.com/MachariaP/VeridiaApp.git

# Navigate to the project directory
cd VeridiaApp
```

**What happens**: This downloads the entire VeridiaApp codebase to your local machine.

---

## Step 2: Verify Your Environment (Recommended)

VeridiaApp includes a setup verification script that checks if your environment is properly configured.

```bash
# Make the script executable (Linux/macOS)
chmod +x verify-setup.sh

# Run the verification script
./verify-setup.sh
```

**Expected Output**:
```
======================================
VeridiaApp Setup Verification
======================================

Checking Python...
✓ Python 3 installed (version 3.11.x)

Checking Node.js...
✓ Node.js installed (version v20.x.x)
✓ npm installed (version 10.x.x)

...
```

**Action Required**: If any checks fail, install the missing dependencies before proceeding.

---

## Step 3: Configure Environment Variables

### Frontend Environment Configuration

The frontend needs to know where to find the backend services.

```bash
# Navigate to the frontend directory
cd frontend_app

# Copy the example environment file
cp .env.example .env.local

# Return to root directory
cd ..
```

**Edit `frontend_app/.env.local`** to contain:

```bash
# Backend API URLs for local development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8001
NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:8003
```

**Note**: The `.env.local` file is gitignored and won't be committed to version control.

### Backend Services Environment (Optional)

For local development, backend services can run with default configurations (SQLite/in-memory storage). To use production databases:

**User Service** (PostgreSQL - Optional):
```bash
cd user_service
cp .env.example .env
# Edit .env to add: DATABASE_URL=postgresql://user:password@localhost:5432/veridiadb
cd ..
```

**Content Service** (MongoDB - Optional):
```bash
cd content_service
cp .env.example .env
# Edit .env to add: MONGODB_URL=mongodb://localhost:27017
cd ..
```

**Verification Service** (PostgreSQL - Optional):
```bash
cd verification_service
cp .env.example .env
# Edit .env to add: DATABASE_URL=postgresql://user:password@localhost:5432/veridiadb
cd ..
```

**Search Service** (Elasticsearch - Optional):
```bash
cd search_service
cp .env.example .env
# Edit .env to add: ELASTICSEARCH_URL=http://localhost:9200
cd ..
```

---

## Step 4: Install Backend Dependencies

You'll need to install Python dependencies for each backend service. Open **four separate terminal windows** and run these commands:

### Terminal 1 - User Service

```bash
cd user_service

# Install Python dependencies
pip install -r requirements.txt

# Install password hashing library (required)
pip install argon2-cffi
```

### Terminal 2 - Content Service

```bash
cd content_service

# Install Python dependencies
pip install -r requirements.txt
```

### Terminal 3 - Verification Service

```bash
cd verification_service

# Install Python dependencies
pip install -r requirements.txt
```

### Terminal 4 - Search Service

```bash
cd search_service

# Install Python dependencies
pip install -r requirements.txt
```

**Common Issues**:
- If `pip` is not found, try `pip3`
- On Windows, use `py -m pip install -r requirements.txt`
- For permission issues on Linux/macOS, consider using a virtual environment (see Appendix)

---

## Step 5: Start Backend Services

Keep the four terminal windows open and start each service:

### Terminal 1 - User Service (Port 8000)

```bash
# From user_service directory
uvicorn app.main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify**: Open http://localhost:8000 in your browser. You should see service information.
**API Docs**: http://localhost:8000/docs

---

### Terminal 2 - Content Service (Port 8001)

```bash
# From content_service directory
uvicorn app.main:app --reload --port 8001
```

**Verify**: Open http://localhost:8001 in your browser.
**API Docs**: http://localhost:8001/docs

---

### Terminal 3 - Verification Service (Port 8002)

```bash
# From verification_service directory
uvicorn app.main:app --reload --port 8002
```

**Verify**: Open http://localhost:8002 in your browser.
**API Docs**: http://localhost:8002/docs

---

### Terminal 4 - Search Service (Port 8003)

```bash
# From search_service directory
uvicorn app.main:app --reload --port 8003
```

**Verify**: Open http://localhost:8003 in your browser.
**API Docs**: http://localhost:8003/docs

---

## Step 6: Install Frontend Dependencies

Open a **fifth terminal window**:

```bash
cd frontend_app

# Install Node.js dependencies (this may take a few minutes)
npm install
```

**Expected Output**:
```
added 200+ packages in 30s
```

---

## Step 7: Start the Frontend Development Server

```bash
# From frontend_app directory
npm run dev
```

**Expected Output**:
```
  ▲ Next.js 15.5.3
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

**Access the Application**: Open http://localhost:3000 in your browser.

---

## Step 8: Verify Everything is Working

### Quick Health Check

Run these commands in a new terminal window:

```bash
# Check all service health endpoints
curl http://localhost:8000/health  # User Service
curl http://localhost:8001/health  # Content Service
curl http://localhost:8002/health  # Verification Service
curl http://localhost:8003/health  # Search Service
```

**Expected Output**: Each should return `{"status":"healthy"}` or similar.

### Test the Full Stack

1. **Open Frontend**: Navigate to http://localhost:3000
2. **Register a New Account**: Click "Sign Up" and create a test account
3. **Login**: Use your test credentials to log in
4. **Create Content**: Navigate to the dashboard and create a test content item
5. **View Content**: Check if the content appears and you can vote/comment on it

---

## Common Issues and Troubleshooting

### Issue: Port Already in Use

**Symptom**: `Error: address already in use`

**Solution**:
```bash
# Find the process using the port (example for port 8000)
# Linux/macOS:
lsof -i :8000

# Windows:
netstat -ano | findstr :8000

# Kill the process or use a different port
uvicorn app.main:app --reload --port 8005
```

---

### Issue: Module Not Found

**Symptom**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure you're in the correct service directory
cd user_service

# Reinstall dependencies
pip install -r requirements.txt
```

---

### Issue: Database Connection Error

**Symptom**: `could not connect to server: Connection refused`

**Solution**:
- For local development, **remove or comment out** the `DATABASE_URL` in the `.env` file
- The service will automatically fall back to SQLite (user_service, verification_service) or in-memory storage (content_service, search_service)

---

### Issue: Frontend Not Connecting to Backend

**Symptom**: Network errors in browser console, "Failed to fetch"

**Solution**:
1. Verify all backend services are running (check terminal windows)
2. Verify `frontend_app/.env.local` has correct URLs
3. Restart the frontend dev server:
   ```bash
   # Stop the server (CTRL+C)
   # Clear Next.js cache
   rm -rf .next
   # Restart
   npm run dev
   ```

---

### Issue: CORS Errors

**Symptom**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: This should already be configured. If you still see CORS errors:
- Ensure all backend services are running on the correct ports
- Check that CORS is enabled in each service's `main.py` file
- Clear browser cache and reload

---

## Development Workflow

Once everything is set up, your typical development workflow will be:

### Starting the Application

1. Open 5 terminal windows
2. Start the 4 backend services (user, content, verification, search)
3. Start the frontend service
4. Access http://localhost:3000

### Making Changes

- **Backend Changes**: Uvicorn auto-reloads on file changes (thanks to `--reload` flag)
- **Frontend Changes**: Next.js auto-reloads on file changes
- **Environment Changes**: Restart the affected service

### Stopping the Application

- Press `CTRL+C` in each terminal window to stop the respective service

---

## Next Steps

Now that your local environment is set up:

1. **Read the API Documentation**: Visit each service's `/docs` endpoint to understand available APIs
2. **Review the Architecture**: See `README.md` for detailed architecture information
3. **Explore the Code**: Start with `user_service/app/main.py` and `frontend_app/src/app/page.tsx`
4. **Set Up Deployment**: Proceed to `02_initial_deployment_strategy.md`

---

## Appendix: Using Python Virtual Environments

For better dependency isolation, consider using Python virtual environments:

```bash
# Create a virtual environment for each service
cd user_service
python3 -m venv venv

# Activate the virtual environment
# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --reload --port 8000

# To deactivate when done:
deactivate
```

---

## Summary

✅ **You've successfully set up VeridiaApp locally!**

**Running Services:**
- User Service: http://localhost:8000
- Content Service: http://localhost:8001
- Verification Service: http://localhost:8002
- Search Service: http://localhost:8003
- Frontend: http://localhost:3000

**Key Files:**
- `frontend_app/.env.local` - Frontend configuration
- `*_service/.env` - Backend service configurations (optional)
- `verify-setup.sh` - Setup verification script

**For Support:**
- See `TROUBLESHOOTING.md` for more detailed solutions
- Check service logs in the terminal windows
- Review API documentation at each service's `/docs` endpoint
