"""
Application configuration settings.
"""
import os
from typing import Optional

class Settings:
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Content Service"
    VERSION: str = "1.0.0"
    
    # MongoDB Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "veridiadb")
    MONGODB_USERNAME: Optional[str] = os.getenv("MONGODB_USERNAME")
    MONGODB_PASSWORD: Optional[str] = os.getenv("MONGODB_PASSWORD")
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    @property
    def MONGODB_CONNECTION_STRING(self) -> str:
        """Build MongoDB connection string with authentication if provided."""
        if self.MONGODB_USERNAME and self.MONGODB_PASSWORD:
            return f"mongodb://{self.MONGODB_USERNAME}:{self.MONGODB_PASSWORD}@localhost:27017/{self.MONGODB_DB_NAME}?authSource=admin"
        return f"{self.MONGODB_URL}/{self.MONGODB_DB_NAME}"

# Global settings instance
settings = Settings()
