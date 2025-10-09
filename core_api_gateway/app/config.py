"""
Configuration Management using Pydantic Settings
No OS environment variables - structured configuration approach
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings with hierarchical configuration loading"""
    
    # Application
    app_name: str = "VeridiaApp Core API Gateway"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://veridia_user:30937594PHINE@localhost:5432/VeridiaDB"
    
    # Security
    secret_key: str = "veridia-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS - Dynamic origins from configuration
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001"
    ]
    
    # Service URLs
    ai_verification_service_url: str = "http://localhost:8002"
    audit_service_url: str = "http://localhost:8003"
    redis_url: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
