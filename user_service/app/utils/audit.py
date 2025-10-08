"""
Audit logging utility for tracking critical operations.
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_audit_event(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    username: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AuditLog:
    """
    Log an audit event to the database.
    
    Args:
        db: Database session
        action: Action performed (e.g., "user_registered", "data_exported")
        user_id: User ID who performed the action
        username: Username who performed the action
        resource_type: Type of resource affected (e.g., "user", "content")
        resource_id: ID of the resource affected
        details: Additional context as dictionary
        ip_address: IP address of the request
        user_agent: User agent string
    
    Returns:
        Created AuditLog instance
    """
    audit_log = AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log
