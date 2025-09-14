import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_content_invalid_author():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/content/", json={
            "title": "Test",
            "body": "Test body"
        }, params={"author_id": 9999})
        assert response.status_code == 403
        assert response.json()["detail"] == "Invalid author"
