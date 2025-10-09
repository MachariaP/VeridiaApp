"""
Audit & Scoring Service
Manages community interactions, immutable audit logs, and rate limiting
"""
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import redis

from .config import settings

# Initialize Redis for rate limiting (centralized storage)
redis_client = redis.from_url(settings.redis_url, decode_responses=True)

# Initialize rate limiter with Redis backend
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.redis_url,
    default_limits=[f"{settings.rate_limit_requests}/{settings.rate_limit_period}seconds"]
)

app = FastAPI(
    title=settings.app_name,
    description="Audit & Scoring Service with Redis-based rate limiting",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ============================================
# Pydantic Models
# ============================================

class VoteCreate(BaseModel):
    """Vote creation schema"""
    content_id: str
    user_id: str
    vote_type: str  # UPVOTE, DOWNVOTE


class VoteResponse(BaseModel):
    """Vote response schema"""
    id: str
    content_id: str
    user_id: str
    vote_type: str
    created_at: datetime


class CommentCreate(BaseModel):
    """Comment creation schema"""
    content_id: str
    user_id: str
    text: str


class CommentResponse(BaseModel):
    """Comment response schema"""
    id: str
    content_id: str
    user_id: str
    text: str
    created_at: datetime


class AuditLog(BaseModel):
    """Immutable audit log entry"""
    id: str
    action: str
    user_id: str
    resource_id: str
    timestamp: datetime
    metadata: Optional[dict] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    timestamp: datetime
    redis_connected: bool


# ============================================
# Audit Logging Functions
# ============================================

def create_audit_log(action: str, user_id: str, resource_id: str, metadata: dict = None):
    """
    Create immutable audit log entry
    Critical for truth-seeking platform
    """
    log_entry = AuditLog(
        id=f"audit_{datetime.utcnow().timestamp()}",
        action=action,
        user_id=user_id,
        resource_id=resource_id,
        timestamp=datetime.utcnow(),
        metadata=metadata
    )
    
    # In production, store in append-only database or blockchain
    print(f"AUDIT LOG: {log_entry.dict()}")
    
    return log_entry


# ============================================
# API Endpoints
# ============================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    MANDATORY Health Check Endpoint
    Includes Redis connection status
    """
    redis_connected = False
    try:
        redis_client.ping()
        redis_connected = True
    except Exception:
        pass
    
    return HealthResponse(
        status="healthy" if redis_connected else "degraded",
        service="Audit & Scoring Service",
        timestamp=datetime.utcnow(),
        redis_connected=redis_connected
    )


@app.post("/votes", response_model=VoteResponse, tags=["Voting"])
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_period}seconds")
async def create_vote(vote: VoteCreate, request: Request):
    """
    Create a vote (upvote/downvote)
    Protected by Redis-based rate limiting
    """
    vote_response = VoteResponse(
        id=f"vote_{datetime.utcnow().timestamp()}",
        content_id=vote.content_id,
        user_id=vote.user_id,
        vote_type=vote.vote_type,
        created_at=datetime.utcnow()
    )
    
    # Create immutable audit log
    create_audit_log(
        action="VOTE_CREATED",
        user_id=vote.user_id,
        resource_id=vote.content_id,
        metadata={"vote_type": vote.vote_type}
    )
    
    return vote_response


@app.post("/comments", response_model=CommentResponse, tags=["Comments"])
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_period}seconds")
async def create_comment(comment: CommentCreate, request: Request):
    """
    Create a comment
    Protected by Redis-based rate limiting
    """
    comment_response = CommentResponse(
        id=f"comment_{datetime.utcnow().timestamp()}",
        content_id=comment.content_id,
        user_id=comment.user_id,
        text=comment.text,
        created_at=datetime.utcnow()
    )
    
    # Create immutable audit log
    create_audit_log(
        action="COMMENT_CREATED",
        user_id=comment.user_id,
        resource_id=comment.content_id,
        metadata={"text_length": len(comment.text)}
    )
    
    return comment_response


@app.get("/content/{content_id}/score", tags=["Scoring"])
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_period}seconds")
async def get_content_score(content_id: str, request: Request):
    """
    Get content risk score and community metrics
    Protected by rate limiting
    """
    # Mock scoring logic
    return {
        "content_id": content_id,
        "trust_score": 0.87,
        "upvotes": 145,
        "downvotes": 12,
        "comment_count": 23,
        "verification_status": "VERIFIED"
    }


@app.get("/audit-logs", response_model=List[AuditLog], tags=["Audit"])
async def get_audit_logs(user_id: Optional[str] = None, limit: int = 100):
    """
    Retrieve audit logs (immutable records)
    """
    # Mock implementation - would query append-only database
    mock_logs = [
        AuditLog(
            id=f"audit_{i}",
            action="VOTE_CREATED",
            user_id=user_id or "user_demo",
            resource_id=f"content_{i}",
            timestamp=datetime.utcnow(),
            metadata={"vote_type": "UPVOTE"}
        )
        for i in range(min(5, limit))
    ]
    
    return mock_logs


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "Audit & Scoring Service",
        "status": "operational",
        "rate_limiting": "enabled",
        "endpoints": {
            "health": "/health",
            "votes": "/votes",
            "comments": "/comments",
            "audit-logs": "/audit-logs",
            "docs": "/docs"
        }
    }


# ============================================
# Application Startup
# ============================================

@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    print(f"Starting {settings.app_name}")
    print(f"Rate Limiting: {settings.rate_limit_requests} requests per {settings.rate_limit_period}s")
    try:
        redis_client.ping()
        print("Redis connection: OK")
    except Exception as e:
        print(f"Redis connection: FAILED - {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
