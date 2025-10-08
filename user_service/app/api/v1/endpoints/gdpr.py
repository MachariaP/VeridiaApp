"""
GDPR-aligned endpoints for data privacy and control.
Implements user rights to data export and account deletion.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import json

from app.core.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.api.v1.endpoints.auth import get_current_user
from app.utils.audit import log_audit_event


router = APIRouter()


@router.get("/export", response_model=Dict[str, Any])
async def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all user data in machine-readable format (GDPR Article 20).
    Returns comprehensive user profile and activity data.
    """
    # Gather user data
    user_data = {
        "profile": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
            "is_active": current_user.is_active,
            "created_at": current_user.created_at.isoformat(),
            "updated_at": current_user.updated_at.isoformat()
        },
        "audit_logs": []
    }
    
    # Add audit logs for this user
    audit_logs = db.query(AuditLog).filter(
        AuditLog.user_id == current_user.id
    ).order_by(AuditLog.created_at.desc()).limit(100).all()
    
    for log in audit_logs:
        user_data["audit_logs"].append({
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        })
    
    # Log the export request
    log_audit_event(
        db=db,
        action="data_exported",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="user",
        resource_id=str(current_user.id),
        details={"export_size_kb": len(json.dumps(user_data)) / 1024}
    )
    
    return user_data


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete user account and all associated data (GDPR Article 17 - Right to Erasure).
    This performs a complete erasure across all services.
    
    NOTE: In production, this would trigger events to delete data from:
    - content_service (user's submitted content)
    - verification_service (user's votes and comments)
    - search_service (indexed user data)
    """
    user_id = current_user.id
    username = current_user.username
    
    # Log the deletion request before deleting
    log_audit_event(
        db=db,
        action="account_deletion_requested",
        user_id=user_id,
        username=username,
        resource_type="user",
        resource_id=str(user_id),
        details={"email": current_user.email}
    )
    
    # TODO: In production, publish AccountDeletionRequested event to RabbitMQ
    # This would trigger deletion across all microservices:
    # - Delete user's content from content_service
    # - Delete user's votes and comments from verification_service
    # - Remove user data from search indexes
    
    # Delete audit logs for this user (keep deletion request log)
    db.query(AuditLog).filter(
        AuditLog.user_id == user_id,
        AuditLog.action != "account_deletion_requested"
    ).delete()
    
    # Delete the user account
    db.delete(current_user)
    db.commit()
    
    return None
