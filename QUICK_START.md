# Quick Start Guide - After CORS Fix

## What Changed?

The frontend now uses Next.js API routes to communicate with backend services instead of making direct calls from the browser. This fixes:
- ✅ Connection refused errors
- ✅ CORS issues
- ✅ Security concerns

## Setup Steps

### 1. Configure Environment Variables

```bash
cd frontend_app
cp .env.example .env
```

The `.env` file should contain:
```bash
# Server-side variables (used by Next.js API routes)
API_URL=http://localhost:8000
CONTENT_API_URL=http://localhost:8001
VERIFICATION_API_URL=http://localhost:8002
SEARCH_API_URL=http://localhost:8003

# Client-side variable (for user authentication)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Install Dependencies

```bash
cd frontend_app
npm install
```

### 3. Start Backend Services

Make sure all backend services are running:

```bash
# Terminal 1 - User Service
cd user_service
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Content Service  
cd content_service
uvicorn app.main:app --reload --port 8001

# Terminal 3 - Verification Service
cd verification_service
uvicorn app.main:app --reload --port 8002

# Terminal 4 - Search Service
cd search_service
uvicorn app.main:app --reload --port 8003
```

### 4. Start Frontend

```bash
cd frontend_app
npm run dev
```

The app will be available at http://localhost:3000

## Verify It's Working

### Test Search Service

1. Go to http://localhost:3000/discovery
2. You should see categories loading (no more connection errors!)
3. Try searching for content
4. Check browser console - no CORS errors

### Test Content Service

1. Go to http://localhost:3000/discovery
2. Content feed should load without errors
3. Click on any content item
4. Detail page should load

### Test Verification Service

1. Log in (if not already)
2. Navigate to any content item
3. Try voting (verify/dispute)
4. Try posting a comment
5. All should work without CORS errors

## What If Something Doesn't Work?

### Backend service not running

**Symptom:** Console shows 500 errors from `/api/*` endpoints

**Solution:** Start the corresponding backend service

### Frontend not connecting to backend

**Symptom:** All API calls fail with connection errors

**Solution:** 
1. Check `.env` file has correct URLs
2. Restart the dev server: `npm run dev`
3. Check backend services are running on correct ports

### Still seeing CORS errors

**Symptom:** Browser console shows CORS policy errors

**Solution:** 
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check you're not using old cached code

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ http://localhost:3000/api/search
       ▼
┌─────────────┐
│  Next.js    │
│  API Routes │
└──────┬──────┘
       │ http://localhost:8003/api/v1/search
       ▼
┌─────────────┐
│   Search    │
│   Service   │
└─────────────┘
```

All backend communication happens **server-side** through Next.js API routes.

## Production Deployment

For production, update environment variables to point to your production backend services:

```bash
API_URL=https://api.yourapp.com
CONTENT_API_URL=https://content.yourapp.com
VERIFICATION_API_URL=https://verify.yourapp.com
SEARCH_API_URL=https://search.yourapp.com
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api/v1
```

No code changes needed - just environment configuration!

## Need More Help?

See `CORS_FIX.md` for detailed documentation on:
- All API routes created
- Code changes made
- Troubleshooting guide
- Security benefits
