"""
Audit log model for tracking critical operations.
Implements non-repudiable logging for security and compliance.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from datetime import datetime
from app.models.user import Base


class AuditLog(Base):
    """
    Audit log for tracking critical user and system operations.
    Provides non-repudiable logging for compliance (e.g., GDPR).
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # Nullable for system events
    username = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "user_registered", "password_changed"
    resource_type = Column(String(50), nullable=True)  # e.g., "user", "content", "verification"
    resource_id = Column(String(100), nullable=True, index=True)
    details = Column(JSON, nullable=True)  # Additional context as JSON
    ip_address = Column(String(45), nullable=True)  # Support IPv6
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', user='{self.username}')>"
