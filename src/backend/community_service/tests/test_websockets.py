import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_websocket_comments():
    client = TestClient(app)
    with client.websocket_connect("/ws/1") as websocket:
        websocket.send_text('{"text": "Hello"}')
        data = websocket.receive_text()
        assert "Hello" in data
