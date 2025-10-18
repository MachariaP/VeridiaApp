"""Tests for configuration settings."""
import os
import pytest
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AliasChoices, Field
from typing import Optional


# Define a test Settings class that doesn't load from .env
class MockSettings(BaseSettings):
    """Test application settings."""
    PROJECT_NAME: str = "VeridiaApp User Service"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = Field(validation_alias=AliasChoices("DATABASE_URL", "SQLALCHEMY_DATABASE_URL"))
    TEST_DATABASE_URL: Optional[str] = None
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    model_config = SettingsConfigDict(
        env_file=None,  # Don't load from .env file in tests
        case_sensitive=True,
        extra="ignore"
    )


def test_settings_with_database_url(monkeypatch):
    """Test that Settings accepts DATABASE_URL."""
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.setenv("JWT_SECRET_KEY", "test_secret_key")
    monkeypatch.delenv("SQLALCHEMY_DATABASE_URL", raising=False)
    
    settings = MockSettings()
    assert settings.DATABASE_URL == "postgresql://user:pass@localhost:5432/db"


def test_settings_with_sqlalchemy_database_url(monkeypatch):
    """Test that Settings accepts SQLALCHEMY_DATABASE_URL."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("SQLALCHEMY_DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.setenv("JWT_SECRET_KEY", "test_secret_key")
    
    settings = MockSettings()
    assert settings.DATABASE_URL == "postgresql://user:pass@localhost:5432/db"


def test_settings_prefers_database_url_over_sqlalchemy(monkeypatch):
    """Test that DATABASE_URL takes precedence when both are provided."""
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db1")
    monkeypatch.setenv("SQLALCHEMY_DATABASE_URL", "postgresql://user:pass@localhost:5432/db2")
    monkeypatch.setenv("JWT_SECRET_KEY", "test_secret_key")
    
    settings = MockSettings()
    # AliasChoices uses the first match, so DATABASE_URL should be used
    assert settings.DATABASE_URL == "postgresql://user:pass@localhost:5432/db1"


def test_settings_ignores_extra_fields(monkeypatch):
    """Test that Settings ignores extra fields without raising errors."""
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.setenv("JWT_SECRET_KEY", "test_secret_key")
    monkeypatch.setenv("SOME_RANDOM_FIELD", "random_value")
    
    # This should not raise an error
    settings = MockSettings()
    assert settings.DATABASE_URL == "postgresql://user:pass@localhost:5432/db"

