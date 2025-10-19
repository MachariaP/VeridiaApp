import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base, get_db
from app.main import app
from app.models.user import User

# Set test environment variables before importing settings
os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/veridiapp_user_test_db")
os.environ["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "test-secret-key-for-testing-only-do-not-use-in-production")

# Use PostgreSQL for testing to match production database
SQLALCHEMY_DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with the test database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Create a test user."""
    from app.core.security import hash_password
    user = User(
        email="test@example.com",
        hashed_password=hash_password("testpassword123"),
        first_name="Test",
        last_name="User",
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
