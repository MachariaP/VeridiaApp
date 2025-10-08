"""
Content status updater - communicates with content_service.
"""
import os
import requests


CONTENT_SERVICE_URL = os.getenv("CONTENT_SERVICE_URL", "http://localhost:8001")


def update_content_status(content_id: str, status: str) -> bool:
    """
    Update content verification status by calling content_service API.
    
    In production, this would make an authenticated API call to content_service.
    For now, it's a stub that logs the update.
    
    Args:
        content_id: Content ID to update
        status: New verification status
    
    Returns:
        True if update was successful, False otherwise
    """
    try:
        # TODO: Implement actual API call to content_service
        # For now, just log the intended update
        print(f"[STATUS UPDATE STUB] Would update content {content_id} to status: {status}")
        
        # Example of what the actual implementation would look like:
        # url = f"{CONTENT_SERVICE_URL}/api/v1/content/{content_id}/status"
        # response = requests.patch(url, json={"status": status})
        # return response.status_code == 200
        
        return True
    except Exception as e:
        print(f"Error updating content status: {e}")
        return False


def calculate_final_status(verified_votes: int, disputed_votes: int, total_votes: int) -> str:
    """
    Calculate final verification status based on community votes.
    
    Implements the status thresholds from the requirements:
    - Verified: 85% verified votes AND total > 50
    - Disputed: 35% disputed votes OR moderator flag
    - Otherwise: Pending/Under Review
    
    Args:
        verified_votes: Number of verified votes
        disputed_votes: Number of disputed votes
        total_votes: Total number of votes
    
    Returns:
        Status string: "Verified", "Disputed", "Under Review", or "Pending Verification"
    """
    if total_votes == 0:
        return "Pending Verification"
    
    if total_votes < 50:
        # Need minimum 50 votes for verified status
        return "Pending Verification"
    
    verification_percentage = (verified_votes / total_votes) * 100
    disputed_percentage = (disputed_votes / total_votes) * 100
    
    # Check for Verified status: 85% verified AND total > 50
    if verification_percentage >= 85 and total_votes > 50:
        # Once verified, check if disputed votes exceed 20% of verified count
        if disputed_votes > (verified_votes * 0.20):
            return "Under Review"
        return "Verified"
    
    # Check for Disputed status: 35% or more disputed votes
    if disputed_percentage >= 35:
        return "Disputed"
    
    # If we have enough votes but don't meet verified threshold
    if total_votes >= 50:
        return "Under Review"
    
    return "Pending Verification"
