from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List
import json
from core.security import get_current_active_user  # For WS auth

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str, content_id: int):
        # Filter by content_id (use Redis pub/sub for multi-room in prod)
        for connection in self.active_connections:
            if await connection.receive_text() == f"room:{content_id}":  # Simplified room check
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{content_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    content_id: int,
    current_user = Depends(get_current_active_user)  # Authenticate WS connection
):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            comment = json.loads(data)
            # Save to MongoDB via Content Service call (async)
            await manager.broadcast(f"New comment from {current_user.username}: {comment['text']}", content_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
