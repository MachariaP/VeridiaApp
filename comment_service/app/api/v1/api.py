from fastapi import APIRouter
from app.api.v1.endpoints import comments

api_router = APIRouter()
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
