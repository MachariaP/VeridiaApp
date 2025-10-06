"""
MongoDB database configuration and connection management.
"""
from pymongo import MongoClient
from pymongo.database import Database
import os

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "veridiadb")
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME", "")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "")

# Global MongoDB client and database
_client: MongoClient = None
_database: Database = None


def get_database() -> Database:
    """
    Get MongoDB database instance.
    Creates connection if not already established.
    """
    global _client, _database
    
    if _database is None:
        try:
            # Build connection string with authentication if credentials provided
            if MONGODB_USERNAME and MONGODB_PASSWORD:
                # Extract host and port from MONGODB_URL
                if MONGODB_URL.startswith('mongodb://'):
                    base_url = MONGODB_URL[10:]  # Remove 'mongodb://'
                else:
                    base_url = MONGODB_URL
                
                # Construct authenticated connection string
                connection_string = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{base_url}/{MONGODB_DB_NAME}?authSource=admin"
            else:
                # Use basic connection string without auth
                connection_string = f"{MONGODB_URL}/{MONGODB_DB_NAME}"
            
            print(f"🔗 Connecting to MongoDB: {connection_string.replace(MONGODB_PASSWORD, '***') if MONGODB_PASSWORD else connection_string}")
            
            _client = MongoClient(connection_string)
            _database = _client[MONGODB_DB_NAME]
            
            # Test the connection
            _client.admin.command('ping')
            print("✅ Connected to MongoDB successfully")
            
            # Create indexes for better query performance
            create_indexes()
            
        except Exception as e:
            print(f"❌ MongoDB connection error: {e}")
            raise
    
    return _database


def create_indexes():
    """Create necessary MongoDB indexes"""
    try:
        _database.content.create_index("created_by_user_id")
        _database.content.create_index("status")
        _database.content.create_index("category")
        _database.content.create_index("created_at")
        print("✅ MongoDB indexes created successfully")
    except Exception as e:
        print(f"⚠️  Warning: Could not create indexes: {e}")
        # Don't raise, allow app to continue without indexes


def close_database():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        print("🔌 MongoDB connection closed")