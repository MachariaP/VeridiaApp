from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.core.config import settings

# Global MongoDB client
mongodb_client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    """Connect to MongoDB."""
    global mongodb_client
    mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)


async def close_mongo_connection():
    """Close MongoDB connection."""
    global mongodb_client
    if mongodb_client is not None:
        mongodb_client.close()


def get_database():
    """Get MongoDB database instance."""
    if mongodb_client is None:
        raise Exception("MongoDB client not initialized")
    return mongodb_client[settings.MONGODB_DB_NAME]


def get_collection(collection_name: str):
    """Get MongoDB collection."""
    db = get_database()
    return db[collection_name]
