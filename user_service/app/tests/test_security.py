import pytest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from datetime import timedelta


def test_password_hashing():
    """Test password hashing and verification."""
    password = "mySecurePassword123"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_access_token_creation():
    """Test access token creation and decoding."""
    data = {"sub": "123", "email": "test@example.com", "role": "user"}
    token = create_access_token(data)
    
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "123"
    assert decoded["email"] == "test@example.com"
    assert decoded["role"] == "user"
    assert decoded["type"] == "access"


def test_refresh_token_creation():
    """Test refresh token creation and decoding."""
    data = {"sub": "123", "email": "test@example.com", "role": "user"}
    token = create_refresh_token(data)
    
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "123"
    assert decoded["type"] == "refresh"


def test_expired_token():
    """Test that expired tokens are invalid."""
    data = {"sub": "123", "email": "test@example.com"}
    token = create_access_token(data, expires_delta=timedelta(seconds=-1))
    
    decoded = decode_token(token)
    assert decoded is None  # Expired tokens should return None


def test_invalid_token():
    """Test that invalid tokens return None."""
    decoded = decode_token("invalid.token.here")
    assert decoded is None
