from fastapi import FastAPI
from api.v1.endpoints import websockets

app = FastAPI()

app.include_router(websockets.router)
