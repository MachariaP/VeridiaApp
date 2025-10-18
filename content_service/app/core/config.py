from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Project Info
    PROJECT_NAME: str = "VeridiaApp Content Submission Service"
    API_V1_PREFIX: str = "/api/v1"
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "veridiapp_content_db"
    
    # JWT Settings (must match user_service)
    JWT_SECRET_KEY: str = "your-secret-key-here-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    
    # File Upload Settings
    UPLOAD_DIR: str = "/tmp/veridiapp_uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".txt", ".jpg", ".jpeg", ".png", ".gif", ".pdf"}
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
