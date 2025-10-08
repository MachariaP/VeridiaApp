"""
Content validation utilities for ensuring data quality.
"""
from typing import Tuple
import re
from urllib.parse import urlparse


def validate_url(url: str) -> Tuple[bool, str]:
    """
    Validate and check a URL for security and reliability.
    
    Requirements from spec:
    - Must be a valid, active URL
    - Check for HTTPS (preferred)
    - Flag non-HTTPS connections
    
    Args:
        url: URL string to validate
    
    Returns:
        Tuple of (is_valid, message)
    """
    try:
        parsed = urlparse(url)
        
        # Check if URL has a scheme and netloc
        if not parsed.scheme or not parsed.netloc:
            return False, "Invalid URL format"
        
        # Check if scheme is http or https
        if parsed.scheme not in ["http", "https"]:
            return False, "URL must use HTTP or HTTPS protocol"
        
        # Warn about non-HTTPS
        if parsed.scheme != "https":
            return True, "Warning: Non-HTTPS URL detected. Content may be flagged for review."
        
        # Check for suspicious patterns (basic stub)
        suspicious_tlds = [".tk", ".ml", ".ga", ".cf", ".gq"]  # Known spam TLDs
        if any(parsed.netloc.endswith(tld) for tld in suspicious_tlds):
            return True, "Warning: URL uses a domain associated with spam. Will require additional verification."
        
        # TODO: In production:
        # - Resolve URL and check if it's accessible
        # - Check against malware domain databases
        # - Verify SSL certificate if HTTPS
        
        return True, "URL validation passed"
        
    except Exception as e:
        return False, f"URL validation error: {str(e)}"


def validate_title(title: str) -> Tuple[bool, str]:
    """
    Validate content title for length and sensationalism.
    
    Requirements from spec:
    - Max length 250 characters
    - Basic check for sensationalism/clickbait
    
    Args:
        title: Title string to validate
    
    Returns:
        Tuple of (is_valid, message)
    """
    if not title or len(title.strip()) == 0:
        return False, "Title cannot be empty"
    
    if len(title) > 250:
        return False, "Title must be 250 characters or less"
    
    # Check for excessive capitalization (clickbait indicator)
    uppercase_ratio = sum(1 for c in title if c.isupper()) / len(title)
    if uppercase_ratio > 0.5:
        return True, "Warning: Excessive capitalization detected. May be flagged for review."
    
    # Check for excessive punctuation (sensationalism indicator)
    punctuation_count = sum(1 for c in title if c in "!?")
    if punctuation_count > 3:
        return True, "Warning: Excessive punctuation detected. May be flagged for review."
    
    return True, "Title validation passed"


def validate_description(description: str) -> Tuple[bool, str]:
    """
    Validate content description for length requirements.
    
    Requirements from spec:
    - Min length 50 characters
    - Max length 5,000 characters
    
    Args:
        description: Description string to validate
    
    Returns:
        Tuple of (is_valid, message)
    """
    if not description or len(description.strip()) == 0:
        return False, "Description cannot be empty"
    
    if len(description) < 50:
        return False, "Description must be at least 50 characters"
    
    if len(description) > 5000:
        return False, "Description must be 5,000 characters or less"
    
    return True, "Description validation passed"


def validate_category(category: str, valid_categories: list) -> Tuple[bool, str]:
    """
    Validate that category is from predefined list.
    
    Args:
        category: Category string to validate
        valid_categories: List of valid category values
    
    Returns:
        Tuple of (is_valid, message)
    """
    if not category:
        return False, "Category is required"
    
    if category not in valid_categories:
        return False, f"Category must be one of: {', '.join(valid_categories)}"
    
    return True, "Category validation passed"
