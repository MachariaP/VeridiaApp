"""
Elasticsearch configuration and connection management.
"""
from elasticsearch import Elasticsearch
import os

# Elasticsearch Configuration
ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
ELASTICSEARCH_INDEX = os.getenv("ELASTICSEARCH_INDEX", "veridiaapp_content")

# Global Elasticsearch client
_es_client = None


def get_elasticsearch_client() -> Elasticsearch:
    """
    Get Elasticsearch client instance.
    Creates connection if not already established.
    """
    global _es_client
    
    if _es_client is None:
        _es_client = Elasticsearch([ELASTICSEARCH_URL])
        
        # Create index if it doesn't exist
        if not _es_client.indices.exists(index=ELASTICSEARCH_INDEX):
            _es_client.indices.create(
                index=ELASTICSEARCH_INDEX,
                body={
                    "settings": {
                        "number_of_shards": 1,
                        "number_of_replicas": 0,
                        "analysis": {
                            "analyzer": {
                                "default": {
                                    "type": "standard"
                                }
                            }
                        }
                    },
                    "mappings": {
                        "properties": {
                            "content_id": {"type": "keyword"},
                            "title": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword"}
                                }
                            },
                            "description": {"type": "text"},
                            "source_url": {"type": "keyword"},
                            "category": {"type": "keyword"},
                            "status": {"type": "keyword"},
                            "created_by_username": {"type": "keyword"},
                            "created_at": {"type": "date"},
                            "indexed_at": {"type": "date"}
                        }
                    }
                }
            )
            print(f"Created Elasticsearch index: {ELASTICSEARCH_INDEX}")
    
    return _es_client


def close_elasticsearch():
    """Close Elasticsearch connection."""
    global _es_client
    if _es_client:
        _es_client.close()
