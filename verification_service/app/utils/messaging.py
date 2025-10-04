"""
RabbitMQ consumer for processing ContentCreated events.
"""
import json
import os
import pika
import threading
import time
from app.utils.ai_verification import perform_ai_verification
from app.utils.status_updater import update_content_status


RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")


class EventConsumer:
    """RabbitMQ consumer for ContentCreated events."""
    
    def __init__(self):
        self.rabbitmq_url = RABBITMQ_URL
        self.connection = None
        self.channel = None
        self.consumer_thread = None
        self.is_running = False
    
    def connect(self):
        """Establish connection to RabbitMQ."""
        try:
            parameters = pika.URLParameters(self.rabbitmq_url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare exchange
            self.channel.exchange_declare(
                exchange='content_events',
                exchange_type='topic',
                durable=True
            )
            
            # Declare queue
            result = self.channel.queue_declare(
                queue='verification_queue',
                durable=True
            )
            queue_name = result.method.queue
            
            # Bind queue to exchange
            self.channel.queue_bind(
                exchange='content_events',
                queue=queue_name,
                routing_key='content.created'
            )
            
            print(f"Connected to RabbitMQ, listening on queue: {queue_name}")
            return True
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            return False
    
    def callback(self, ch, method, properties, body):
        """
        Callback function to process ContentCreated events.
        
        Args:
            ch: Channel
            method: Delivery method
            properties: Message properties
            body: Message body
        """
        try:
            event_data = json.loads(body)
            print(f"Received ContentCreated event: {event_data}")
            
            content_id = event_data.get("content_id")
            user_id = event_data.get("user_id")
            metadata = event_data.get("metadata", {})
            
            if content_id:
                # Perform AI verification (stub)
                ai_result = perform_ai_verification(content_id, metadata)
                print(f"AI verification result for {content_id}: {ai_result}")
                
                # Initial status based on AI verification
                initial_status = "Pending Community Verification"
                if ai_result.get("flagged", False):
                    initial_status = "Disputed"
                
                # Update content status (would call content_service API)
                update_success = update_content_status(content_id, initial_status)
                
                if update_success:
                    print(f"Updated content {content_id} status to: {initial_status}")
                else:
                    print(f"Failed to update content {content_id} status")
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            print(f"Error processing event: {e}")
            # Reject and requeue message on error
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    
    def start_consuming(self):
        """Start consuming messages from RabbitMQ."""
        if not self.channel:
            if not self.connect():
                print("Cannot start consumer: RabbitMQ connection failed")
                return False
        
        try:
            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(
                queue='verification_queue',
                on_message_callback=self.callback
            )
            
            print("Started consuming messages...")
            self.is_running = True
            self.channel.start_consuming()
            
        except Exception as e:
            print(f"Error in consumer: {e}")
            self.is_running = False
            return False
    
    def start_in_background(self):
        """Start consumer in a background thread."""
        if self.consumer_thread and self.consumer_thread.is_alive():
            print("Consumer already running")
            return
        
        self.consumer_thread = threading.Thread(target=self.start_consuming, daemon=True)
        self.consumer_thread.start()
        print("Consumer started in background thread")
    
    def stop(self):
        """Stop consuming messages."""
        self.is_running = False
        if self.channel:
            self.channel.stop_consuming()
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        print("Consumer stopped")


# Global consumer instance
_event_consumer = None


def get_event_consumer() -> EventConsumer:
    """Get or create event consumer instance."""
    global _event_consumer
    if _event_consumer is None:
        _event_consumer = EventConsumer()
    return _event_consumer
