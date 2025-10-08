"""
Notification service stub for user alerts.
Manages in-app, email, and push notifications.
"""
from typing import Dict, Any, Optional
from datetime import datetime
import json


class NotificationService:
    """
    Stub for managing user notifications.
    In production, this would integrate with:
    - In-app notification system
    - Email service (e.g., SendGrid, AWS SES)
    - Push notification service (e.g., Firebase, OneSignal)
    """
    
    def __init__(self):
        self.enabled = True
    
    def send_notification(
        self,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        delivery: str = "in_app"
    ):
        """
        Send a notification to a user.
        
        Args:
            user_id: Target user ID
            notification_type: Type of notification (content_interaction, status_change, etc.)
            title: Notification title
            message: Notification message
            data: Additional data payload
            delivery: Delivery mechanism ("in_app", "email", "push", "all")
        """
        notification = {
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "data": data or {},
            "delivery": delivery,
            "timestamp": datetime.utcnow().isoformat(),
            "read": False
        }
        
        print(f"[NOTIFICATION STUB] Sending to user {user_id}: {title}")
        print(f"[NOTIFICATION STUB] Details: {json.dumps(notification, indent=2)}")
        
        # TODO: In production:
        # - Store in notification database
        # - Send via email if delivery includes "email"
        # - Send push notification if delivery includes "push"
        # - Broadcast via WebSocket for real-time in-app updates
    
    def notify_content_interaction(self, content_id: str, content_creator_id: int, 
                                   interaction_type: str, actor_username: str):
        """
        Notify content creator of interactions (comments, votes).
        
        Trigger: New Comment on User's Content (Verification Service)
        Delivery: In-app Toast + Badge on Navigation Icon
        """
        if interaction_type == "comment":
            title = "New Comment on Your Content"
            message = f"{actor_username} commented on your content"
        else:
            title = "New Vote on Your Content"
            message = f"{actor_username} voted on your content"
        
        self.send_notification(
            user_id=content_creator_id,
            notification_type="content_interaction",
            title=title,
            message=message,
            data={
                "content_id": content_id,
                "interaction_type": interaction_type,
                "actor": actor_username
            },
            delivery="in_app"
        )
    
    def notify_status_change(self, content_id: str, content_creator_id: int, 
                            old_status: str, new_status: str, trigger: str):
        """
        Notify content creator of status changes.
        
        Trigger: Content Status Change (Verification Service)
        Delivery: In-app Alert + Email/Push (if enabled)
        """
        title = "Content Verification Update"
        message = f"Your content status changed from '{old_status}' to '{new_status}'"
        
        self.send_notification(
            user_id=content_creator_id,
            notification_type="status_change",
            title=title,
            message=message,
            data={
                "content_id": content_id,
                "old_status": old_status,
                "new_status": new_status,
                "trigger": trigger
            },
            delivery="all"  # Send via all channels
        )
    
    def notify_reply_to_comment(self, comment_id: int, comment_author_id: int,
                               reply_author_username: str, content_id: str):
        """
        Notify user of replies to their comments.
        
        Trigger: New Reply to User's Comment (Verification Service)
        Delivery: In-app Alert only
        """
        title = "New Reply to Your Comment"
        message = f"{reply_author_username} replied to your comment"
        
        self.send_notification(
            user_id=comment_author_id,
            notification_type="comment_reply",
            title=title,
            message=message,
            data={
                "comment_id": comment_id,
                "content_id": content_id,
                "replier": reply_author_username
            },
            delivery="in_app"
        )


# Global notification service instance
notification_service = NotificationService()
