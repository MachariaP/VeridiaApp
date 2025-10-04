"""
Entry point for running the Verification Service with uvicorn.
"""
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
