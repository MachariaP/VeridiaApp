"""
Verification Service - FastAPI Application
Handles content verification, voting, and community discussions.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import verify
from app.core.database import init_db
from app.utils.messaging import get_event_consumer
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Verification Service starting up...")
    
    # Initialize database
    init_db()
    print("Database initialized")
    
    # Start RabbitMQ consumer in background
    consumer = get_event_consumer()
    consumer.start_in_background()
    
    yield
    
    # Shutdown
    print("Verification Service shutting down...")
    consumer.stop()


app = FastAPI(
    title="Verification Service",
    description="VeridiaApp Content Verification Microservice",
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
    verify.router,
    prefix="/api/v1/verify",
    tags=["verification"]
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Verification Service",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
