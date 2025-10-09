"""
Configuration Management for Audit & Scoring Service
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    app_name: str = "VeridiaApp Audit & Scoring Service"
    debug: bool = False
    database_url: str = "postgresql://veridia_user:30937594PHINE@localhost:5432/VeridiaDB"
    redis_url: str = "redis://localhost:6379"
    
    # Rate limiting configuration
    rate_limit_requests: int = 100
    rate_limit_period: int = 60  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
