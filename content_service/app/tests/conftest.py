import pytest
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Generator, AsyncGenerator
import os

from app.main import app
from app.core.config import settings
from app.db.mongodb import mongodb, get_database
from app.core.security import decode_token

# Test database URL
TEST_MONGODB_URL = "mongodb://localhost:27017"
TEST_MONGODB_DB_NAME = "veridiapp_content_test_db"

# Set JWT secret for tests
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
settings.JWT_SECRET_KEY = "test-secret-key-for-testing-only"


@pytest.fixture(scope="function")
async def test_db():
    """Create a test database connection."""
    # Create test database client
    client = AsyncIOMotorClient(TEST_MONGODB_URL)
    mongodb.client = client
    db = client[TEST_MONGODB_DB_NAME]
    
    yield db
    
    # Clean up: drop test database after each test
    await client.drop_database(TEST_MONGODB_DB_NAME)
    client.close()


@pytest.fixture(scope="function")
def client(test_db) -> Generator:
    """Create a test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def test_user_token() -> str:
    """
    Create a test JWT token for authentication.
    This simulates a token that would be issued by the user service.
    """
    from jose import jwt
    from datetime import datetime, timedelta, timezone
    
    payload = {
        "sub": "123",  # user_id
        "role": "user",
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
    }
    
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


@pytest.fixture
def auth_headers(test_user_token: str) -> dict:
    """Create authorization headers with test token."""
    return {"Authorization": f"Bearer {test_user_token}"}


@pytest.fixture
def expired_token() -> str:
    """Create an expired JWT token for testing."""
    from jose import jwt
    from datetime import datetime, timedelta, timezone
    
    payload = {
        "sub": "123",
        "role": "user",
        "type": "access",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1)
    }
    
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


@pytest.fixture
def sample_content_data() -> dict:
    """Sample content data for testing."""
    return {
        "content_url": "https://example.com/article",
        "content_text": "This is a test article content",
        "tags": "news,technology,ai"
    }


# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
