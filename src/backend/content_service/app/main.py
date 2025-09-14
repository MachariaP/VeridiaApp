from fastapi import FastAPI
from api.v1.endpoints import content

app = FastAPI()

app.include_router(content.router, prefix="/api/v1/content", tags=["content"])
