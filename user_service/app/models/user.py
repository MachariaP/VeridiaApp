from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration."""
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"


class User(Base):
    """User ORM model for authentication and authorization."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    role = Column(String(20), default=UserRole.USER.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Profile fields
    bio = Column(String(160), nullable=True)
    avatar = Column(String(512), nullable=True)
    cover_photo = Column(String(512), nullable=True)
    location = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Settings fields
    notifications_enabled = Column(Boolean, default=True, nullable=False)
    theme = Column(String(20), default="light", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    privacy_posts = Column(String(20), default="public", nullable=False)
    privacy_profile = Column(String(20), default="public", nullable=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
