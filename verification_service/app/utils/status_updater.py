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
    
    Args:
        verified_votes: Number of verified votes
        disputed_votes: Number of disputed votes
        total_votes: Total number of votes
    
    Returns:
        Status string: "Verified", "Disputed", or "Pending Verification"
    """
    if total_votes < 5:
        return "Pending Community Verification"
    
    verification_percentage = (verified_votes / total_votes) * 100
    
    if verification_percentage >= 70:
        return "Verified"
    elif verification_percentage <= 30:
        return "Disputed"
    else:
        return "Under Review"
