import pytest
from fastapi import status


def test_register_user_success(client):
    """Test successful user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "first_name": "New",
            "last_name": "User"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["first_name"] == "New"
    assert data["last_name"] == "User"
    assert data["role"] == "user"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data
    assert "hashed_password" not in data  # Password should not be in response


def test_register_duplicate_email(client, test_user):
    """Test that duplicate email registration fails."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",  # Same as test_user
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"].lower()


def test_register_invalid_email(client):
    """Test registration with invalid email."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_register_short_password(client):
    """Test registration with too short password."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "short"  # Less than 8 characters
        }
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "test@example.com",  # OAuth2 uses username field
            "password": "testpassword123"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    """Test login with wrong password."""
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "test@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    """Test login with non-existent user."""
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "nonexistent@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_token_success(client, test_user):
    """Test successful token refresh."""
    # First login to get tokens
    login_response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "test@example.com",
            "password": "testpassword123"
        }
    )
    refresh_token = login_response.json()["refresh_token"]
    
    # Use refresh token to get new tokens
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_refresh_token_invalid(client):
    """Test refresh with invalid token."""
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid_token"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_with_access_token(client, test_user):
    """Test that access token cannot be used for refresh."""
    # Login to get tokens
    login_response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "test@example.com",
            "password": "testpassword123"
        }
    )
    access_token = login_response.json()["access_token"]
    
    # Try to use access token for refresh (should fail)
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": access_token}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
