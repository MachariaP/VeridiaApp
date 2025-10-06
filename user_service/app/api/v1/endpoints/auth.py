from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import logging

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.user import User
from app.schemas.user import UserIn, UserOut, Token, UserLogin
from app.utils.messaging import event_publisher

# Set up logging
logger = logging.getLogger(__name__)

# Create router without prefix - the prefix is added when including the router in main.py
# This prevents duplicate /api/v1 prefixes in the URL path
# Router is included in main.py with: app.include_router(auth.router, prefix="/api/v1/auth")
# Result: endpoints are at /api/v1/auth/login, /api/v1/auth/register, etc.
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_user_by_username(db: Session, username: str):
    """Retrieve a user by username."""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """Retrieve a user by email."""
    return db.query(User).filter(User.email == email).first()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(token)
    if username is None:
        raise credentials_exception
    
    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserIn, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Password (8-72 characters, max 72 bytes)
    """
    try:
        # Fallback validation for password length (Pydantic should handle this)
        if len(user_in.password.encode('utf-8')) > 72:
            logger.error(f"Password validation failed: Password exceeds 72 bytes for username {user_in.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long. Must be 72 bytes or less."
            )

        # Check if username already exists
        if get_user_by_username(db, user_in.username):
            logger.error(f"Username already registered: {user_in.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        if get_user_by_email(db, user_in.email):
            logger.error(f"Email already registered: {user_in.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user with hashed password
        db_user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password)
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Publish UserRegistered event to message broker
        event_publisher.publish_user_registered(
            user_id=db_user.id,
            username=db_user.username,
            email=db_user.email
        )
        
        logger.info(f"User registered successfully: {db_user.username}")
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise

@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT access token.
    
    - **username**: User's username
    - **password**: User's password
    """
    user = get_user_by_username(db, user_login.username)
    
    if not user or not verify_password(user_login.password, user.hashed_password):
        logger.error(f"Login failed for username: {user_login.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        logger.error(f"Inactive user account: {user_login.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in successfully: {user_login.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user profile.
    
    Requires valid JWT token in Authorization header.
    """
    logger.info(f"User profile accessed: {current_user.username}")
    return current_user