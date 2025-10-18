from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "VeridiaApp Voting Service"
    
    # Database Settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/veridiapp_votes"
    
    # JWT Settings (must match user_service)
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    
    # Content Service Settings (for communication)
    CONTENT_SERVICE_URL: str = "http://localhost:8001"
    
    # Vote thresholds for status calculation
    VERIFIED_THRESHOLD: float = 0.70  # 70% authentic votes
    FALSE_THRESHOLD: float = 0.70     # 70% false votes
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
