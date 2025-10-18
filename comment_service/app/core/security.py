from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.core.config import settings
import bleach


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Dict containing token payload
        
    Raises:
        JWTError: If token is invalid or expired
    """
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM]
    )
    return payload


def sanitize_html(text: str) -> str:
    """
    Sanitize HTML content to prevent XSS attacks.
    
    Args:
        text: Input text that may contain HTML
        
    Returns:
        Sanitized text with only safe HTML tags
    """
    # Allow only safe tags for comments
    allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre']
    allowed_attributes = {'a': ['href', 'title'], 'code': ['class']}
    
    return bleach.clean(
        text,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True
    )
