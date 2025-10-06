from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth
from app.core.database import engine
from app.models import user
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VeridiaApp User Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to specific origins in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

# Create database tables
user.Base.metadata.create_all(bind=engine)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to VeridiaApp User Service. Access API at /api/v1/auth."}

# Global exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.error(f"ValueError occurred: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"detail": f"Invalid input: {str(exc)}"},
    )

@app.exception_handler(AttributeError)
async def attribute_error_handler(request: Request, exc: AttributeError):
    logger.error(f"AttributeError occurred: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please contact support."},
    )