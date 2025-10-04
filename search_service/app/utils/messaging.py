"""
RabbitMQ consumer for indexing content in Elasticsearch.
"""
import json
import os
import pika
import threading
from datetime import datetime
from app.core.elasticsearch import get_elasticsearch_client, ELASTICSEARCH_INDEX


RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")


class SearchIndexConsumer:
    """RabbitMQ consumer for content verification events to index in Elasticsearch."""
    
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
            
            # Declare queue for search indexing
            result = self.channel.queue_declare(
                queue='search_index_queue',
                durable=True
            )
            queue_name = result.method.queue
            
            # Bind to ContentCreated events (index all content initially)
            self.channel.queue_bind(
                exchange='content_events',
                queue=queue_name,
                routing_key='content.created'
            )
            
            # In production, also listen for content status updates
            # to re-index or remove from search results
            
            print(f"Connected to RabbitMQ, listening on queue: {queue_name}")
            return True
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            return False
    
    def index_content(self, content_data: dict):
        """
        Index content document in Elasticsearch.
        
        Args:
            content_data: Content data to index
        """
        try:
            es_client = get_elasticsearch_client()
            
            # Prepare document for indexing
            doc = {
                "content_id": content_data.get("content_id"),
                "title": content_data.get("title", ""),
                "description": content_data.get("description", ""),
                "source_url": content_data.get("source_url", ""),
                "category": content_data.get("category", ""),
                "status": content_data.get("status", "Pending Verification"),
                "created_by_username": content_data.get("created_by_username", ""),
                "created_at": content_data.get("created_at"),
                "indexed_at": datetime.utcnow().isoformat()
            }
            
            # Index document
            response = es_client.index(
                index=ELASTICSEARCH_INDEX,
                id=content_data.get("content_id"),
                document=doc
            )
            
            print(f"Indexed content {content_data.get('content_id')} in Elasticsearch: {response['result']}")
            return True
            
        except Exception as e:
            print(f"Error indexing content: {e}")
            return False
    
    def callback(self, ch, method, properties, body):
        """
        Callback function to process content events for indexing.
        
        Args:
            ch: Channel
            method: Delivery method
            properties: Message properties
            body: Message body
        """
        try:
            event_data = json.loads(body)
            print(f"Received content event for indexing: {event_data}")
            
            # For ContentCreated events, index the content
            if event_data.get("event_type") == "ContentCreated":
                content_id = event_data.get("content_id")
                metadata = event_data.get("metadata", {})
                
                # Prepare content data for indexing
                content_data = {
                    "content_id": content_id,
                    "title": metadata.get("title", ""),
                    "description": metadata.get("description", ""),
                    "source_url": metadata.get("source_url", ""),
                    "category": metadata.get("category", ""),
                    "status": "Pending Verification",
                    "created_at": metadata.get("created_at", ""),
                }
                
                # Index in Elasticsearch
                self.index_content(content_data)
            
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
                queue='search_index_queue',
                on_message_callback=self.callback
            )
            
            print("Started consuming messages for search indexing...")
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
        print("Search index consumer started in background thread")
    
    def stop(self):
        """Stop consuming messages."""
        self.is_running = False
        if self.channel:
            self.channel.stop_consuming()
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        print("Consumer stopped")


# Global consumer instance
_search_consumer = None


def get_search_consumer() -> SearchIndexConsumer:
    """Get or create search index consumer instance."""
    global _search_consumer
    if _search_consumer is None:
        _search_consumer = SearchIndexConsumer()
    return _search_consumer
