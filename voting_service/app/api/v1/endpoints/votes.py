from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import Dict, Any
from uuid import UUID
import logging

from app.schemas.vote import VoteCreate, VoteOut, VoteResults
from app.models.vote import Vote, VoteType
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


def calculate_verification_status(
    authentic_percentage: float,
    false_percentage: float
) -> str:
    """
    Calculate verification status based on vote percentages.
    
    Args:
        authentic_percentage: Percentage of authentic votes
        false_percentage: Percentage of false votes
        
    Returns:
        Verification status string
    """
    if authentic_percentage >= settings.VERIFIED_THRESHOLD:
        return "verified"
    elif false_percentage >= settings.FALSE_THRESHOLD:
        return "false"
    else:
        return "disputed"


@router.post("/", response_model=VoteOut, status_code=status.HTTP_201_CREATED)
async def submit_vote(
    vote_data: VoteCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a vote on a content item.
    
    A user can only vote once per content item. Attempting to vote again
    will result in a 409 Conflict error.
    
    Args:
        vote_data: Vote information
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created vote
        
    Raises:
        HTTPException: 409 if user already voted, 500 on database error
    """
    try:
        # Create vote
        vote = Vote(
            user_id=UUID(current_user["user_id"]),
            content_id=vote_data.content_id,
            vote_type=vote_data.vote_type,
            reasoning=vote_data.reasoning
        )
        
        db.add(vote)
        db.commit()
        db.refresh(vote)
        
        logger.info(f"Vote created: user={current_user['user_id']}, content={vote_data.content_id}")
        
        return vote
        
    except IntegrityError as e:
        db.rollback()
        logger.warning(f"Duplicate vote attempt: user={current_user['user_id']}, content={vote_data.content_id}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already voted on this content"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting vote: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit vote"
        )


@router.get("/content/{content_id}/results", response_model=VoteResults)
async def get_vote_results(
    content_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get aggregated vote results for a content item.
    
    Calculates vote counts, percentages, and determines the overall
    verification status based on vote thresholds.
    
    Args:
        content_id: ID of content to get results for
        db: Database session
        
    Returns:
        Vote aggregation results with verification status
    """
    try:
        # Get vote counts by type
        vote_counts = db.query(
            Vote.vote_type,
            func.count(Vote.id).label('count')
        ).filter(
            Vote.content_id == content_id
        ).group_by(
            Vote.vote_type
        ).all()
        
        # Initialize counts
        authentic_count = 0
        false_count = 0
        unsure_count = 0
        
        # Process results
        for vote_type, count in vote_counts:
            if vote_type == VoteType.AUTHENTIC:
                authentic_count = count
            elif vote_type == VoteType.FALSE:
                false_count = count
            elif vote_type == VoteType.UNSURE:
                unsure_count = count
        
        # Calculate totals and percentages
        total_votes = authentic_count + false_count + unsure_count
        
        if total_votes > 0:
            authentic_percentage = (authentic_count / total_votes) * 100
            false_percentage = (false_count / total_votes) * 100
            unsure_percentage = (unsure_count / total_votes) * 100
        else:
            authentic_percentage = 0.0
            false_percentage = 0.0
            unsure_percentage = 0.0
        
        # Calculate verification status
        if total_votes == 0:
            verification_result = "pending"
        else:
            verification_result = calculate_verification_status(
                authentic_percentage / 100,
                false_percentage / 100
            )
        
        return VoteResults(
            content_id=content_id,
            total_votes=total_votes,
            authentic_count=authentic_count,
            false_count=false_count,
            unsure_count=unsure_count,
            authentic_percentage=round(authentic_percentage, 2),
            false_percentage=round(false_percentage, 2),
            unsure_percentage=round(unsure_percentage, 2),
            verification_result=verification_result
        )
        
    except Exception as e:
        logger.error(f"Error getting vote results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vote results"
        )


@router.get("/user/votes")
async def get_user_votes(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all votes cast by the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of user's votes
    """
    try:
        votes = db.query(Vote).filter(
            Vote.user_id == UUID(current_user["user_id"])
        ).offset(skip).limit(limit).all()
        
        return votes
        
    except Exception as e:
        logger.error(f"Error getting user votes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve votes"
        )


@router.get("/content/{content_id}/user-vote")
async def get_user_vote_on_content(
    content_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if the current user has voted on a specific content item.
    
    Args:
        content_id: ID of content to check
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        User's vote if exists, None otherwise
    """
    try:
        vote = db.query(Vote).filter(
            Vote.user_id == UUID(current_user["user_id"]),
            Vote.content_id == content_id
        ).first()
        
        if vote:
            return VoteOut.from_orm(vote)
        else:
            return {"voted": False}
        
    except Exception as e:
        logger.error(f"Error checking user vote: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check vote status"
        )
