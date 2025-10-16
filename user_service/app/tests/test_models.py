import pytest
from app.models.user import User, UserRole
from app.core.security import hash_password


def test_user_model_creation(db):
    """Test creating a user model."""
    user = User(
        email="newuser@example.com",
        hashed_password=hash_password("password123"),
        first_name="New",
        last_name="User",
        role=UserRole.USER.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    assert user.id is not None
    assert user.email == "newuser@example.com"
    assert user.first_name == "New"
    assert user.last_name == "User"
    assert user.role == UserRole.USER.value
    assert user.is_active is True
    assert user.created_at is not None


def test_user_model_query(db):
    """Test querying a user model."""
    user = User(
        email="query@example.com",
        hashed_password=hash_password("password123"),
        role=UserRole.USER.value
    )
    db.add(user)
    db.commit()
    
    queried_user = db.query(User).filter(User.email == "query@example.com").first()
    assert queried_user is not None
    assert queried_user.email == "query@example.com"


def test_user_unique_email(db):
    """Test that email must be unique."""
    user1 = User(
        email="unique@example.com",
        hashed_password=hash_password("password123")
    )
    db.add(user1)
    db.commit()
    
    user2 = User(
        email="unique@example.com",
        hashed_password=hash_password("password456")
    )
    db.add(user2)
    
    with pytest.raises(Exception):
        db.commit()
