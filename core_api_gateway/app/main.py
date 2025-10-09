"""
Core API Gateway - Main Application
Implements mandatory architectural constraints:
- CORSMiddleware with dynamic origins
- JWT Authentication
- Health endpoint
- Background tasks for async processing
"""
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import httpx

from .config import settings

# Initialize FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="Core API Gateway for VeridiaApp - Production-Ready Microservice",
    version="1.0.0"
)

# MANDATORY: Configure CORS Middleware Globally
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Dynamic origins from configuration
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ============================================
# Pydantic Models
# ============================================

class UserCreate(BaseModel):
    """User registration schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    username: str
    email: str
    created_at: datetime


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str


class ContentCreate(BaseModel):
    """Content creation schema"""
    title: str = Field(..., min_length=3, max_length=200)
    body: str = Field(..., min_length=10)
    category: str


class ContentResponse(BaseModel):
    """Content response schema"""
    id: str
    title: str
    body: str
    category: str
    status: str  # PENDING_VERIFICATION, VERIFIED, FLAGGED
    created_at: datetime
    author_id: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    timestamp: datetime


# ============================================
# Authentication Functions
# ============================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username


# ============================================
# Background Tasks for Async Processing
# ============================================

async def trigger_ai_verification(content_id: str, content_data: dict):
    """
    Background task to trigger AI verification asynchronously
    This prevents blocking the main API thread
    """
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                f"{settings.ai_verification_service_url}/verify",
                json={"content_id": content_id, "content": content_data},
                timeout=5.0
            )
        except Exception as e:
            # Log error but don't fail the main request
            print(f"AI Verification trigger failed: {e}")


# ============================================
# API Endpoints
# ============================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    MANDATORY Health Check Endpoint
    Returns HTTP 200 and service status for orchestration tools
    """
    return HealthResponse(
        status="healthy",
        service="Core API Gateway",
        timestamp=datetime.utcnow()
    )


@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
async def register_user(user: UserCreate):
    """
    User Registration with secure password hashing
    """
    # Mock implementation - replace with actual database logic
    hashed_password = get_password_hash(user.password)
    
    user_response = UserResponse(
        id="user_" + user.username,
        username=user.username,
        email=user.email,
        created_at=datetime.utcnow()
    )
    
    return user_response


@app.post("/token", response_model=Token, tags=["Authentication"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    JWT Token Generation for OAuth2 authentication
    """
    # Mock authentication - replace with actual database verification
    if form_data.username != "demo" or form_data.password != "demo123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/content", response_model=ContentResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Content"])
async def create_content(
    content: ContentCreate,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """
    Content Creation with Asynchronous AI Verification
    Returns HTTP 202 Accepted immediately, verification runs in background
    """
    content_id = f"content_{datetime.utcnow().timestamp()}"
    
    # Create content response with PENDING_VERIFICATION status
    content_response = ContentResponse(
        id=content_id,
        title=content.title,
        body=content.body,
        category=content.category,
        status="PENDING_VERIFICATION",
        created_at=datetime.utcnow(),
        author_id=current_user
    )
    
    # Trigger AI verification asynchronously using BackgroundTasks
    background_tasks.add_task(
        trigger_ai_verification,
        content_id,
        content.dict()
    )
    
    return content_response


@app.get("/content/{content_id}", response_model=ContentResponse, tags=["Content"])
async def get_content(content_id: str, current_user: str = Depends(get_current_user)):
    """
    Retrieve content by ID
    """
    # Mock implementation
    return ContentResponse(
        id=content_id,
        title="Sample Content",
        body="This is a sample content body",
        category="general",
        status="VERIFIED",
        created_at=datetime.utcnow(),
        author_id=current_user
    )


@app.get("/users/me", tags=["Users"])
async def read_users_me(current_user: str = Depends(get_current_user)):
    """Get current user information"""
    return {"username": current_user}


# ============================================
# Application Startup
# ============================================

@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    print(f"Starting {settings.app_name}")
    print(f"CORS Origins: {settings.cors_origins}")
    print(f"Debug Mode: {settings.debug}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
