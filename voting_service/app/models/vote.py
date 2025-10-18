from sqlalchemy import Column, String, Text, DateTime, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.db.base import Base


class VoteType(str, enum.Enum):
    """Enumeration for vote types."""
    AUTHENTIC = "authentic"
    FALSE = "false"
    UNSURE = "unsure"


class Vote(Base):
    """
    SQLAlchemy model for Vote entity.
    
    Attributes:
        id: Primary key (UUID)
        user_id: ID of the user who cast the vote (UUID)
        content_id: ID of the content being voted on (UUID)
        vote_type: Type of vote (authentic, false, unsure)
        reasoning: Optional text explanation for the vote
        voted_at: Timestamp when vote was cast
    """
    __tablename__ = "votes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    content_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    vote_type = Column(Enum(VoteType), nullable=False)
    reasoning = Column(Text, nullable=True)
    voted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Unique constraint to prevent multiple votes from same user on same content
    __table_args__ = (
        UniqueConstraint('user_id', 'content_id', name='uq_user_content_vote'),
    )
    
    def __repr__(self):
        return f"<Vote(id={self.id}, user={self.user_id}, content={self.content_id}, type={self.vote_type})>"
