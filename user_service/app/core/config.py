from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AliasChoices, Field
from typing import Optional


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Project Info
    PROJECT_NAME: str = "VeridiaApp User Service"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    # Support both DATABASE_URL and SQLALCHEMY_DATABASE_URL for backward compatibility
    DATABASE_URL: str = Field(validation_alias=AliasChoices("DATABASE_URL", "SQLALCHEMY_DATABASE_URL"))
    TEST_DATABASE_URL: Optional[str] = None
    
    # JWT Settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"  # Use HS256 for symmetric key encryption (symmetric secret key)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Ignore extra fields to prevent validation errors
    )


settings = Settings()
