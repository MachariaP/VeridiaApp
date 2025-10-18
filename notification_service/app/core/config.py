from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "VeridiaApp Notification Service"
    API_V1_PREFIX: str = "/api/v1"
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "veridiapp_notifications"
    
    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-here-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }


settings = Settings()
