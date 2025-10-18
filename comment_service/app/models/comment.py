from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base


class Comment(Base):
    """
    SQLAlchemy model for Comment entity.
    
    Attributes:
        id: Primary key (UUID)
        user_id: ID of the user who created the comment (UUID)
        content_id: ID of the content being commented on (UUID)
        parent_comment_id: Optional ID of parent comment for threading (UUID)
        comment_text: Text content of the comment
        is_deleted: Soft delete flag
        created_at: Timestamp when comment was created
    """
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    content_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    parent_comment_id = Column(UUID(as_uuid=True), ForeignKey('comments.id'), nullable=True, index=True)
    comment_text = Column(Text, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship for nested comments
    replies = relationship(
        "Comment",
        backref="parent",
        remote_side=[id],
        lazy="selectin"
    )
    
    def __repr__(self):
        return f"<Comment(id={self.id}, user={self.user_id}, content={self.content_id})>"
