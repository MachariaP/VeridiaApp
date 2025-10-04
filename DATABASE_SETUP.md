# VeridiaApp Database Setup Guide

This guide explains the database configuration for VeridiaApp and helps you resolve common issues like being unable to login after registration.

## Overview

VeridiaApp uses different databases for different services:
- **User Service**: SQLite (default) or PostgreSQL - stores user accounts
- **Content Service**: In-memory (default) or MongoDB - stores content data
- **Verification Service**: SQLite (default) or PostgreSQL - stores votes and comments
- **Search Service**: In-memory (default) or Elasticsearch - indexes content for search

## Quick Fix: Unable to Login After Registration

If you're experiencing login issues after user registration, the most common cause is a **missing dependency**. Here's the fix:

### Solution

The `argon2-cffi` package is required for password hashing but may not be installed. 

**Install it manually:**
```bash
cd user_service
pip install argon2-cffi
```

This package is now included in `requirements.txt`, so running:
```bash
pip install -r requirements.txt
```

Should install all dependencies including `argon2-cffi`.

### Why This Happens

The user service uses Argon2 password hashing (via passlib) for security, but the Argon2 backend requires the `argon2-cffi` package to be installed. Without it, registration will fail with an internal server error.

## Database Setup by Service

### 1. User Service Database (SQLite - Default)

The user service uses **SQLite by default**, which requires no additional setup.

#### Automatic Setup

When you start the user service, it automatically:
1. Creates a SQLite database file: `veridiaapp.db`
2. Creates the `users` table with the following schema:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

#### Starting User Service

```bash
cd user_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The database file will be created automatically in the `user_service` directory.

#### Verify Database Creation

Check if the database was created:
```bash
ls -lh user_service/veridiaapp.db
```

View the database schema:
```bash
sqlite3 user_service/veridiaapp.db ".schema users"
```

View registered users:
```bash
sqlite3 user_service/veridiaapp.db "SELECT id, username, email, is_active FROM users;"
```

### 2. User Service Database (PostgreSQL - Production)

For production deployments, PostgreSQL is recommended.

#### Install PostgreSQL

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**On macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Using Docker:**
```bash
docker run --name veridiadb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=veridiadb \
  -p 5432:5432 \
  -d postgres:14
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE veridiadb;
CREATE USER veridiauser WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE veridiadb TO veridiauser;
\q
```

#### Configure User Service

Set the `DATABASE_URL` environment variable:

**Linux/macOS:**
```bash
export DATABASE_URL="postgresql://veridiauser:securepassword@localhost:5432/veridiadb"
```

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://veridiauser:securepassword@localhost:5432/veridiadb"
```

**Or create a `.env` file in user_service directory:**
```env
DATABASE_URL=postgresql://veridiauser:securepassword@localhost:5432/veridiadb
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Start User Service with PostgreSQL

```bash
cd user_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The service will automatically create the `users` table in PostgreSQL.

#### Verify PostgreSQL Database

```bash
psql -U veridiauser -d veridiadb -c "\dt"
psql -U veridiauser -d veridiadb -c "SELECT * FROM users;"
```

### 3. Content Service Database (MongoDB - Optional)

The content service uses **in-memory storage by default** but supports MongoDB for persistence.

#### Install MongoDB

**Using Docker:**
```bash
docker run --name mongodb \
  -p 27017:27017 \
  -d mongo:6.0
```

**On Ubuntu:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

#### Configure Content Service

```bash
export MONGODB_URL="mongodb://localhost:27017"
export MONGODB_DB_NAME="veridiadb"
```

#### Start Content Service

```bash
cd content_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

#### Verify MongoDB

```bash
mongosh
use veridiadb
db.content.find().pretty()
```

### 4. Verification Service Database

Similar to user service, uses SQLite by default or PostgreSQL for production.

#### Using SQLite (Default)

```bash
cd verification_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

Database file: `verification_service/verification.db`

#### Using PostgreSQL

```bash
export DATABASE_URL="postgresql://veridiauser:securepassword@localhost:5432/veridiadb"
cd verification_service
uvicorn app.main:app --reload --port 8002
```

## Testing Your Setup

### Test User Registration

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true
}
```

### Test User Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Test Authenticated Endpoint

```bash
# Save the token from login response
TOKEN="your_access_token_here"

curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true
}
```

## Common Issues and Solutions

### Issue 1: "argon2: no backends available"

**Error Message:**
```
ERROR: Registration failed: argon2: no backends available -- recommend you install one (e.g. 'pip install argon2_cffi')
```

**Solution:**
```bash
pip install argon2-cffi
```

### Issue 2: "Unable to login after registration"

**Possible Causes:**
1. Missing `argon2-cffi` package (see Issue 1)
2. Database not initialized properly
3. Wrong username or password

**Solution:**
1. Install `argon2-cffi`: `pip install argon2-cffi`
2. Restart the user service: `uvicorn app.main:app --reload --port 8000`
3. Try registering again with a new username
4. Verify the user was created: `sqlite3 user_service/veridiaapp.db "SELECT * FROM users;"`

### Issue 3: "Could not connect to PostgreSQL"

**Solution:**
1. Verify PostgreSQL is running: `sudo systemctl status postgresql` or `docker ps`
2. Check connection string: `echo $DATABASE_URL`
3. Test connection: `psql $DATABASE_URL`
4. Fall back to SQLite: `unset DATABASE_URL` and restart service

### Issue 4: Database file not created

**Solution:**
1. Check permissions: `ls -l user_service/`
2. Run service once: `cd user_service && uvicorn app.main:app --port 8000`
3. Stop service (Ctrl+C) and check: `ls -lh veridiaapp.db`

### Issue 5: "Table users already exists" or migration errors

**Solution for SQLite:**
```bash
# Backup existing database
cp user_service/veridiaapp.db user_service/veridiaapp.db.backup

# Remove database
rm user_service/veridiaapp.db

# Restart service to recreate
cd user_service && uvicorn app.main:app --reload --port 8000
```

**Solution for PostgreSQL:**
```sql
-- Connect to database
psql -U veridiauser -d veridiadb

-- Drop and recreate table
DROP TABLE IF EXISTS users CASCADE;

-- Restart the service to recreate tables
```

## Database Schema Reference

### Users Table (User Service)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-incrementing user ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | User's unique username |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| hashed_password | VARCHAR(255) | NOT NULL | Argon2 hashed password |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Account status |
| created_at | DATETIME | NOT NULL | Registration timestamp |
| updated_at | DATETIME | NOT NULL | Last update timestamp |

### Indexes

- `ix_users_id`: Index on id (primary key)
- `ix_users_username`: Unique index on username
- `ix_users_email`: Unique index on email

## Environment Variables Reference

### User Service

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/veridiadb
# Or for SQLite (default if not set): sqlite:///./veridiaapp.db

# Security Configuration
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Content Service

```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=veridiadb
SECRET_KEY=your-secret-key-change-this-in-production
```

### Verification Service

```env
DATABASE_URL=postgresql://user:password@localhost:5432/veridiadb
SECRET_KEY=your-secret-key-change-this-in-production
CONTENT_SERVICE_URL=http://localhost:8001
```

## Security Best Practices

1. **Change default passwords**: Never use default passwords in production
2. **Use environment variables**: Don't hardcode credentials in code
3. **Use strong SECRET_KEY**: Generate a random key:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
4. **Enable SSL/TLS**: Use SSL connections for production databases
5. **Regular backups**: Backup databases regularly
6. **Limit access**: Use firewall rules to restrict database access

## Database Backup and Restore

### SQLite Backup

```bash
# Backup
cp user_service/veridiaapp.db user_service/veridiaapp.db.backup_$(date +%Y%m%d)

# Restore
cp user_service/veridiaapp.db.backup_20241004 user_service/veridiaapp.db
```

### PostgreSQL Backup

```bash
# Backup
pg_dump -U veridiauser veridiadb > veridiadb_backup_$(date +%Y%m%d).sql

# Restore
psql -U veridiauser veridiadb < veridiadb_backup_20241004.sql
```

### MongoDB Backup

```bash
# Backup
mongodump --db veridiadb --out ./backup_$(date +%Y%m%d)

# Restore
mongorestore --db veridiadb ./backup_20241004/veridiadb
```

## Next Steps

After setting up your database:

1. **Start all services**: Follow [SETUP.md](SETUP.md) to start all microservices
2. **Test the frontend**: Navigate to http://localhost:3000 and try registering/logging in
3. **Explore API docs**: Visit http://localhost:8000/docs for interactive API documentation
4. **Create content**: After logging in, try creating and verifying content

## Getting Help

If you still experience issues:

1. Check service logs for error messages
2. Verify all dependencies are installed: `pip list | grep -E "(fastapi|sqlalchemy|argon2)"`
3. Test database connection manually
4. Check [SETUP.md](SETUP.md) for service-specific configuration
5. Open an issue on GitHub with error logs and steps to reproduce

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Passlib Documentation](https://passlib.readthedocs.io/)
