from fastapi import FastAPI

app = FastAPI(title="User Service", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "User Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
