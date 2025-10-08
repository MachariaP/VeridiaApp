# Role-Based Access Control (RBAC) Guide

## Overview

VeridiaApp implements a fine-grained Role-Based Access Control (RBAC) system to manage user permissions and capabilities. The system is designed to align with European best practices for security and data governance.

## User Roles

### 1. Standard User

**Default role for all new users**

#### Key Permissions
- ✅ Content submission
- ✅ Voting on content (verified/disputed)
- ✅ Commenting on content
- ✅ Viewing all public content
- ✅ Managing own content (edit/delete pending content only)
- ✅ Accessing personal dashboard

#### Restrictions
- ❌ Cannot delete verified content
- ❌ Cannot override verification status
- ❌ Cannot manage other users' content
- ❌ Cannot access moderation tools

#### Logic Example
```python
# Standard users can only edit or delete their own pending content
if user.role == UserRole.STANDARD:
    if content.created_by_user_id != user.id:
        raise PermissionError("Can only modify own content")
    if content.status == "Verified":
        raise PermissionError("Cannot modify verified content")
```

---

### 2. Verified Contributor

**Trusted users with proven track record**

#### Key Permissions
All Standard User permissions, plus:
- ✅ Faster verification queue time (priority flag)
- ✅ Enhanced visibility in community
- ✅ Access to advanced analytics
- ✅ Ability to suggest new categories

#### How to Become a Verified Contributor
Users are automatically promoted based on:
1. **Verification Success Rate**: ≥ 80% of submitted content achieves 'Verified' status
2. **Impact Score**: High engagement on submitted content
3. **Community Trust**: Consistently accurate voting history
4. **Time**: Active for at least 3 months

#### Logic Example
```python
# Verified contributor content enters queue with higher priority
if user.role == UserRole.VERIFIED_CONTRIBUTOR:
    content.priority_flag = "high"
    content.verification_queue_position = calculate_priority_position(user)
```

---

### 3. Moderator

**Community guardians with elevated privileges**

#### Key Permissions
All Verified Contributor permissions, plus:
- ✅ Delete disputed content
- ✅ Disable user accounts (temporary/permanent)
- ✅ Override content verification status
- ✅ Access moderation dashboard
- ✅ View all audit logs
- ✅ Manage flagged content queue
- ✅ Handle user reports

#### Restrictions
- ❌ Cannot modify system settings
- ❌ Cannot promote/demote other moderators
- ❌ All actions are logged for accountability

#### Logic Example
```python
# Moderation actions require audit logging and optional peer review
if user.role == UserRole.MODERATOR:
    # Log the moderation action
    log_audit_event(
        db=db,
        action="content_status_override",
        user_id=user.id,
        resource_type="content",
        resource_id=content_id,
        details={"old_status": old_status, "new_status": new_status}
    )
    
    # High-impact actions may require peer review
    if action_severity == "high":
        require_peer_review_before_application()
```

---

## Role Assignment

### Automatic Assignment
- New users start as **Standard User**
- Promotion to **Verified Contributor** is automatic based on metrics
- **Moderators** are appointed by system administrators

### Manual Assignment
System administrators can manually assign roles via:
```bash
# CLI tool (future implementation)
./scripts/assign_role.py --user-id 123 --role moderator
```

---

## Permission Matrix

| Action | Standard User | Verified Contributor | Moderator |
|--------|---------------|---------------------|-----------|
| Submit content | ✅ | ✅ | ✅ |
| Vote on content | ✅ | ✅ | ✅ |
| Comment on content | ✅ | ✅ | ✅ |
| Edit own pending content | ✅ | ✅ | ✅ |
| Delete own pending content | ✅ | ✅ | ✅ |
| Edit own verified content | ❌ | ❌ | ✅ |
| Delete own verified content | ❌ | ❌ | ✅ |
| Override verification status | ❌ | ❌ | ✅ |
| Delete other users' content | ❌ | ❌ | ✅ |
| Disable user accounts | ❌ | ❌ | ✅ |
| Access moderation dashboard | ❌ | ❌ | ✅ |
| View audit logs | Own only | Own only | All |
| Priority verification queue | ❌ | ✅ | ✅ |

---

## Implementation Details

### Database Schema

```python
# User model with role support
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(255), unique=True)
    hashed_password = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.STANDARD)
    # ... other fields
```

### Role Checking in Endpoints

```python
from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole

def require_role(required_role: UserRole):
    """Dependency to check user role."""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.value < required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role.value}"
            )
        return current_user
    return role_checker

# Usage in endpoint
@router.delete("/content/{content_id}")
async def moderate_content(
    content_id: str,
    current_user: User = Depends(require_role(UserRole.MODERATOR))
):
    # Only moderators can access this endpoint
    pass
```

---

## Audit Logging

All role-based actions are logged for accountability:

```python
# Example audit log entry
{
    "id": 1234,
    "user_id": 42,
    "username": "moderator_alice",
    "action": "content_deleted",
    "resource_type": "content",
    "resource_id": "abc123",
    "details": {
        "reason": "Violates community guidelines",
        "old_status": "Disputed"
    },
    "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Future Enhancements

### Planned Role Additions
1. **Admin**: System-wide configuration and user management
2. **Analyst**: Read-only access to analytics and reports
3. **API Partner**: Programmatic access with rate limits

### Planned Permission Enhancements
1. **Granular Permissions**: Separate permissions for specific actions
2. **Custom Roles**: Organization-specific role definitions
3. **Time-Limited Roles**: Temporary moderator assignments

---

## Best Practices

### For Standard Users
- Build reputation by submitting high-quality content
- Vote accurately to improve community trust score
- Engage constructively in discussions

### For Verified Contributors
- Maintain high verification success rate
- Help guide standard users
- Report suspicious content promptly

### For Moderators
- Review flagged content within 24 hours
- Document all moderation decisions
- Seek peer review for major actions
- Maintain impartiality and transparency

---

## Security Considerations

1. **Role Changes Are Logged**: All promotions/demotions are audited
2. **Principle of Least Privilege**: Users get minimum necessary permissions
3. **Regular Reviews**: Moderator actions are reviewed quarterly
4. **Revocation**: Roles can be revoked for policy violations

---

## API Endpoints

### Get Current User's Role
```
GET /api/v1/auth/me
Response: { "id": 1, "username": "alice", "role": "standard" }
```

### Future: Request Role Upgrade
```
POST /api/v1/users/request-upgrade
Body: { "target_role": "verified_contributor", "justification": "..." }
```

---

## Contact

For role-related questions or appeals:
- Email: support@veridiaapp.com
- Community Forum: /community/rbac-discussions
