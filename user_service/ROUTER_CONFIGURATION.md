# Router Configuration Documentation

## Issue: Duplicate /api/v1 Prefix

### Problem Statement
Previously, there were reports of 404 errors when clients attempted to access endpoints like:
```
POST /api/v1/api/v1/auth/login
```

This URL has a duplicate `/api/v1` prefix, which causes the endpoint not to be found.

### Root Cause
The duplicate prefix issue can occur if the router is defined with a prefix parameter AND then included in the main app with another prefix. For example:

**❌ INCORRECT Configuration (causes duplicate):**
```python
# In auth.py
router = APIRouter(prefix="/api/v1")  # ❌ Has prefix

# In main.py
app.include_router(auth.router, prefix="/api/v1/auth")  # ❌ Another prefix

# Result: Endpoints at /api/v1/api/v1/auth/login (WRONG!)
```

### Correct Configuration
**✓ CORRECT Configuration (no duplicate):**
```python
# In app/api/v1/endpoints/auth.py
router = APIRouter()  # ✓ NO prefix parameter

# In app/main.py
app.include_router(auth.router, prefix="/api/v1/auth")  # ✓ Prefix only here

# Result: Endpoints at /api/v1/auth/login (CORRECT!)
```

### Endpoints
The authentication service correctly exposes the following endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile (requires authentication)

### Verification
You can verify the configuration is correct by running:

```bash
# Start the server
uvicorn app.main:app --reload --port 8000

# In another terminal, run the test script
python3 test_endpoints.py
```

The test script will:
1. Verify that correct endpoints (`/api/v1/auth/*`) work
2. Verify that duplicate prefix paths (`/api/v1/api/v1/auth/*`) are rejected with 404
3. Confirm the error message guides users to the correct paths

### Key Points
1. **Router Definition**: The `auth.router` is created WITHOUT any prefix parameter
2. **Router Inclusion**: The prefix is specified when including the router in main.py
3. **Single Source of Truth**: The `/api/v1/auth` prefix is defined in exactly one place
4. **Error Handling**: Invalid paths are caught by the catch-all route and return helpful error messages

### Testing
Run the included test script to verify endpoints:
```bash
python3 test_endpoints.py
```

Expected output:
```
✓ GET / - OK
✓ POST /api/v1/auth/register - Endpoint exists
✓ POST /api/v1/auth/login - Endpoint exists
✓ GET /api/v1/auth/me - Endpoint exists
✓ POST /api/v1/api/v1/auth/login - Correctly rejected with 404

ALL TESTS PASSED ✓
```

### Maintenance
When adding new routers or modifying existing ones:
1. **Never** define a prefix on the router itself (e.g., `APIRouter(prefix="/api/v1")`)
2. **Always** specify the full prefix when including the router in main.py
3. **Test** that duplicate prefix paths are correctly rejected
4. **Document** any changes to the API path structure
