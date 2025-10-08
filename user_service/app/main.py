from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import gdpr
from app.core.database import init_db

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="User Service",
    version="1.0.0",
    description="User authentication and profile management microservice for VeridiaApp"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Include routers
# IMPORTANT: The routers do NOT have a prefix defined on them.
# The prefix is specified here to create endpoints at /api/v1/auth/* and /api/v1/gdpr/*
# This prevents duplicate prefixes (e.g., /api/v1/api/v1/auth/login)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(gdpr.router, prefix="/api/v1/gdpr", tags=["gdpr"])

@app.get("/")
def read_root():
    return {"message": "User Service is up and running!"}

# Catch-all route for invalid paths
@app.get("/{path:path}", include_in_schema=False)
@app.post("/{path:path}", include_in_schema=False)
async def handle_invalid_path(path: str):
    logger.warning(f"Invalid path requested: /{path}")
    raise HTTPException(
        status_code=404,
        detail=f"Endpoint not found: /{path}. Available endpoints are under /api/v1/auth (login, register, me)."
    )

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
