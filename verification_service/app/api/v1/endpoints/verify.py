"""
Verification API endpoints for voting and discussions.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.schemas.verification import VoteIn, VoteOut, CommentIn, CommentOut, VoteStats
from app.models.verification import VerificationVote, DiscussionComment
from app.core.database import get_db
from app.core.security import verify_token
from app.utils.status_updater import calculate_final_status
from app.utils.notifications import notification_service


router = APIRouter()


def get_current_user(authorization: Optional[str] = Header(None)) -> tuple[str, int]:
    """
    Dependency to extract and validate JWT token from Authorization header.
    Returns username and user_id.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    
    username = verify_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # TODO: Call user_service to get actual user_id
    user_id = hash(username) % 1000000
    
    return username, user_id


@router.post("/{content_id}/vote", response_model=VoteOut, status_code=status.HTTP_201_CREATED)
async def submit_vote(
    content_id: str,
    vote_in: VoteIn,
    current_user: tuple = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a verification vote for content.
    Authenticated users can vote True (verified) or False (disputed).
    One vote per user per content (updates if exists).
    
    Enhanced with:
    - Status threshold checking (85% verified with 50+ votes)
    - Automatic status updates when thresholds are met
    - Notification publishing for status changes
    """
    username, user_id = current_user
    
    # Get current vote stats before update
    old_stats = await get_vote_stats(content_id, db)
    old_status = calculate_final_status(
        old_stats.verified_votes,
        old_stats.disputed_votes,
        old_stats.total_votes
    )
    
    # Check if user already voted on this content
    existing_vote = db.query(VerificationVote).filter(
        VerificationVote.content_id == content_id,
        VerificationVote.user_id == user_id
    ).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.vote = vote_in.vote
        db.commit()
        db.refresh(existing_vote)
        vote_result = existing_vote
    else:
        # Create new vote
        new_vote = VerificationVote(
            content_id=content_id,
            user_id=user_id,
            vote=vote_in.vote
        )
        db.add(new_vote)
        db.commit()
        db.refresh(new_vote)
        vote_result = new_vote
    
    # Get new vote stats after update
    new_stats = await get_vote_stats(content_id, db)
    new_status = calculate_final_status(
        new_stats.verified_votes,
        new_stats.disputed_votes,
        new_stats.total_votes
    )
    
    # Check if status changed
    if old_status != new_status:
        # TODO: Get content creator ID from content_service
        # For now, log the status change
        print(f"[STATUS CHANGE] Content {content_id}: {old_status} -> {new_status}")
        print(f"[STATUS CHANGE] Trigger: Community voting ({new_stats.verification_percentage}% verified)")
        
        # TODO: In production, publish StatusUpdated event to RabbitMQ
        # event_publisher.publish_status_updated(
        #     content_id=content_id,
        #     old_status=old_status,
        #     new_status=new_status,
        #     trigger="Community Consensus"
        # )
        
        # TODO: Notify content creator (requires content_service integration)
        # notification_service.notify_status_change(
        #     content_id=content_id,
        #     content_creator_id=creator_id,
        #     old_status=old_status,
        #     new_status=new_status,
        #     trigger=f"Community Consensus: {new_stats.verification_percentage}% verified"
        # )
    
    return vote_result


@router.get("/{content_id}/votes", response_model=VoteStats)
async def get_vote_stats(
    content_id: str,
    db: Session = Depends(get_db)
):
    """
    Get voting statistics for content.
    Public endpoint - no authentication required.
    
    Enhanced with calculated status based on thresholds:
    - Verified: 85% verified votes AND total > 50
    - Disputed: 35% disputed votes
    - Otherwise: Pending/Under Review
    """
    votes = db.query(VerificationVote).filter(
        VerificationVote.content_id == content_id
    ).all()
    
    total_votes = len(votes)
    verified_votes = sum(1 for v in votes if v.vote)
    disputed_votes = total_votes - verified_votes
    
    verification_percentage = (verified_votes / total_votes * 100) if total_votes > 0 else 0.0
    
    # Calculate status based on thresholds
    calculated_status = calculate_final_status(verified_votes, disputed_votes, total_votes)
    
    return VoteStats(
        content_id=content_id,
        total_votes=total_votes,
        verified_votes=verified_votes,
        disputed_votes=disputed_votes,
        verification_percentage=round(verification_percentage, 2),
        status=calculated_status
    )


@router.post("/{content_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def post_comment(
    content_id: str,
    comment_in: CommentIn,
    current_user: tuple = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Post a discussion comment on content.
    Requires authentication.
    """
    username, user_id = current_user
    
    new_comment = DiscussionComment(
        content_id=content_id,
        user_id=user_id,
        username=username,
        comment=comment_in.comment
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment


@router.get("/{content_id}/comments", response_model=List[CommentOut])
async def get_comments(
    content_id: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get discussion comments for content.
    Public endpoint - no authentication required.
    """
    comments = db.query(DiscussionComment).filter(
        DiscussionComment.content_id == content_id
    ).order_by(DiscussionComment.created_at.desc()).offset(skip).limit(limit).all()
    
    return comments


@router.delete("/{content_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    content_id: str,
    comment_id: int,
    current_user: tuple = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a comment.
    Only the comment author can delete their own comment.
    """
    username, user_id = current_user
    
    # Find the comment
    comment = db.query(DiscussionComment).filter(
        DiscussionComment.id == comment_id,
        DiscussionComment.content_id == content_id
    ).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user is the comment author
    if comment.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )
    
    # Delete the comment
    db.delete(comment)
    db.commit()
    
    return None
