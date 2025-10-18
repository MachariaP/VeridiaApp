from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from uuid import UUID
import logging

from app.schemas.comment import CommentCreate, CommentUpdate, CommentOut
from app.models.comment import Comment
from app.db.base import get_db
from app.api.dependencies import get_current_user, require_role
from app.core.security import sanitize_html

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new comment or reply.
    
    Comment text is sanitized to prevent XSS attacks.
    
    Args:
        comment_data: Comment information
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created comment
    """
    try:
        # Sanitize comment text to prevent XSS
        sanitized_text = sanitize_html(comment_data.comment_text)
        
        # Validate parent comment exists if specified
        if comment_data.parent_comment_id:
            parent = db.query(Comment).filter(
                Comment.id == comment_data.parent_comment_id,
                Comment.is_deleted == False
            ).first()
            
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent comment not found"
                )
        
        # Create comment
        comment = Comment(
            user_id=UUID(current_user["user_id"]),
            content_id=comment_data.content_id,
            parent_comment_id=comment_data.parent_comment_id,
            comment_text=sanitized_text
        )
        
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        logger.info(f"Comment created: user={current_user['user_id']}, content={comment_data.content_id}")
        
        return comment
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create comment"
        )


@router.get("/content/{content_id}", response_model=List[CommentOut])
async def get_comments_for_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all non-deleted comments for a specific content item.
    
    Returns comments in a hierarchical structure with nested replies.
    
    Args:
        content_id: ID of content to get comments for
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of top-level comments with nested replies
    """
    try:
        # Get top-level comments (no parent)
        comments = db.query(Comment).filter(
            Comment.content_id == content_id,
            Comment.parent_comment_id == None,
            Comment.is_deleted == False
        ).order_by(
            Comment.created_at.asc()
        ).offset(skip).limit(limit).all()
        
        return comments
        
    except Exception as e:
        logger.error(f"Error getting comments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve comments"
        )


@router.get("/{comment_id}", response_model=CommentOut)
async def get_comment(
    comment_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific comment by ID.
    
    Args:
        comment_id: ID of comment to retrieve
        db: Database session
        
    Returns:
        Comment details
    """
    try:
        comment = db.query(Comment).filter(
            Comment.id == comment_id,
            Comment.is_deleted == False
        ).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        return comment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve comment"
        )


@router.patch("/{comment_id}", response_model=CommentOut)
async def update_comment(
    comment_id: UUID,
    comment_data: CommentUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a comment.
    
    Only the comment author or a moderator/admin can update the comment.
    
    Args:
        comment_id: ID of comment to update
        comment_data: Updated comment data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated comment
    """
    try:
        # Get comment
        comment = db.query(Comment).filter(
            Comment.id == comment_id,
            Comment.is_deleted == False
        ).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        # Check permissions (author or moderator/admin)
        user_id = UUID(current_user["user_id"])
        user_role = current_user.get("role", "user")
        
        if comment.user_id != user_id and user_role not in ["moderator", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this comment"
            )
        
        # Sanitize and update comment text
        sanitized_text = sanitize_html(comment_data.comment_text)
        comment.comment_text = sanitized_text
        
        db.commit()
        db.refresh(comment)
        
        logger.info(f"Comment updated: id={comment_id}, user={current_user['user_id']}")
        
        return comment
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update comment"
        )


@router.delete("/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(
    comment_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft delete a comment.
    
    Only the comment author or a moderator/admin can delete the comment.
    
    Args:
        comment_id: ID of comment to delete
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    try:
        # Get comment
        comment = db.query(Comment).filter(
            Comment.id == comment_id,
            Comment.is_deleted == False
        ).first()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        # Check permissions (author or moderator/admin)
        user_id = UUID(current_user["user_id"])
        user_role = current_user.get("role", "user")
        
        if comment.user_id != user_id and user_role not in ["moderator", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this comment"
            )
        
        # Soft delete
        comment.is_deleted = True
        
        db.commit()
        
        logger.info(f"Comment deleted: id={comment_id}, user={current_user['user_id']}")
        
        return {"message": "Comment deleted successfully", "comment_id": str(comment_id)}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete comment"
        )


@router.get("/user/comments")
async def get_user_comments(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all comments created by the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of user's comments
    """
    try:
        comments = db.query(Comment).filter(
            Comment.user_id == UUID(current_user["user_id"]),
            Comment.is_deleted == False
        ).order_by(
            Comment.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return comments
        
    except Exception as e:
        logger.error(f"Error getting user comments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve comments"
        )
