# Quick Fix: Connection Refused Errors

> **If you're seeing `ERR_CONNECTION_REFUSED` errors in your browser console when trying to vote or comment on content, follow these steps to fix it quickly.**

## TL;DR - The Fix

```bash
# 1. Create frontend environment file
cd frontend_app
cp .env.example .env.local

# 2. Create verification service environment file
cd ../verification_service
cp .env.example .env

# 3. Verify the fix worked
cd ..
./verify-setup.sh

# 4. Restart frontend (important!)
cd frontend_app
rm -rf .next  # Clear cache
npm run dev
```

## Detailed Steps

### Step 1: Check Your Error

Open your browser console (F12) and look for errors like:

```
GET http://localhost:8003/api/v1/verify/.../comments
❌ net::ERR_CONNECTION_REFUSED

POST http://localhost:8003/api/v1/verify/.../vote
❌ net::ERR_CONNECTION_REFUSED

Failed to fetch vote stats
Failed to fetch comments
```

**Notice the port 8003?** That's wrong! It should be **8002**.

### Step 2: Create Frontend Configuration

The frontend needs to know which port each service runs on.

```bash
cd frontend_app
cp .env.example .env.local
```

Open `frontend_app/.env.local` and verify it contains:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8001
NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002  # ← This must be 8002!
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:8003
```

**Critical**: The verification service URL must be port **8002**, not 8003!

### Step 3: Create Verification Service Configuration

```bash
cd verification_service
cp .env.example .env
```

For quick local development, edit `verification_service/.env` and comment out the DATABASE_URL:

```bash
# Comment out this line for SQLite (easier for dev):
# DATABASE_URL=postgresql://veruser:30937594PHINE@localhost:5432/veridiadb

# Keep these:
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
SECRET_KEY=your-secret-key-change-in-production
CONTENT_SERVICE_URL=http://localhost:8001
```

This makes the service use SQLite instead of PostgreSQL (easier for development).

### Step 4: Verify Configuration

Run the verification script:

```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

You should see:
```
✓ frontend_app/.env.local exists
✓ Verification service URL is correct (port 8002)
✓ Your setup looks good!
```

### Step 5: Restart Frontend

**Important:** You MUST restart the frontend for changes to take effect!

```bash
cd frontend_app

# Stop the dev server (Ctrl+C if running)

# Clear Next.js cache
rm -rf .next

# Start again
npm run dev
```

### Step 6: Start Verification Service

If not already running:

```bash
cd verification_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

You should see:
```
Verification Service starting up...
Database initialized
INFO:     Uvicorn running on http://127.0.0.1:8002
```

### Step 7: Test It Works

1. Open your browser to http://localhost:3000
2. Navigate to any content detail page
3. Open browser console (F12)
4. Try to vote or comment
5. Check console - should now show:
   ```
   GET http://localhost:8002/api/v1/verify/.../comments
   ✓ 200 OK
   ```

## Still Not Working?

### Check 1: Is the verification service running?

```bash
curl http://localhost:8002/health
```

Should return: `{"status":"healthy"}`

If you get connection refused, the service isn't running. Start it:
```bash
cd verification_service
uvicorn app.main:app --reload --port 8002
```

### Check 2: Is frontend using the right URL?

Open `frontend_app/.env.local` and check:
```bash
NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002
```

Must be 8002, not 8003!

### Check 3: Did you restart the frontend?

Environment variables are only read at startup. You MUST restart:
```bash
# In frontend_app directory
rm -rf .next
npm run dev
```

### Check 4: Is port 8002 already in use?

```bash
lsof -i :8002
```

If something else is using port 8002, kill it:
```bash
kill -9 <PID>
```

Then start verification service again.

## Why Does This Happen?

The frontend needs environment variables to know which port each backend service runs on:

- Port 8000: User Service (authentication)
- Port 8001: Content Service (content management)
- Port 8002: Verification Service (votes & comments) ← **This one!**
- Port 8003: Search Service (search & discovery)

Without the `.env.local` file, the frontend might:
1. Use incorrect default values
2. Connect to wrong service
3. Get connection refused errors

## Prevention

To avoid this issue in the future:

1. **Always create .env.local** when setting up the frontend
2. **Always restart frontend** after changing .env.local
3. **Run verify-setup.sh** before starting services
4. **Check documentation** if something isn't working

## More Help

- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Comprehensive troubleshooting guide
- **[ENV_SETUP.md](ENV_SETUP.md)** - Complete environment setup guide
- **[SETUP.md](SETUP.md)** - Full setup instructions
- **[FIX_SUMMARY.md](FIX_SUMMARY.md)** - Detailed explanation of this fix

## Summary

1. ✅ Create `frontend_app/.env.local` from `.env.example`
2. ✅ Verify `NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002`
3. ✅ Create `verification_service/.env` from `.env.example`
4. ✅ Run `./verify-setup.sh` to check configuration
5. ✅ Restart frontend with `rm -rf .next && npm run dev`
6. ✅ Start verification service on port 8002
7. ✅ Test in browser - errors should be gone!

---

**Need more help?** See the full [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide.
