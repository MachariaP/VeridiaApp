from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.core.config import settings


class MongoDB:
    """MongoDB connection manager."""
    
    client: Optional[AsyncIOMotorClient] = None
    

mongodb = MongoDB()


async def connect_to_mongo():
    """Create MongoDB client and connect to database."""
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Test connection
    try:
        await mongodb.client.admin.command('ping')
        print(f"Connected to MongoDB at {settings.MONGODB_URL}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")


async def close_mongo_connection():
    """Close MongoDB connection."""
    if mongodb.client:
        mongodb.client.close()
        print("Closed MongoDB connection")


def get_database():
    """Get MongoDB database instance."""
    if mongodb.client is None:
        raise Exception("MongoDB client is not initialized")
    return mongodb.client[settings.MONGODB_DB_NAME]


def get_collection(collection_name: str):
    """Get MongoDB collection."""
    db = get_database()
    return db[collection_name]
