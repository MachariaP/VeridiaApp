# CORS and Connection Issue Fix

## Problem

The frontend was making client-side fetch calls directly to backend microservices, causing:

1. **ERR_CONNECTION_REFUSED**: Browser tried to connect to `localhost:8003` on the user's machine instead of the server
2. **CORS Issues**: Cross-origin requests from browser to backend services were blocked
3. **Security Concerns**: Backend service URLs were exposed in client-side code

### Error Example
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
:8003/api/v1/search/categories:1
```

## Solution

Implemented Next.js API Routes as proxy endpoints that handle all backend communication server-side.

### Architecture

**Before (❌ Broken):**
```
Browser → http://localhost:8003/api/v1/search/categories
         (Connection refused - service not on user's machine)
```

**After (✅ Working):**
```
Browser → /api/search/categories (Next.js API Route)
        → Next.js Server → http://localhost:8003/api/v1/search/categories
        → Backend Service → Response
```

## Changes Made

### 1. Created API Proxy Routes

Created the following Next.js API route handlers in `frontend_app/src/app/api/`:

#### Search Service Proxies
- `api/search/route.ts` - Search content
- `api/search/categories/route.ts` - Get available categories

#### Content Service Proxies
- `api/content/route.ts` - List all content
- `api/content/[id]/route.ts` - Get content by ID, Delete content
- `api/content/create/route.ts` - Create new content

#### Verification Service Proxies
- `api/verify/[id]/vote/route.ts` - Submit vote
- `api/verify/[id]/votes/route.ts` - Get vote statistics
- `api/verify/[id]/comments/route.ts` - Get/Post comments
- `api/verify/[id]/comments/[commentId]/route.ts` - Delete comment

### 2. Updated API Client Functions

Modified `frontend_app/src/lib/api.ts` to use proxy routes:

**Before:**
```typescript
const SEARCH_API_URL = process.env.NEXT_PUBLIC_SEARCH_API_URL || "http://localhost:8003";
const response = await fetch(`${SEARCH_API_URL}/api/v1/search/categories`);
```

**After:**
```typescript
const response = await fetch('/api/search/categories');
```

### 3. Updated Environment Variables

Changed from client-side to server-side environment variables:

**Old (.env.example):**
```bash
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:8003
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8001
NEXT_PUBLIC_VERIFICATION_API_URL=http://localhost:8002
```

**New (.env.example):**
```bash
# Server-side only (no NEXT_PUBLIC_ prefix)
SEARCH_API_URL=http://localhost:8003
CONTENT_API_URL=http://localhost:8001
VERIFICATION_API_URL=http://localhost:8002
API_URL=http://localhost:8000

# Client-side (for direct user auth API calls)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

All references to `NEXT_PUBLIC_CONTENT_API_URL`, `NEXT_PUBLIC_VERIFICATION_API_URL`, and `NEXT_PUBLIC_SEARCH_API_URL` have been removed from the codebase.

## Setup Instructions

### For Development

1. Copy the environment template:
   ```bash
   cd frontend_app
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Make sure all backend services are running:
   - User Service: `http://localhost:8000`
   - Content Service: `http://localhost:8001`
   - Verification Service: `http://localhost:8002`
   - Search Service: `http://localhost:8003`

### For Production

Set environment variables on your hosting platform:

```bash
API_URL=https://your-user-service.com
CONTENT_API_URL=https://your-content-service.com
VERIFICATION_API_URL=https://your-verification-service.com
SEARCH_API_URL=https://your-search-service.com
NEXT_PUBLIC_API_URL=https://your-user-service.com/api/v1
```

## Benefits

### ✅ Solves Connection Issues
- All backend calls now happen server-side
- No more ERR_CONNECTION_REFUSED errors
- Works regardless of where backend services are hosted

### ✅ Solves CORS Issues
- Browser only makes same-origin requests to Next.js
- No cross-origin requests from browser to backend
- No CORS configuration needed

### ✅ Improved Security
- Backend service URLs hidden from client code
- Authentication tokens handled server-side
- Reduces attack surface

### ✅ Better Developer Experience
- Simpler API calls in components
- Centralized request handling
- Easier to add middleware (rate limiting, logging, etc.)

### ✅ Production Ready
- Works with any hosting configuration
- Easy to configure different URLs per environment
- No code changes needed between environments

## Testing

The build was successful with all routes properly registered:

```
├ ƒ /api/content                              - GET (list all content)
├ ƒ /api/content/[id]                         - GET (fetch by ID), DELETE (delete content)
├ ƒ /api/content/create                       - POST (create new content)
├ ƒ /api/search                               - GET (search content)
├ ƒ /api/search/categories                    - GET (list categories)
├ ƒ /api/verify/[id]/comments                 - GET (list comments), POST (add comment)
├ ƒ /api/verify/[id]/comments/[commentId]     - DELETE (delete comment)
├ ƒ /api/verify/[id]/vote                     - POST (submit vote)
└ ƒ /api/verify/[id]/votes                    - GET (get vote stats)
```

(ƒ = Dynamic server-side routes)

### API Coverage Summary

All backend endpoints that were previously called directly from the browser are now proxied:

| Function | Old Endpoint | New Endpoint | Status |
|----------|-------------|--------------|---------|
| Search Content | `localhost:8003/api/v1/search` | `/api/search` | ✅ |
| Get Categories | `localhost:8003/api/v1/search/categories` | `/api/search/categories` | ✅ |
| List Content | `localhost:8001/api/v1/content` | `/api/content` | ✅ |
| Get Content | `localhost:8001/api/v1/content/{id}` | `/api/content/{id}` | ✅ |
| Create Content | `localhost:8001/api/v1/content/create` | `/api/content/create` | ✅ |
| Delete Content | `localhost:8001/api/v1/content/{id}` | `/api/content/{id}` | ✅ |
| Submit Vote | `localhost:8002/api/v1/verify/{id}/vote` | `/api/verify/{id}/vote` | ✅ |
| Get Votes | `localhost:8002/api/v1/verify/{id}/votes` | `/api/verify/{id}/votes` | ✅ |
| Get Comments | `localhost:8002/api/v1/verify/{id}/comments` | `/api/verify/{id}/comments` | ✅ |
| Post Comment | `localhost:8002/api/v1/verify/{id}/comments` | `/api/verify/{id}/comments` | ✅ |
| Delete Comment | `localhost:8002/api/v1/verify/{id}/comments/{cid}` | `/api/verify/{id}/comments/{cid}` | ✅ |

## Troubleshooting

### Issue: API routes returning 500 errors

**Solution:** Make sure backend services are running and `.env` file has correct URLs.

### Issue: 404 on API routes

**Solution:** Run `npm run build` to regenerate routes, then restart dev server.

### Issue: Authentication not working

**Solution:** Check that `Authorization` header is being passed correctly in proxy routes.

## Migration Notes

No changes needed in:
- Backend services (they continue working as before)
- Database schemas
- Docker configurations
- CI/CD pipelines

Only the frontend was modified to use proxy routes.
