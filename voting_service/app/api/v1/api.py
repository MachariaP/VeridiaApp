from fastapi import APIRouter
from app.api.v1.endpoints import votes

api_router = APIRouter()
api_router.include_router(votes.router, prefix="/votes", tags=["votes"])
