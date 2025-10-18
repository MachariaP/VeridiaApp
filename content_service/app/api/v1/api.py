from fastapi import APIRouter
from app.api.v1.endpoints import content

api_router = APIRouter()

# Include content endpoints
api_router.include_router(content.router, prefix="/content", tags=["content"])
