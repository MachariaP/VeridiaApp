"""
SQLAlchemy models for verification votes and discussion comments.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class VerificationVote(Base):
    """
    Model for tracking verification votes on content.
    Users can vote True (verified) or False (disputed).
    """
    __tablename__ = "verification_votes"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    vote = Column(Boolean, nullable=False)  # True = Verified, False = Disputed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Unique constraint: one vote per user per content
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class DiscussionComment(Base):
    """
    Model for discussion comments on content.
    Supports community discussions around verification.
    """
    __tablename__ = "discussion_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    username = Column(String(100), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )
