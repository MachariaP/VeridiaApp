"""
Content repository for MongoDB operations.
"""
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from pymongo.database import Database


class ContentRepository:
    """Repository pattern for content CRUD operations."""
    
    def __init__(self, db: Database):
        self.collection = db.content
    
    def create_content(
        self,
        title: str,
        source_url: str,
        description: str,
        category: str,
        user_id: Optional[int] = None,
        username: Optional[str] = None
    ) -> dict:
        """Create a new content document."""
        now = datetime.utcnow()
        content_doc = {
            "title": title,
            "source_url": source_url,
            "description": description,
            "category": category,
            "status": "Pending Verification",
            "created_by_user_id": user_id,
            "created_by_username": username,
            "created_at": now,
            "updated_at": now,
        }
        result = self.collection.insert_one(content_doc)
        content_doc["_id"] = result.inserted_id
        return content_doc
    
    def get_content_by_id(self, content_id: str) -> Optional[dict]:
        """Get content by ID."""
        try:
            return self.collection.find_one({"_id": ObjectId(content_id)})
        except:
            return None
    
    def get_user_content(self, user_id: int, skip: int = 0, limit: int = 10) -> List[dict]:
        """Get all content created by a specific user."""
        cursor = self.collection.find(
            {"created_by_user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        return list(cursor)
    
    def get_all_content(self, skip: int = 0, limit: int = 10) -> List[dict]:
        """Get all content with pagination."""
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        return list(cursor)
    
    def update_content_status(self, content_id: str, status: str, trigger: Optional[str] = None) -> bool:
        """
        Update content verification status with versioning.
        Creates a snapshot in version history for transparency.
        
        Args:
            content_id: Content ID to update
            status: New verification status
            trigger: What triggered the status change (e.g., "Community Consensus")
        """
        try:
            # Get current content for versioning
            current_content = self.get_content_by_id(content_id)
            if not current_content:
                return False
            
            # Create version snapshot
            version_entry = {
                "status": current_content.get("status", "Unknown"),
                "timestamp": datetime.utcnow(),
                "trigger": trigger or "Status Update"
            }
            
            result = self.collection.update_one(
                {"_id": ObjectId(content_id)},
                {
                    "$set": {
                        "status": status,
                        "updated_at": datetime.utcnow()
                    },
                    "$push": {
                        "status_history": version_entry
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating content status: {e}")
            return False
    
    def create_content_version(self, content_id: str, updated_by_user_id: int, 
                              updated_by_username: str, changes: dict) -> bool:
        """
        Create a version snapshot when content is edited.
        Enables reverting changes and provides transparency.
        
        Args:
            content_id: Content ID
            updated_by_user_id: User who made the edit
            updated_by_username: Username who made the edit
            changes: Dictionary of changes made
        """
        try:
            version_entry = {
                "timestamp": datetime.utcnow(),
                "updated_by_user_id": updated_by_user_id,
                "updated_by_username": updated_by_username,
                "changes": changes
            }
            
            result = self.collection.update_one(
                {"_id": ObjectId(content_id)},
                {
                    "$push": {
                        "edit_history": version_entry
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error creating content version: {e}")
            return False
    
    def delete_content(self, content_id: str) -> bool:
        """Delete content by ID."""
        try:
            result = self.collection.delete_one({"_id": ObjectId(content_id)})
            return result.deleted_count > 0
        except:
            return False


def serialize_content(content_doc: dict) -> dict:
    """Convert MongoDB document to serializable dict."""
    if content_doc and "_id" in content_doc:
        content_doc["id"] = str(content_doc["_id"])
        del content_doc["_id"]
    return content_doc
