from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class UserRole(enum.Enum):
    """
    User roles for RBAC (Role-Based Access Control).
    Defines permissions and capabilities for different user types.
    """
    STANDARD = "standard"  # Standard user: content submission, voting, commenting
    VERIFIED_CONTRIBUTOR = "verified_contributor"  # Verified: faster verification queue
    MODERATOR = "moderator"  # Moderator: content status override, account management


class User(Base):
    """SQLAlchemy User model for database storage with RBAC support."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STANDARD, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role.value}')>"
