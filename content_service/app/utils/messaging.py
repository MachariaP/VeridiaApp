"""
RabbitMQ event publishing utilities.
"""
import json
import os
import pika
from typing import Dict, Any


RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")


class EventPublisher:
    """RabbitMQ event publisher for inter-service communication."""
    
    def __init__(self):
        self.rabbitmq_url = RABBITMQ_URL
        self.connection = None
        self.channel = None
    
    def connect(self):
        """Establish connection to RabbitMQ."""
        try:
            parameters = pika.URLParameters(self.rabbitmq_url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare exchange for content events
            self.channel.exchange_declare(
                exchange='content_events',
                exchange_type='topic',
                durable=True
            )
            return True
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            return False
    
    def publish_content_created(self, content_id: str, user_id: int, metadata: Dict[str, Any]):
        """
        Publish ContentCreated event to RabbitMQ.
        
        Args:
            content_id: ID of the created content
            user_id: ID of the user who created the content
            metadata: Additional content metadata (title, category, etc.)
        """
        if not self.channel:
            if not self.connect():
                print("Cannot publish event: RabbitMQ connection failed")
                return False
        
        event_data = {
            "event_type": "ContentCreated",
            "content_id": content_id,
            "user_id": user_id,
            "metadata": metadata,
            "timestamp": metadata.get("created_at", "")
        }
        
        try:
            self.channel.basic_publish(
                exchange='content_events',
                routing_key='content.created',
                body=json.dumps(event_data, default=str),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )
            print(f"Published ContentCreated event for content_id: {content_id}")
            return True
        except Exception as e:
            print(f"Failed to publish event: {e}")
            return False
    
    def close(self):
        """Close RabbitMQ connection."""
        if self.connection and not self.connection.is_closed:
            self.connection.close()


# Global event publisher instance
_event_publisher = None


def get_event_publisher() -> EventPublisher:
    """Get or create event publisher instance."""
    global _event_publisher
    if _event_publisher is None:
        _event_publisher = EventPublisher()
    return _event_publisher
