# Architecture & Fix Diagram

## The Problem: Wrong Service Connection

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Browser Console Error:                                          │
│                                                                   │
│  GET http://localhost:8003/api/v1/verify/{id}/comments           │
│  ❌ net::ERR_CONNECTION_REFUSED                                  │
│                                                                   │
│  POST http://localhost:8003/api/v1/verify/{id}/vote              │
│  ❌ net::ERR_CONNECTION_REFUSED                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (localhost:3000)                                        │
│                                                                   │
│  Missing or Wrong: frontend_app/.env.local                        │
│  ❌ NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8003       │
│     (or missing entirely)                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Wrong Port!
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Search Service (localhost:8003)                                  │
│  ❌ This service doesn't handle verification endpoints!           │
└─────────────────────────────────────────────────────────────────┘

                              X
        Should connect here ──┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Verification Service (localhost:8002)                            │
│  ✅ Ready to handle votes and comments                           │
│  ❌ But frontend never connects to it!                           │
└─────────────────────────────────────────────────────────────────┘
```

## The Solution: Correct Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser Console:                                                 │
│                                                                   │
│  GET http://localhost:8002/api/v1/verify/{id}/comments           │
│  ✅ 200 OK - Comments retrieved                                  │
│                                                                   │
│  POST http://localhost:8002/api/v1/verify/{id}/vote              │
│  ✅ 200 OK - Vote submitted                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (localhost:3000)                                        │
│                                                                   │
│  ✅ frontend_app/.env.local (created):                           │
│     NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Correct Port!
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Verification Service (localhost:8002)                            │
│  ✅ Receives requests correctly                                  │
│  ✅ Returns vote stats, comments                                 │
│  ✅ Handles votes and comments                                   │
│                                                                   │
│  ✅ verification_service/.env (created):                         │
│     Uses SQLite by default for easy development                  │
│     Can be configured for PostgreSQL                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Complete Architecture with All Services

```
                    ┌──────────────────────────┐
                    │   Browser / User         │
                    │   localhost:3000         │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTP Requests
                                 │
                    ┌────────────▼─────────────┐
                    │  Frontend (Next.js)      │
                    │  Port: 3000              │
                    │                          │
                    │  .env.local:             │
                    │  ├─ User Service: 8000   │
                    │  ├─ Content: 8001        │
                    │  ├─ Verification: 8002   │◄── Fix: Correct port!
                    │  └─ Search: 8003         │
                    └──────┬───┬───┬───┬───────┘
                           │   │   │   │
         ┌─────────────────┘   │   │   └──────────────────┐
         │                     │   │                       │
    ┌────▼────┐          ┌────▼───▼────┐          ┌──────▼───────┐
    │ User    │          │ Content     │          │ Search       │
    │ Service │          │ Service     │          │ Service      │
    │ Port:   │          │ Port: 8001  │          │ Port: 8003   │
    │ 8000    │          │             │          │              │
    │         │          │ MongoDB     │          │ Elasticsearch│
    │ SQLite/ │          │ or in-mem   │          │ or in-mem    │
    │ Postgres│          └─────────────┘          └──────────────┘
    └─────────┘                   │
         │                        │
         │              ┌─────────▼────────────┐
         │              │ Verification Service │
         │              │ Port: 8002           │◄── This service!
         │              │                      │
         │              │ .env:                │
         │              │ ├─ DATABASE_URL      │
         │              │ ├─ RABBITMQ_URL      │
         │              │ ├─ SECRET_KEY        │
         │              │ └─ CONTENT_SERVICE   │
         │              │                      │
         │              │ SQLite/PostgreSQL    │
         └──────────────┴──────────────────────┘
                        │
                   ┌────▼─────┐
                   │ RabbitMQ │
                   │ Port:    │
                   │ 5672     │
                   │ (optional)│
                   └──────────┘
```

## Service Responsibilities

```
┌─────────────────────────────────────────────────────────────────┐
│ User Service (8000)                                               │
│ ━━━━━━━━━━━━━━━━━                                                │
│ • User registration                                               │
│ • Authentication (JWT)                                            │
│ • User profile management                                         │
│ • Database: SQLite/PostgreSQL                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Content Service (8001)                                            │
│ ━━━━━━━━━━━━━━━━━━━                                             │
│ • Content creation                                                │
│ • Content retrieval                                               │
│ • Content listing                                                 │
│ • Database: MongoDB/In-memory                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Verification Service (8002) ← THE FIX FOCUSES HERE               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━                                    │
│ • ✅ Vote submission (verify/dispute)                            │
│ • ✅ Vote statistics retrieval                                   │
│ • ✅ Comment submission                                          │
│ • ✅ Comment retrieval                                           │
│ • Community discussions                                           │
│ • AI verification (stub)                                          │
│ • Database: SQLite/PostgreSQL                                     │
│                                                                   │
│ Endpoints:                                                        │
│ • POST /api/v1/verify/{id}/vote     ← Was going to 8003!        │
│ • GET  /api/v1/verify/{id}/votes    ← Was going to 8003!        │
│ • POST /api/v1/verify/{id}/comments ← Was going to 8003!        │
│ • GET  /api/v1/verify/{id}/comments ← Was going to 8003!        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Search Service (8003)                                             │
│ ━━━━━━━━━━━━━━━━━━                                             │
│ • Content search                                                  │
│ • Content discovery                                               │
│ • Category management                                             │
│ • Database: Elasticsearch/In-memory                               │
└─────────────────────────────────────────────────────────────────┘
```

## Fix Implementation

### What Was Wrong?
```
❌ Missing frontend_app/.env.local
   → Frontend used wrong URL or undefined variable
   → API calls went to port 8003 instead of 8002

❌ Missing verification_service/.env
   → Service might fail to start without database config
   → Unclear which database to use

❌ No verification script
   → Users couldn't validate their setup
   → Configuration errors went unnoticed
```

### What Was Fixed?
```
✅ Created frontend_app/.env.local
   NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002
   → Frontend now connects to correct service
   → All verification endpoints work

✅ Created verification_service/.env
   DATABASE_URL commented out → Uses SQLite by default
   RABBITMQ_URL configured → Service starts cleanly
   → Easy development setup
   → Production-ready when configured

✅ Created verify-setup.sh
   → Checks all environment files
   → Validates API URLs
   → Tests service imports
   → Confirms ports available
   → Provides actionable feedback

✅ Created comprehensive documentation
   → TROUBLESHOOTING.md - Solutions to errors
   → ENV_SETUP.md - Environment guide
   → FIX_SUMMARY.md - Complete explanation
   → Updated SETUP.md and README.md
```

## Testing the Fix

### Before Fix
```bash
# Start services
cd verification_service && uvicorn app.main:app --reload --port 8002 &
cd frontend_app && npm run dev &

# Open browser console
# Result: ❌ Connection Refused to port 8003
```

### After Fix
```bash
# Verify setup
./verify-setup.sh
# Result: ✅ All checks pass

# Start services
cd verification_service && uvicorn app.main:app --reload --port 8002 &
cd frontend_app && npm run dev &

# Open browser console
# Result: ✅ Successful API calls to port 8002
```

## Prevention

To prevent this issue for other users:

1. ✅ **Documentation** - Clear setup guides
2. ✅ **Verification** - Automated setup checking
3. ✅ **Examples** - `.env.example` files as templates
4. ✅ **Defaults** - Sensible fallbacks in code
5. ✅ **Troubleshooting** - Common problems and solutions

## Key Files

```
VeridiaApp/
│
├── frontend_app/
│   ├── .env.example         # Template (committed)
│   ├── .env.local           # Actual config (gitignored) ← CREATED
│   └── src/lib/api.ts       # Already correct, no changes
│
├── verification_service/
│   ├── .env.example         # Template (committed)
│   ├── .env                 # Actual config (gitignored) ← CREATED
│   └── app/main.py          # Already correct, no changes
│
├── TROUBLESHOOTING.md       # ← CREATED
├── ENV_SETUP.md             # ← CREATED
├── FIX_SUMMARY.md           # ← CREATED
├── verify-setup.sh          # ← CREATED
├── SETUP.md                 # ← UPDATED
└── README.md                # ← UPDATED
```

## Summary

**The Problem**: Missing environment configuration caused API calls to go to wrong port (8003 instead of 8002)

**The Solution**: Created proper environment files with correct URLs and comprehensive documentation

**The Result**: All services connect correctly, errors resolved, future issues prevented

**No Code Changes**: The application code was already correct - this was purely a configuration issue!
