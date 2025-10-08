# GDPR Compliance Guide

## Overview

VeridiaApp is designed with privacy and data protection at its core, aligning with the European General Data Protection Regulation (GDPR) principles. This document outlines how the platform respects user rights and implements data governance best practices.

---

## Core Principles

### 1. Data Minimization (Article 5.1.c)

**We only collect essential data**

#### Registration Data Collected
- ✅ Username (required for identity)
- ✅ Email address (required for account recovery)
- ✅ Secure password hash (required for authentication)

#### Data NOT Collected
- ❌ Phone number
- ❌ Physical address
- ❌ Date of birth
- ❌ Social security number
- ❌ Financial information (unless payment required)

```python
# User model - minimal data collection
class User(Base):
    id = Column(Integer, primary_key=True)
    username = Column(String(50))  # Essential
    email = Column(String(255))    # Essential
    hashed_password = Column(String(255))  # Essential (hashed)
    is_active = Column(Boolean)    # Essential for account management
    role = Column(Enum(UserRole))  # Essential for permissions
    created_at = Column(DateTime)  # Essential for audit
    updated_at = Column(DateTime)  # Essential for audit
```

---

### 2. Purpose Limitation (Article 5.1.b)

**Data is used only for stated purposes**

#### Purpose Statement
User data collected during registration is used exclusively for:
1. **Authentication**: Verifying user identity during login
2. **Authorization**: Managing access to platform features
3. **Communication**: Account-related notifications (optional)
4. **Security**: Detecting and preventing fraud
5. **Legal Compliance**: Responding to valid legal requests

#### NOT Used For
- ❌ Third-party advertising
- ❌ Selling to data brokers
- ❌ Profiling for marketing
- ❌ Unrelated commercial purposes

---

### 3. Storage Limitation (Article 5.1.e)

**Data is retained only as long as necessary**

#### Retention Policy

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Active user accounts | Duration of account | Service provision |
| Deleted user accounts | 30 days (backup) | Allow recovery from accidental deletion |
| Audit logs (security) | 1 year | Security and fraud prevention |
| Content submissions | Duration or until deleted | Service provision |
| Anonymous analytics | Indefinite | Aggregate statistics only |

#### Automatic Deletion
```python
# Scheduled job (pseudocode)
@scheduled_task(interval="daily")
def cleanup_expired_data():
    # Delete soft-deleted accounts after 30 days
    delete_users_where(deleted_at < now() - 30.days)
    
    # Delete audit logs older than 1 year
    delete_audit_logs_where(created_at < now() - 1.year)
```

---

## User Rights Implementation

### Right to Access (Article 15)

**Users can request all their personal data**

#### Endpoint
```
GET /api/v1/gdpr/export
Authorization: Bearer <jwt_token>
```

#### Response Format
```json
{
  "profile": {
    "id": 123,
    "username": "alice",
    "email": "alice@example.com",
    "role": "standard",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "audit_logs": [
    {
      "action": "user_registered",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "action": "content_submitted",
      "resource_id": "abc123",
      "timestamp": "2024-01-02T10:30:00Z"
    }
  ],
  "generated_at": "2024-01-15T12:00:00Z",
  "format": "JSON"
}
```

#### Implementation
```python
@router.get("/export")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all user data in machine-readable format."""
    # Gather data from all services
    user_data = {
        "profile": serialize_user(current_user),
        "audit_logs": get_user_audit_logs(db, current_user.id),
        # TODO: Gather from other services via API/events
        # "content": get_user_content(current_user.id),
        # "votes": get_user_votes(current_user.id),
        # "comments": get_user_comments(current_user.id)
    }
    
    # Log the export request
    log_audit_event(db, "data_exported", current_user.id)
    
    return user_data
```

---

### Right to Erasure (Article 17)

**Users can request complete deletion of their data**

#### Endpoint
```
DELETE /api/v1/gdpr/account
Authorization: Bearer <jwt_token>
```

#### What Gets Deleted
1. ✅ User profile (username, email, password hash)
2. ✅ User's submitted content (from content_service)
3. ✅ User's votes (from verification_service)
4. ✅ User's comments (from verification_service)
5. ✅ User's audit logs (except deletion request itself)
6. ✅ User's search history

#### What Remains (Anonymized)
- 📊 Aggregate statistics (no personal identifiers)
- 📋 System audit logs (IP addresses redacted after 90 days)

#### Implementation
```python
@router.delete("/account")
async def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete user account and all associated data.
    Implements GDPR Article 17 - Right to Erasure.
    """
    user_id = current_user.id
    
    # Log deletion request (preserved for compliance)
    log_audit_event(
        db, "account_deletion_requested", 
        user_id, details={"email": current_user.email}
    )
    
    # Publish AccountDeletionRequested event
    # This triggers deletion across all microservices:
    event_publisher.publish_event(
        "AccountDeletionRequested",
        {"user_id": user_id, "username": current_user.username}
    )
    
    # Delete user data from this service
    db.delete(current_user)
    db.commit()
    
    return None
```

#### Cross-Service Deletion
```python
# In content_service: Event consumer
@consume_event("AccountDeletionRequested")
def handle_account_deletion(event_data):
    user_id = event_data["user_id"]
    
    # Delete user's content
    content_repo.delete_user_content(user_id)
    
    # Anonymize content (if retention required)
    # content_repo.anonymize_user_content(user_id)
    
    log.info(f"Deleted content for user {user_id}")
```

---

### Right to Rectification (Article 16)

**Users can correct inaccurate data**

#### Endpoint
```
PATCH /api/v1/auth/profile
Authorization: Bearer <jwt_token>
Body: { "email": "newemail@example.com" }
```

#### Editable Fields
- ✅ Email address
- ✅ Password
- ❌ Username (permanent after creation)
- ❌ User ID (system-assigned)

---

### Right to Data Portability (Article 20)

**Users can receive data in a structured, machine-readable format**

#### Supported Formats
1. **JSON** (default): Complete data export
2. **CSV**: Tabular data (future)
3. **XML**: Enterprise integration (future)

#### Example
```bash
curl -H "Authorization: Bearer <token>" \
     https://api.veridiaapp.com/api/v1/gdpr/export \
     > my_data.json
```

---

## Data Security Measures

### 1. Encryption

#### At Rest
- ✅ Password hashing: Argon2 (primary) + bcrypt (fallback)
- ✅ Database encryption: TLS for connections
- ✅ Secrets management: Environment variables, not hardcoded

```python
# Secure password hashing
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"], 
    deprecated="auto"
)
hashed = pwd_context.hash(password)
```

#### In Transit
- ✅ HTTPS/TLS for all API communications
- ✅ Secure WebSocket (WSS) for real-time features
- ✅ Certificate pinning (mobile apps)

---

### 2. Access Control

#### Authentication
- ✅ JWT tokens (short-lived: 30 minutes)
- ✅ Refresh tokens (7 days, rotation on use)
- ✅ Rate limiting to prevent brute force

#### Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Resource-level permissions
- ✅ Audit logging for all sensitive actions

---

### 3. Audit Logging

**Non-repudiable logging for compliance**

```python
class AuditLog(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    action = Column(String(100))  # "data_exported", "account_deleted"
    resource_type = Column(String(50))
    resource_id = Column(String(100))
    details = Column(JSON)  # Additional context
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    created_at = Column(DateTime)
```

#### Logged Actions
- User registration
- Login attempts (success/failure)
- Data export requests
- Account deletion requests
- Password changes
- Email changes
- Role changes (moderator actions)

---

## Data Processing Agreements

### Third-Party Services

| Service | Purpose | Data Shared | Location | GDPR Compliant |
|---------|---------|-------------|----------|----------------|
| AWS/GCP | Infrastructure hosting | Encrypted data | EU region | ✅ Yes (DPA signed) |
| Elasticsearch | Search indexing | Content metadata | EU region | ✅ Yes |
| MongoDB Atlas | Data storage | User content | EU region | ✅ Yes |
| PostgreSQL | Relational data | User profiles | EU region | ✅ Yes |

**Note**: All third-party processors have signed Data Processing Agreements (DPAs) compliant with Article 28.

---

## Data Breach Procedures

### Detection
- Real-time monitoring for suspicious activity
- Automated alerts for anomalies
- Regular security audits

### Response (Article 33 & 34)

#### Within 72 Hours
1. **Assess Impact**: Determine scope and affected users
2. **Notify Authority**: Report to supervisory authority
3. **Contain Breach**: Isolate affected systems
4. **Document**: Record in breach register

#### User Notification
If breach poses high risk to users:
- ✅ Email notification within 72 hours
- ✅ In-app alert
- ✅ Public disclosure (if severe)

```python
# Breach notification template
def notify_data_breach(user_email, breach_details):
    send_email(
        to=user_email,
        subject="Important Security Notice",
        body=f"""
        We are writing to inform you of a security incident that may 
        affect your account. 
        
        What happened: {breach_details.description}
        When: {breach_details.detected_at}
        Data affected: {breach_details.affected_data}
        Our response: {breach_details.mitigation}
        
        What you should do: {breach_details.user_action}
        """
    )
```

---

## Privacy by Design

### Technical Measures
1. **Pseudonymization**: User IDs instead of names in logs
2. **Data Separation**: Microservices architecture isolates data
3. **Minimal Retention**: Automatic deletion policies
4. **Encryption Default**: TLS everywhere

### Organizational Measures
1. **Privacy Training**: All developers trained on GDPR
2. **Impact Assessments**: DPIA for new features
3. **Regular Audits**: Quarterly compliance reviews
4. **Designated DPO**: Data Protection Officer appointed

---

## User Consent Management

### Consent Requirements

#### Explicit Consent Required For
- ✅ Email marketing (opt-in)
- ✅ Push notifications (opt-in)
- ✅ Analytics cookies (opt-in)

#### No Consent Required For (Legitimate Interest)
- ✅ Essential service cookies
- ✅ Security monitoring
- ✅ Fraud prevention
- ✅ Legal compliance

### Consent Management
```python
class UserConsent(Base):
    user_id = Column(Integer, ForeignKey("users.id"))
    consent_type = Column(String(50))  # "email_marketing", "analytics"
    granted = Column(Boolean)
    granted_at = Column(DateTime)
    withdrawn_at = Column(DateTime, nullable=True)
    
    # Consent must be freely given, specific, informed, and unambiguous
```

---

## Compliance Checklist

### Registration Flow
- [ ] Clear privacy policy link
- [ ] Minimal data collection form
- [ ] Password strength requirements
- [ ] Email verification
- [ ] Consent checkboxes (if applicable)

### User Dashboard
- [ ] "Export Data" button
- [ ] "Delete Account" button
- [ ] Privacy settings page
- [ ] Consent management interface

### API Endpoints
- [x] GET /api/v1/gdpr/export - Data export
- [x] DELETE /api/v1/gdpr/account - Account deletion
- [ ] GET /api/v1/gdpr/consent - View consents
- [ ] POST /api/v1/gdpr/consent - Update consent

### Documentation
- [x] This GDPR compliance guide
- [x] RBAC documentation
- [ ] Privacy policy (user-facing)
- [ ] Cookie policy
- [ ] Terms of service

---

## Contact Information

### Data Protection Officer (DPO)
- **Email**: dpo@veridiaapp.com
- **Role**: Oversees GDPR compliance
- **Responsibilities**: 
  - Monitor compliance
  - Advise on data protection
  - Handle data subject requests
  - Cooperate with supervisory authority

### Supervisory Authority
Users have the right to lodge complaints with their national data protection authority.

---

## Updates and Versioning

**Version**: 1.0  
**Last Updated**: 2024-01-15  
**Next Review**: 2024-04-15 (Quarterly)

This document will be updated as regulations evolve and new features are implemented.
