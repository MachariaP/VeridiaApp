# Quick Fix: Unable to Login After Registration

## Problem
After registering a user, you're unable to login to the application.

## Root Cause
The `argon2-cffi` package was missing from the dependencies, causing password hashing to fail during registration.

## Solution

### Option 1: Install Updated Dependencies (Recommended)
```bash
cd user_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The `argon2-cffi` package is now included in `requirements.txt`, so this will install all required dependencies.

### Option 2: Manual Installation
If you still experience issues:
```bash
pip install argon2-cffi
```

### Option 3: Use the Test Script
```bash
cd user_service
./test_setup.sh
```

## Verify It Works

### Test Registration
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'
```

**Expected:** Should return user details with `id`, `username`, `email`, and `is_active: true`

### Test Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

**Expected:** Should return an `access_token` and `token_type: bearer`

## How the Database Works

### Automatic Setup
When you start the user service, it automatically:
1. Creates a SQLite database file: `veridiaapp.db` (in user_service directory)
2. Creates the `users` table with proper schema
3. Sets up indexes for better performance

### View Database Contents
```bash
# View all users
sqlite3 user_service/veridiaapp.db "SELECT id, username, email, is_active FROM users;"

# View database schema
sqlite3 user_service/veridiaapp.db ".schema users"
```

### Reset Database (If Needed)
```bash
# Backup first (optional)
cp user_service/veridiaapp.db user_service/veridiaapp.db.backup

# Remove database
rm user_service/veridiaapp.db

# Restart service - database will be recreated automatically
cd user_service
uvicorn app.main:app --reload --port 8000
```

## Still Having Issues?

See the comprehensive guides:
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Complete database configuration guide
- [SETUP.md](SETUP.md) - Full application setup instructions
- [user_service/README.md](user_service/README.md) - User service specific documentation

## What Was Changed

1. **Added `argon2-cffi==23.1.0` to `user_service/requirements.txt`**
   - This package provides the Argon2 password hashing backend
   - Required by passlib for secure password storage

2. **Created comprehensive documentation**
   - `DATABASE_SETUP.md` - Complete database setup guide
   - Updated `SETUP.md` with quick reference
   - Enhanced `user_service/README.md` with troubleshooting

3. **Added helper files**
   - `user_service/init_db.sql` - Database schema reference
   - `user_service/test_setup.sh` - Quick setup test script

## Common Error Messages and Solutions

### Error: "argon2: no backends available"
**Solution:** Install argon2-cffi: `pip install argon2-cffi`

### Error: "Username already registered"
**Solution:** Use a different username or reset the database

### Error: "Incorrect username or password"
**Solution:** Check your credentials or verify the user was registered successfully

### Error: "Could not validate credentials" (when accessing /me)
**Solution:** Your token may have expired. Login again to get a new token.

## Testing Your Setup

Use the interactive API documentation:
1. Start the service: `uvicorn app.main:app --reload --port 8000`
2. Visit: http://localhost:8000/docs
3. Try the `/api/v1/auth/register` endpoint
4. Try the `/api/v1/auth/login` endpoint
5. Use the token from login to test `/api/v1/auth/me`

## Database Schema

The `users` table contains:
- `id` - Auto-incrementing primary key
- `username` - Unique username (3-50 characters)
- `email` - Unique email address
- `hashed_password` - Argon2 hashed password (never stored in plain text)
- `is_active` - Account status (default: true)
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

## Security Notes

✅ Passwords are hashed using Argon2 (production-grade security)
✅ JWT tokens for stateless authentication
✅ Email and username uniqueness enforced at database level
✅ CORS configured for frontend integration
✅ Input validation using Pydantic

## Next Steps

After verifying the user service works:
1. Start other services (content, verification, search)
2. Start the frontend application
3. Try the complete workflow:
   - Register at http://localhost:3000/register
   - Login at http://localhost:3000/login
   - Access dashboard at http://localhost:3000/dashboard

---

**Need more help?** Check the full documentation in [DATABASE_SETUP.md](DATABASE_SETUP.md)
