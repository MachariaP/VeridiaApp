from fastapi import APIRouter, Depends
from crud.content import create_content
# from models import ContentCreate  # Uncomment and adjust as needed
# from dependencies import get_db  # Uncomment and adjust as needed

router = APIRouter()

@router.post("/")
async def create_content_endpoint(content_in, author_id: int, db=Depends()):
    return await create_content(db, content_in, author_id)
