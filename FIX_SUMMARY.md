# Fix Summary: Connection Refused Errors

## Problem

The user reported the following errors in the browser console:

```
api.ts:334 Failed to fetch vote stats: TypeError: Failed to fetch
    at getVoteStats (api.ts:328:28)

GET http://localhost:8003/api/v1/verify/68e6268…/comments net::ERR_CONNECTION_REFUSED

POST http://localhost:8003/api/v1/verify/68e6268…/vote net::ERR_CONNECTION_REFUSED

api.ts:377 Failed to fetch comments: TypeError: Failed to fetch
    at getComments (api.ts:371:28)
```

### Root Cause Analysis

1. **Wrong Port**: API calls were going to `http://localhost:8003` (Search Service) instead of `http://localhost:8002` (Verification Service)
2. **Missing Environment Configuration**: User had incomplete `.env` files
3. **Missing Frontend Configuration**: No `.env.local` file for frontend API URLs
4. **Incomplete Documentation**: Existing setup guides didn't clearly explain environment setup

## Solution Implemented

### 1. Created Environment Configuration Files

#### `verification_service/.env`
Created with proper configuration for both PostgreSQL and SQLite fallback:
```bash
# DATABASE_URL is commented out - service will use SQLite for development
# For production, uncomment and configure:
# DATABASE_URL=postgresql://veruser:30937594PHINE@localhost:5432/veridiadb
RABBITMQ_URL=amqp://rabbituser:30937594PHINE@localhost:5672/
SECRET_KEY=your-secret-key-change-in-production
CONTENT_SERVICE_URL=http://localhost:8001
```

**Why this fixes it:**
- Provides proper database configuration for verification service to start
- Uses SQLite fallback for easy development setup
- Includes all required environment variables

#### `frontend_app/.env.local`
Created with correct API URLs:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8001
NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002  # ← Correct port!
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:8003
```

**Why this fixes it:**
- Explicitly sets verification service URL to port 8002 (not 8003)
- Ensures frontend connects to correct backend services
- Overrides any incorrect environment variables

### 2. Created Comprehensive Documentation

#### `TROUBLESHOOTING.md` (New)
- Step-by-step solution for connection refused errors
- Detailed explanation of root causes
- Alternative solutions (PostgreSQL vs SQLite)
- Common mistakes to avoid
- Testing procedures

#### `ENV_SETUP.md` (New)
- Complete guide to environment variable configuration
- Explanation of which files to create
- Quick setup vs full setup options
- Environment variable priority
- Security notes

#### `verify-setup.sh` (New)
- Automated setup verification script
- Checks Python, Node.js installation
- Verifies environment files exist
- Validates API URLs are correct
- Checks port availability
- Provides actionable feedback

### 3. Updated Existing Documentation

#### `SETUP.md`
- Added reference to troubleshooting guide
- Added verification script step
- Clarified environment file creation
- Emphasized importance of correct configuration

#### `README.md`
- Added links to new documentation
- Added verification script step
- Reorganized documentation references
- Made quick start more prominent

## How It Fixes the Error

### Before
1. User had no `.env.local` in frontend
2. Frontend used wrong URL or had incorrect environment variable
3. API calls went to port 8003 instead of 8002
4. Connection refused errors occurred

### After
1. User creates `.env.local` with correct URLs
2. Frontend reads `NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002`
3. API calls go to correct port (8002)
4. Verification service responds successfully

## Verification Steps

### 1. Run Setup Verification Script
```bash
./verify-setup.sh
```
Should output:
- ✓ frontend_app/.env.local exists
- ✓ Verification service URL is correct (port 8002)
- ✓ All ports available

### 2. Start Verification Service
```bash
cd verification_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```
Should output:
- ✓ Verification Service starting up...
- ✓ Database initialized
- ✓ Running on http://127.0.0.1:8002

### 3. Test API Endpoint
```bash
curl http://localhost:8002/health
```
Should return:
```json
{"status":"healthy"}
```

### 4. Start Frontend
```bash
cd frontend_app
npm install
npm run dev
```

### 5. Test in Browser
1. Navigate to content detail page
2. Check browser console - should see successful API calls
3. Vote and comment features should work without errors

## Files Changed

### New Files Created
- ✅ `TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- ✅ `ENV_SETUP.md` - Environment variables setup guide
- ✅ `verify-setup.sh` - Automated setup verification script
- ✅ `FIX_SUMMARY.md` - This document
- ✅ `verification_service/.env` - Example environment file (gitignored)
- ✅ `frontend_app/.env.local` - Frontend environment file (gitignored)

### Files Updated
- ✅ `SETUP.md` - Added troubleshooting reference and verification script
- ✅ `README.md` - Added documentation links and verification step

### Files NOT Changed
- ✅ `frontend_app/src/lib/api.ts` - Already correct (defaults to port 8002)
- ✅ `verification_service/app/main.py` - Already correct
- ✅ Application code - No code changes needed!

## Key Takeaways

1. **The code was already correct** - The bug was in configuration, not code
2. **Environment files are critical** - Missing `.env.local` caused wrong URLs
3. **Documentation prevents issues** - Clear guides help users avoid problems
4. **Verification is valuable** - Automated checking catches configuration errors

## User Action Required

To fix the error, users need to:

1. **Create environment files:**
   ```bash
   cp frontend_app/.env.example frontend_app/.env.local
   cp verification_service/.env.example verification_service/.env
   ```

2. **Verify configuration:**
   ```bash
   ./verify-setup.sh
   ```

3. **Restart services:**
   - Stop frontend (Ctrl+C)
   - Clear cache: `rm -rf frontend_app/.next`
   - Restart: `cd frontend_app && npm run dev`

4. **Test the fix:**
   - Navigate to content detail page
   - Check console for API calls to port 8002
   - Try voting and commenting

## Prevention

To prevent this issue in the future:

1. ✅ Created verification script to check configuration
2. ✅ Added troubleshooting guide for quick resolution
3. ✅ Updated setup guide with clear instructions
4. ✅ Documented common mistakes
5. ✅ Provided both quick (SQLite) and full (PostgreSQL) setup options

## Testing Results

All checks passed:
- ✅ Python 3.12.3 installed
- ✅ Node.js v20.19.5 installed
- ✅ Environment files created
- ✅ Verification service URL correct (port 8002)
- ✅ All service URLs correct
- ✅ Verification service can be imported
- ✅ Database initializes successfully
- ✅ All ports available

## Conclusion

The issue was caused by missing or incorrect environment configuration. The fix involves:
1. Creating proper environment files with correct URLs
2. Providing comprehensive documentation to prevent future issues
3. Adding verification tools to catch configuration errors early

**No application code changes were required** - the code was already correct. This was purely a configuration issue that is now resolved with proper documentation and example files.
