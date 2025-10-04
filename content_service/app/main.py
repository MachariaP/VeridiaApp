"""
Content Service - FastAPI Application
Manages user-submitted content lifecycle (creation, retrieval, updates).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import content
from app.core.database import close_database
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Content Service starting up...")
    yield
    # Shutdown
    print("Content Service shutting down...")
    close_database()


app = FastAPI(
    title="Content Service",
    description="VeridiaApp Content Management Microservice",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
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
    """Root endpoint."""
    return {
        "service": "Content Service",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
