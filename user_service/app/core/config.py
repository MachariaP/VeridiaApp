from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Project Info
    PROJECT_NAME: str = "VeridiaApp User Service"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://veridiapp_user:veridiapp_password@localhost:5432/veridiapp_user_db"
    TEST_DATABASE_URL: Optional[str] = None
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-secret-key-here-change-in-production"
    JWT_ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
