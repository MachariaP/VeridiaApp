import httpx
from fastapi import HTTPException
from core.config import settings

async def validate_author(author_id: int) -> bool:
    """Async call to User Service to validate author exists and is active."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.USER_SERVICE_URL}/users/{author_id}",
                headers={"Authorization": "Bearer INTERNAL_TOKEN"}
            )
            return response.status_code == 200
        except httpx.RequestError:
            return False

# Example create_content function
async def create_content(db, content_in, author_id):
    if not await validate_author(author_id):
        raise HTTPException(status_code=403, detail="Invalid author")
    # ...rest of your logic...
