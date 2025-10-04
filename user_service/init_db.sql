-- VeridiaApp User Service Database Schema
-- This file documents the database schema used by the user service
-- The actual tables are created automatically by SQLAlchemy when the service starts

-- Users table: stores user account information
CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- Sample query to view all users (excluding password hashes)
-- SELECT id, username, email, is_active, created_at, updated_at FROM users;

-- Sample query to check if a user exists
-- SELECT id, username, email FROM users WHERE username = 'testuser';

-- Sample query to deactivate a user
-- UPDATE users SET is_active = 0 WHERE username = 'testuser';

-- Sample query to count total users
-- SELECT COUNT(*) as total_users FROM users;

-- Sample query to find inactive users
-- SELECT username, email, created_at FROM users WHERE is_active = 0;
