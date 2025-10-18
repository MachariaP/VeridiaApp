import pytest
from fastapi.testclient import TestClient
from io import BytesIO


def test_create_content_success(client: TestClient, auth_headers: dict, sample_content_data: dict):
    """Test successful content creation."""
    response = client.post(
        "/api/v1/content/",
        data=sample_content_data,
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["author_id"] == "123"
    assert data["content_url"] == sample_content_data["content_url"]
    assert data["content_text"] == sample_content_data["content_text"]
    assert data["status"] == "pending"
    assert "news" in data["tags"]
    assert "technology" in data["tags"]
    assert "ai" in data["tags"]
    assert "submission_date" in data
    assert "_id" in data


def test_create_content_with_only_url(client: TestClient, auth_headers: dict):
    """Test content creation with only URL."""
    response = client.post(
        "/api/v1/content/",
        data={"content_url": "https://example.com/news"},
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["content_url"] == "https://example.com/news"
    assert data["content_text"] is None


def test_create_content_with_only_text(client: TestClient, auth_headers: dict):
    """Test content creation with only text."""
    response = client.post(
        "/api/v1/content/",
        data={"content_text": "Just some text content"},
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["content_text"] == "Just some text content"
    assert data["content_url"] is None


def test_create_content_without_content_fails(client: TestClient, auth_headers: dict):
    """Test that content creation fails without content_url or content_text."""
    response = client.post(
        "/api/v1/content/",
        data={"tags": "test"},
        headers=auth_headers
    )
    
    assert response.status_code == 400
    detail = response.json()["detail"]
    # Support both string and dict formats
    if isinstance(detail, dict):
        assert "at least one" in detail.get("error", "").lower()
    else:
        assert "at least one" in detail.lower()


def test_create_content_without_auth_fails(client: TestClient, sample_content_data: dict):
    """Test that content creation fails without authentication."""
    response = client.post(
        "/api/v1/content/",
        data=sample_content_data
    )
    
    assert response.status_code == 401


def test_create_content_with_expired_token_fails(client: TestClient, expired_token: str, sample_content_data: dict):
    """Test that content creation fails with expired token."""
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.post(
        "/api/v1/content/",
        data=sample_content_data,
        headers=headers
    )
    
    assert response.status_code == 401


def test_create_content_with_file_upload(client: TestClient, auth_headers: dict):
    """Test content creation with file upload."""
    # Create a fake text file
    file_content = b"This is a test file content"
    files = {
        "media_file": ("test.txt", BytesIO(file_content), "text/plain")
    }
    data = {
        "content_text": "Content with file attachment"
    }
    
    response = client.post(
        "/api/v1/content/",
        data=data,
        files=files,
        headers=auth_headers
    )
    
    assert response.status_code == 201
    response_data = response.json()
    assert response_data["media_attachment"] is not None
    assert response_data["media_attachment"].startswith("/uploads/")


def test_create_content_with_invalid_file_type_fails(client: TestClient, auth_headers: dict):
    """Test that file upload fails with invalid file type."""
    # Create a fake file with invalid extension
    file_content = b"This should fail"
    files = {
        "media_file": ("test.exe", BytesIO(file_content), "application/octet-stream")
    }
    data = {
        "content_text": "Content with invalid file"
    }
    
    response = client.post(
        "/api/v1/content/",
        data=data,
        files=files,
        headers=auth_headers
    )
    
    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"].lower()


def test_create_content_with_too_many_tags_fails(client: TestClient, auth_headers: dict):
    """Test that content creation fails with too many tags."""
    # Create 21 tags (more than the limit of 20)
    tags = ",".join([f"tag{i}" for i in range(21)])
    
    response = client.post(
        "/api/v1/content/",
        data={
            "content_text": "Content with too many tags",
            "tags": tags
        },
        headers=auth_headers
    )
    
    assert response.status_code == 400
    assert "maximum 20 tags" in response.json()["detail"].lower()


def test_create_content_deduplicates_tags(client: TestClient, auth_headers: dict):
    """Test that duplicate tags are removed."""
    response = client.post(
        "/api/v1/content/",
        data={
            "content_text": "Content with duplicate tags",
            "tags": "news,tech,news,tech,ai"
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert len(data["tags"]) == 3  # Only unique tags
    assert "news" in data["tags"]
    assert "tech" in data["tags"]
    assert "ai" in data["tags"]


def test_create_content_without_tags(client: TestClient, auth_headers: dict):
    """Test content creation without tags."""
    response = client.post(
        "/api/v1/content/",
        data={"content_text": "Content without tags"},
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["tags"] == []


def test_get_content_success(client: TestClient, auth_headers: dict):
    """Test successful content retrieval."""
    # First create content
    create_response = client.post(
        "/api/v1/content/",
        data={"content_text": "Test content for retrieval"},
        headers=auth_headers
    )
    assert create_response.status_code == 201
    created_data = create_response.json()
    content_id = created_data["_id"]
    
    # Then retrieve it
    get_response = client.get(f"/api/v1/content/{content_id}")
    assert get_response.status_code == 200
    retrieved_data = get_response.json()
    
    assert retrieved_data["_id"] == content_id
    assert retrieved_data["content_text"] == "Test content for retrieval"
    assert retrieved_data["status"] == "pending"


def test_get_content_not_found(client: TestClient):
    """Test getting non-existent content returns 404."""
    # Use a valid ObjectId format but non-existent ID
    fake_id = "507f1f77bcf86cd799439011"
    response = client.get(f"/api/v1/content/{fake_id}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_content_invalid_id(client: TestClient):
    """Test getting content with invalid ID format returns 400."""
    invalid_id = "not-a-valid-objectid"
    response = client.get(f"/api/v1/content/{invalid_id}")
    assert response.status_code == 400
    detail = response.json()["detail"]
    # Support both string and dict formats
    if isinstance(detail, dict):
        assert "invalid" in detail.get("error", "").lower()
    else:
        assert "invalid" in detail.lower()
