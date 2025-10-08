"""
Search Service - FastAPI Application
Provides high-performance search and discovery for verified content.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import search
from app.core.elasticsearch import close_elasticsearch
from app.utils.messaging import get_search_consumer
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Search Service starting up...")
    
    # Start RabbitMQ consumer for indexing in background
    consumer = get_search_consumer()
    consumer.start_in_background()
    
    yield
    
    # Shutdown
    print("Search Service shutting down...")
    consumer.stop()
    close_elasticsearch()


app = FastAPI(
    title="Search Service",
    description="VeridiaApp Content Search and Discovery Microservice",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(
    search.router,
    prefix="/api/v1/search",
    tags=["search"]
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Search Service",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
