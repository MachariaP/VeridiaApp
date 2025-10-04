"""
MongoDB database configuration and connection management.
"""
from pymongo import MongoClient
from pymongo.database import Database
import os

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "veridiadb")

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
        _client = MongoClient(MONGODB_URL)
        _database = _client[MONGODB_DB_NAME]
        
        # Create indexes for better query performance
        _database.content.create_index("created_by_user_id")
        _database.content.create_index("status")
        _database.content.create_index("category")
        _database.content.create_index("created_at")
    
    return _database


def close_database():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
