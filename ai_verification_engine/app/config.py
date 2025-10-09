"""
Configuration Management for AI Verification Engine
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    app_name: str = "VeridiaApp AI Verification Engine"
    debug: bool = False
    redis_url: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
