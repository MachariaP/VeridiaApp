from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from hashlib import sha256
from passlib.context import CryptContext
import os

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context with argon2 as primary, bcrypt as fallback
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    # Truncate password to 72 bytes for bcrypt compatibility
    password_bytes = plain_password.encode('utf-8')[:72]
    return pwd_context.verify(password_bytes, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password using argon2 or bcrypt."""
    # Convert password to bytes and handle bcrypt's 72-byte limit
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72 and "bcrypt" in pwd_context.schemes():
        # Pre-hash with SHA-256 to reduce length to 32 bytes for bcrypt
        password_bytes = sha256(password_bytes).digest()
    return pwd_context.hash(password_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing claims to encode in the token
        expires_delta: Optional expiration time delta
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        Username from token or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        return username
    except JWTError:
        return None