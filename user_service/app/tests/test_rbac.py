import pytest
from fastapi import status
from app.models.user import User, UserRole
from app.core.security import hash_password


@pytest.fixture
def admin_user(db):
    """Create a test admin user."""
    user = User(
        email="admin@example.com",
        hashed_password=hash_password("adminpassword123"),
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def moderator_user(db):
    """Create a test moderator user."""
    user = User(
        email="moderator@example.com",
        hashed_password=hash_password("modpassword123"),
        first_name="Moderator",
        last_name="User",
        role=UserRole.MODERATOR.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_access_token(client, email, password):
    """Helper function to get access token."""
    response = client.post(
        "/api/v1/auth/token",
        data={"username": email, "password": password}
    )
    return response.json()["access_token"]


def test_user_role_in_token(client, test_user):
    """Test that user role is included in JWT token."""
    from app.core.security import decode_token
    
    token = get_access_token(client, "test@example.com", "testpassword123")
    payload = decode_token(token)
    
    assert payload is not None
    assert payload["role"] == "user"


def test_admin_role_in_token(client, admin_user):
    """Test that admin role is included in JWT token."""
    from app.core.security import decode_token
    
    token = get_access_token(client, "admin@example.com", "adminpassword123")
    payload = decode_token(token)
    
    assert payload is not None
    assert payload["role"] == "admin"


def test_moderator_role_in_token(client, moderator_user):
    """Test that moderator role is included in JWT token."""
    from app.core.security import decode_token
    
    token = get_access_token(client, "moderator@example.com", "modpassword123")
    payload = decode_token(token)
    
    assert payload is not None
    assert payload["role"] == "moderator"


def test_get_current_user_dependency(client, test_user):
    """Test get_current_user dependency extracts user correctly."""
    token = get_access_token(client, "test@example.com", "testpassword123")
    
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "user"
