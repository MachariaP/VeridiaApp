from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.user import UserOut
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile.
    
    This is a protected endpoint that requires authentication.
    Returns the profile of the currently authenticated user.
    """
    return current_user
