import pytest
from fastapi import status


def test_get_current_user_success(client, test_user):
    """Test getting current user profile with valid token."""
    # Login to get access token
    login_response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "test@example.com",
            "password": "testpassword123"
        }
    )
    access_token = login_response.json()["access_token"]
    
    # Get current user profile
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["first_name"] == "Test"
    assert data["last_name"] == "User"
    assert "hashed_password" not in data


def test_get_current_user_no_token(client):
    """Test getting current user without authentication."""
    response = client.get("/api/v1/users/me")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_invalid_token(client):
    """Test getting current user with invalid token."""
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_expired_token(client, test_user):
    """Test that expired tokens are rejected."""
    # Create an expired token manually
    from app.core.security import create_access_token
    from datetime import timedelta
    
    expired_token = create_access_token(
        {"sub": str(test_user.id), "email": test_user.email, "role": test_user.role},
        expires_delta=timedelta(seconds=-1)  # Already expired
    )
    
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
