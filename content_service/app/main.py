"""
Content Service - FastAPI Application
Manages user-submitted content lifecycle (creation, retrieval, updates).
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from app.api.v1.endpoints import content
from app.core.database import get_database, close_database
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events with proper database initialization."""
    # Startup
    logger.info("Content Service starting up...")
    
    try:
        # Initialize database connection and create indexes
        db = get_database()
        logger.info("✅ Database connection established and indexes created")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        # Don't raise here - let the app start but log the error
        # This allows the service to start even if DB is temporarily unavailable
    
    yield
    
    # Shutdown
    logger.info("Content Service shutting down...")
    close_database()
    logger.info("✅ Database connection closed")

app = FastAPI(
    title="Content Service",
    description="VeridiaApp Content Management Microservice",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
# In production, replace ["*"] with specific origins
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your frontend URLs here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(
    content.router,
    prefix="/api/v1/content",
    tags=["content"]
)

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Content Service",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health_check": "/health"
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint."""
    try:
        # Test database connection
        db = get_database()
        # Ping the database to verify connection
        db.client.admin.command('ping')
        
        return {
            "status": "healthy",
            "database": "connected",
            "service": "content_service"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
        )

@app.get("/info")
async def service_info():
    """Service information and configuration."""
    return {
        "service": "Content Service",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database_url": os.getenv("MONGODB_URL", "mongodb://localhost:27017"),
        "database_name": os.getenv("MONGODB_DB_NAME", "veridiadb")
    }