from fastapi import FastAPI

app = FastAPI(title="User Service", version="1.0.0")

# Future: Include routers here
# from app.api.v1.endpoints import users, auth
# app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "User Service is up and running!"}
