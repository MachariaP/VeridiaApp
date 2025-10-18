from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user from JWT token.
    
    This validates the JWT token and returns the user information.
    Note: This service doesn't have direct database access to the user service,
    so it relies on the JWT token payload for user information.
    
    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "error": "Invalid or expired token",
            "status": 401
        },
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception
    
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    
    # Return user info from token
    return {
        "user_id": user_id,
        "role": payload.get("role", "user")
    }
