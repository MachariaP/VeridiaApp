"""
RabbitMQ Event Publishing Module

This module provides a stub/placeholder for publishing events to RabbitMQ
as part of the microservices architecture. In production, this would use
libraries like pika or aio-pika for actual message broker integration.
"""

from typing import Dict, Any
import json
from datetime import datetime


class EventPublisher:
    """
    Stub class for publishing events to RabbitMQ message broker.
    
    This demonstrates the event-driven architecture pattern where
    microservices communicate via message queues.
    """
    
    def __init__(self, broker_url: str = "amqp://guest:guest@localhost:5672/"):
        """
        Initialize the event publisher.
        
        Args:
            broker_url: RabbitMQ connection URL
        """
        self.broker_url = broker_url
        self.connected = False
        # TODO: In production, establish actual RabbitMQ connection here
        # self.connection = pika.BlockingConnection(pika.URLParameters(broker_url))
        # self.channel = self.connection.channel()
    
    def connect(self):
        """Establish connection to RabbitMQ broker."""
        # TODO: Implement actual connection logic
        print(f"[STUB] Connecting to RabbitMQ at {self.broker_url}")
        self.connected = True
    
    def publish_event(self, event_type: str, event_data: Dict[str, Any]):
        """
        Publish an event to the message broker.
        
        Args:
            event_type: Type of event (e.g., 'UserRegistered', 'UserUpdated')
            event_data: Dictionary containing event payload
        """
        if not self.connected:
            self.connect()
        
        event = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": event_data
        }
        
        # TODO: In production, publish to actual RabbitMQ exchange
        # self.channel.basic_publish(
        #     exchange='events',
        #     routing_key=event_type,
        #     body=json.dumps(event)
        # )
        
        print(f"[STUB] Publishing event: {event_type}")
        print(f"[STUB] Event data: {json.dumps(event, indent=2)}")
    
    def publish_user_registered(self, user_id: int, username: str, email: str):
        """
        Publish a UserRegistered event.
        
        Args:
            user_id: ID of the newly registered user
            username: Username of the new user
            email: Email of the new user
        """
        event_data = {
            "user_id": user_id,
            "username": username,
            "email": email
        }
        self.publish_event("UserRegistered", event_data)
    
    def close(self):
        """Close connection to RabbitMQ broker."""
        if self.connected:
            # TODO: Close actual connection
            # self.connection.close()
            print("[STUB] Closing RabbitMQ connection")
            self.connected = False


# Global event publisher instance
event_publisher = EventPublisher()
