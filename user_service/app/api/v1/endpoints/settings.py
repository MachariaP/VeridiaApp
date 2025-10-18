from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import SettingsOut, SettingsUpdate, AccountUpdate
from app.api.dependencies import get_current_user
from app.core.security import hash_password, verify_password

router = APIRouter()


@router.get("/", response_model=SettingsOut)
def get_settings(current_user: User = Depends(get_current_user)):
    """
    Get current user's settings.
    
    Returns notification preferences, theme, language, and privacy settings.
    """
    return SettingsOut(
        notifications_enabled=current_user.notifications_enabled,
        theme=current_user.theme,
        language=current_user.language,
        privacy_posts=current_user.privacy_posts,
        privacy_profile=current_user.privacy_profile
    )


@router.put("/", response_model=SettingsOut)
def update_settings(
    settings_data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's settings.
    
    Allows updating notification preferences, theme, language, and privacy settings.
    Only updates fields that are provided in the request.
    """
    # Update only provided fields
    update_data = settings_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return SettingsOut(
        notifications_enabled=current_user.notifications_enabled,
        theme=current_user.theme,
        language=current_user.language,
        privacy_posts=current_user.privacy_posts,
        privacy_profile=current_user.privacy_profile
    )


@router.put("/account")
def update_account(
    account_data: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update account details (email, password).
    
    Requires the current password for verification.
    """
    # Verify current password
    if not verify_password(account_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    # Update email if provided
    if account_data.email and account_data.email != current_user.email:
        # Check if email is already in use
        existing_user = db.query(User).filter(User.email == account_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        current_user.email = account_data.email
    
    # Update password if provided
    if account_data.password:
        current_user.hashed_password = hash_password(account_data.password)
    
    db.commit()
    
    return {"message": "Account updated successfully"}


@router.delete("/account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user's account.
    
    This is a permanent action. The user account will be deactivated.
    """
    # Instead of deleting, we'll deactivate the account
    current_user.is_active = False
    db.commit()
    
    return {"message": "Account deleted successfully"}
