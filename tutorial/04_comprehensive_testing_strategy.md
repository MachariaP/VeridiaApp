# Comprehensive Testing Strategy - VeridiaApp

**Version**: 1.0  
**Last Updated**: 2024  
**Target Audience**: QA Engineers, Developers, and DevOps Engineers

---

## Overview

This guide outlines a complete testing strategy for VeridiaApp, covering **unit tests**, **integration tests**, **end-to-end (E2E) tests**, and **API testing**. The goal is to ensure code quality, prevent regressions, and maintain reliability across all services.

### Testing Pyramid

```
           ╱╲
          ╱  ╲     E2E Tests (Few)
         ╱────╲    - Full user workflows
        ╱      ╲   - UI + Backend
       ╱────────╲  
      ╱          ╲ Integration Tests (Some)
     ╱────────────╲- API endpoints
    ╱              ╲- Service interactions
   ╱────────────────╲
  ╱                  ╲ Unit Tests (Many)
 ╱────────────────────╲- Individual functions
╱______________________╲- Business logic
```

**Principle**: More unit tests (fast, isolated), fewer E2E tests (slow, brittle).

---

## Part 1: Unit Testing Strategy

### Backend Unit Tests (Python/pytest)

Unit tests verify individual functions and methods in isolation.

#### Setup pytest for Backend Services

**Install dependencies:**

```bash
# For each service
cd user_service
pip install pytest pytest-cov pytest-asyncio httpx
```

**Create `pytest.ini` in each service directory:**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
```

---

#### Example: User Service Unit Tests

**Create `user_service/tests/test_auth.py`:**

```python
"""
Unit tests for authentication logic
"""
import pytest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token
)
from datetime import timedelta

class TestPasswordHashing:
    """Test password hashing functions"""
    
    def test_password_hashing_creates_hash(self):
        """Test that password hashing returns a hash"""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert isinstance(hashed, str)
    
    def test_password_verification_succeeds_with_correct_password(self):
        """Test password verification with correct password"""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_password_verification_fails_with_wrong_password(self):
        """Test password verification with incorrect password"""
        password = "TestPassword123!"
        wrong_password = "WrongPassword456!"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_different_passwords_produce_different_hashes(self):
        """Test that same password hashed twice produces different results (salt)"""
        password = "TestPassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2

class TestTokenGeneration:
    """Test JWT token generation and verification"""
    
    def test_token_creation_returns_string(self):
        """Test that token creation returns a string"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_token_verification_succeeds_with_valid_token(self):
        """Test token verification with valid token"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        payload = verify_token(token)
        assert payload is not None
        assert payload.get("sub") == "testuser"
    
    def test_token_verification_fails_with_invalid_token(self):
        """Test token verification with invalid token"""
        invalid_token = "invalid.token.here"
        
        with pytest.raises(Exception):
            verify_token(invalid_token)
    
    def test_token_contains_expiration(self):
        """Test that token includes expiration claim"""
        data = {"sub": "testuser"}
        token = create_access_token(data, expires_delta=timedelta(minutes=30))
        
        payload = verify_token(token)
        assert "exp" in payload

class TestUserValidation:
    """Test user data validation"""
    
    def test_valid_email_format(self):
        """Test email validation with valid format"""
        from pydantic import EmailStr, ValidationError
        
        valid_emails = [
            "user@example.com",
            "test.user@domain.co.uk",
            "user+tag@example.com"
        ]
        
        for email in valid_emails:
            # Should not raise
            EmailStr.validate(email)
    
    def test_invalid_email_format_raises_error(self):
        """Test email validation with invalid format"""
        from pydantic import EmailStr, ValidationError
        
        invalid_emails = [
            "notanemail",
            "@example.com",
            "user@",
            "user space@example.com"
        ]
        
        for email in invalid_emails:
            with pytest.raises(ValidationError):
                EmailStr.validate(email)
```

**Run unit tests:**

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run tests matching pattern
pytest -k "test_password"

# Verbose output
pytest -v
```

---

#### Example: Content Service Unit Tests

**Create `content_service/tests/test_content_validation.py`:**

```python
"""
Unit tests for content validation
"""
import pytest
from pydantic import ValidationError
from app.schemas.content import ContentCreate

class TestContentValidation:
    """Test content data validation"""
    
    def test_valid_content_creation(self):
        """Test creating valid content object"""
        content_data = {
            "title": "Test Article",
            "content_type": "article",
            "body": "This is the article body with sufficient length.",
            "metadata": {
                "tags": ["test", "article"],
                "source": "https://example.com"
            }
        }
        
        content = ContentCreate(**content_data)
        assert content.title == "Test Article"
        assert content.content_type == "article"
    
    def test_missing_required_field_raises_error(self):
        """Test that missing required fields raise validation error"""
        content_data = {
            "title": "Test Article",
            # Missing content_type
            "body": "Article body"
        }
        
        with pytest.raises(ValidationError):
            ContentCreate(**content_data)
    
    def test_empty_title_raises_error(self):
        """Test that empty title is rejected"""
        content_data = {
            "title": "",  # Empty title
            "content_type": "article",
            "body": "Article body"
        }
        
        with pytest.raises(ValidationError):
            ContentCreate(**content_data)
    
    def test_invalid_content_type_raises_error(self):
        """Test that invalid content type is rejected"""
        content_data = {
            "title": "Test Article",
            "content_type": "invalid_type",  # Not in allowed types
            "body": "Article body"
        }
        
        # Assuming content_type has enum validation
        # This test depends on your schema implementation
        with pytest.raises(ValidationError):
            ContentCreate(**content_data)
    
    def test_title_length_validation(self):
        """Test title length constraints"""
        # Title too long (assuming max 200 chars)
        long_title = "A" * 201
        content_data = {
            "title": long_title,
            "content_type": "article",
            "body": "Article body"
        }
        
        with pytest.raises(ValidationError):
            ContentCreate(**content_data)

class TestContentMetadata:
    """Test content metadata validation"""
    
    def test_valid_tags_list(self):
        """Test valid tags in metadata"""
        content_data = {
            "title": "Test Article",
            "content_type": "article",
            "body": "Article body",
            "metadata": {
                "tags": ["politics", "economy", "news"]
            }
        }
        
        content = ContentCreate(**content_data)
        assert len(content.metadata["tags"]) == 3
    
    def test_empty_metadata_is_allowed(self):
        """Test that metadata is optional"""
        content_data = {
            "title": "Test Article",
            "content_type": "article",
            "body": "Article body"
            # No metadata field
        }
        
        content = ContentCreate(**content_data)
        # Should not raise error
        assert content.title == "Test Article"
```

---

### Frontend Unit Tests (Jest + React Testing Library)

**Install dependencies:**

```bash
cd frontend_app
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Create `frontend_app/jest.config.js`:**

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Create `frontend_app/jest.setup.js`:**

```javascript
import '@testing-library/jest-dom'
```

**Example: Component Unit Tests**

**Create `frontend_app/src/__tests__/Button.test.tsx`:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click Me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })
  
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
  
  it('applies custom className', () => {
    render(<Button className="custom-class">Click Me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
```

**Run frontend tests:**

```bash
npm test
```

---

## Part 2: Integration Testing Strategy

Integration tests verify that multiple components work together correctly.

### Backend Integration Tests (API Endpoints)

**Example: User Service API Integration Tests**

**Create `user_service/tests/test_api_auth.py`:**

```python
"""
Integration tests for authentication API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAuthEndpoints:
    """Test authentication API endpoints"""
    
    def test_register_new_user_succeeds(self):
        """Test user registration with valid data"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecurePassword123!"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert "password" not in data  # Password should not be returned
    
    def test_register_duplicate_username_fails(self):
        """Test that duplicate username is rejected"""
        user_data = {
            "username": "duplicateuser",
            "email": "user1@example.com",
            "password": "SecurePassword123!"
        }
        
        # First registration
        client.post("/api/v1/auth/register", json=user_data)
        
        # Duplicate registration
        user_data["email"] = "user2@example.com"  # Different email
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()
    
    def test_login_with_valid_credentials_succeeds(self):
        """Test login with correct username and password"""
        # Register user first
        user_data = {
            "username": "loginuser",
            "email": "login@example.com",
            "password": "SecurePassword123!"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        # Login
        login_data = {
            "username": "loginuser",
            "password": "SecurePassword123!"
        }
        response = client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_with_wrong_password_fails(self):
        """Test login with incorrect password"""
        # Register user first
        user_data = {
            "username": "loginuser2",
            "email": "login2@example.com",
            "password": "SecurePassword123!"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        # Login with wrong password
        login_data = {
            "username": "loginuser2",
            "password": "WrongPassword123!"
        }
        response = client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 401
    
    def test_protected_endpoint_requires_authentication(self):
        """Test that protected endpoints reject unauthenticated requests"""
        response = client.get("/api/v1/users/me")
        
        assert response.status_code == 401
    
    def test_protected_endpoint_accepts_valid_token(self):
        """Test that protected endpoints accept valid JWT token"""
        # Register and login
        user_data = {
            "username": "tokenuser",
            "email": "token@example.com",
            "password": "SecurePassword123!"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": "tokenuser", "password": "SecurePassword123!"}
        )
        token = login_response.json()["access_token"]
        
        # Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/users/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "tokenuser"

class TestUserCRUD:
    """Test user CRUD operations"""
    
    def test_get_user_profile_returns_user_data(self):
        """Test retrieving user profile"""
        # Setup: Register and login
        user_data = {
            "username": "profileuser",
            "email": "profile@example.com",
            "password": "SecurePassword123!"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": "profileuser", "password": "SecurePassword123!"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get profile
        response = client.get("/api/v1/users/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "profileuser"
        assert data["email"] == "profile@example.com"
    
    def test_update_user_profile_succeeds(self):
        """Test updating user profile"""
        # Setup: Register and login
        user_data = {
            "username": "updateuser",
            "email": "update@example.com",
            "password": "SecurePassword123!"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": "updateuser", "password": "SecurePassword123!"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Update profile
        update_data = {"email": "newemail@example.com"}
        response = client.put("/api/v1/users/me", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newemail@example.com"
```

**Run integration tests:**

```bash
# Run all integration tests
pytest tests/test_api_*.py -v

# Run with database cleanup between tests
pytest --create-db --reuse-db
```

---

### Service-to-Service Integration Tests

**Example: Testing Content Service with Verification Service**

**Create `tests/integration/test_content_verification_flow.py`:**

```python
"""
Integration test for content creation and verification workflow
"""
import pytest
import requests
from time import sleep

BASE_URL = "http://localhost"
USER_SERVICE = f"{BASE_URL}:8000"
CONTENT_SERVICE = f"{BASE_URL}:8001"
VERIFICATION_SERVICE = f"{BASE_URL}:8002"

@pytest.fixture
def authenticated_user():
    """Create and authenticate a test user"""
    # Register
    user_data = {
        "username": "integrationuser",
        "email": "integration@example.com",
        "password": "SecurePassword123!"
    }
    requests.post(f"{USER_SERVICE}/api/v1/auth/register", json=user_data)
    
    # Login
    login_response = requests.post(
        f"{USER_SERVICE}/api/v1/auth/login",
        data={"username": "integrationuser", "password": "SecurePassword123!"}
    )
    token = login_response.json()["access_token"]
    
    return {"token": token, "username": "integrationuser"}

class TestContentVerificationFlow:
    """Test end-to-end content creation and verification"""
    
    def test_create_content_and_vote(self, authenticated_user):
        """Test creating content and voting on it"""
        token = authenticated_user["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 1: Create content
        content_data = {
            "title": "Integration Test Article",
            "content_type": "article",
            "body": "This is a test article for integration testing.",
            "metadata": {"tags": ["test"]}
        }
        create_response = requests.post(
            f"{CONTENT_SERVICE}/api/v1/content",
            json=content_data,
            headers=headers
        )
        assert create_response.status_code == 200
        content_id = create_response.json()["id"]
        
        # Step 2: Vote on content
        vote_response = requests.post(
            f"{VERIFICATION_SERVICE}/api/v1/verify/{content_id}/vote",
            json={"vote": True},
            headers=headers
        )
        assert vote_response.status_code == 200
        
        # Step 3: Check vote statistics
        stats_response = requests.get(
            f"{VERIFICATION_SERVICE}/api/v1/verify/{content_id}/votes"
        )
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["upvotes"] == 1
        assert stats["downvotes"] == 0
    
    def test_create_content_and_comment(self, authenticated_user):
        """Test creating content and commenting on it"""
        token = authenticated_user["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create content
        content_data = {
            "title": "Article for Comments",
            "content_type": "article",
            "body": "Test article body.",
            "metadata": {}
        }
        create_response = requests.post(
            f"{CONTENT_SERVICE}/api/v1/content",
            json=content_data,
            headers=headers
        )
        content_id = create_response.json()["id"]
        
        # Add comment
        comment_data = {"comment": "This is a test comment"}
        comment_response = requests.post(
            f"{VERIFICATION_SERVICE}/api/v1/verify/{content_id}/comments",
            json=comment_data,
            headers=headers
        )
        assert comment_response.status_code == 200
        
        # Retrieve comments
        get_comments = requests.get(
            f"{VERIFICATION_SERVICE}/api/v1/verify/{content_id}/comments"
        )
        assert get_comments.status_code == 200
        comments = get_comments.json()
        assert len(comments) > 0
        assert comments[0]["comment"] == "This is a test comment"
```

---

## Part 3: End-to-End (E2E) Testing

E2E tests verify complete user workflows through the UI.

### Setup Playwright for E2E Tests

**Install Playwright:**

```bash
cd frontend_app
npm install --save-dev @playwright/test
npx playwright install
```

**Create `playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Example E2E Tests

**Create `frontend_app/e2e/auth.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register a new account', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to registration
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('input[name="username"]', 'e2euser');
    await page.fill('input[name="email"]', 'e2e@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, e2euser')).toBeVisible();
  });
  
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to login
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('input[name="username"]', 'e2euser');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('login fails with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});

test.describe('Content Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="username"]', 'e2euser');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('user can create new content', async ({ page }) => {
    // Navigate to content creation
    await page.click('text=Create Content');
    
    // Fill content form
    await page.fill('input[name="title"]', 'E2E Test Article');
    await page.selectOption('select[name="content_type"]', 'article');
    await page.fill('textarea[name="body"]', 'This is a test article created by E2E test.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify content was created
    await expect(page.locator('text=Content created successfully')).toBeVisible();
    await expect(page.locator('text=E2E Test Article')).toBeVisible();
  });
  
  test('user can vote on content', async ({ page }) => {
    // Navigate to content list
    await page.goto('/discover');
    
    // Click on first content item
    await page.click('.content-item:first-child');
    
    // Upvote
    await page.click('button[aria-label="Upvote"]');
    
    // Verify vote was registered
    await expect(page.locator('.vote-count')).toContainText('1');
  });
  
  test('user can comment on content', async ({ page }) => {
    await page.goto('/discover');
    await page.click('.content-item:first-child');
    
    // Add comment
    await page.fill('textarea[name="comment"]', 'This is an E2E test comment');
    await page.click('button:has-text("Post Comment")');
    
    // Verify comment appears
    await expect(page.locator('text=This is an E2E test comment')).toBeVisible();
  });
});
```

**Run E2E tests:**

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

---

## Part 4: API Testing via Documentation (Swagger/OpenAPI)

### Accessing API Documentation

Each backend service provides interactive API documentation via Swagger UI:

- **User Service**: http://localhost:8000/docs
- **Content Service**: http://localhost:8001/docs
- **Verification Service**: http://localhost:8002/docs
- **Search Service**: http://localhost:8003/docs

---

### Manual API Testing Workflow

#### Step 1: Register a User

**Endpoint**: `POST /api/v1/auth/register`

**In Swagger UI:**
1. Navigate to http://localhost:8000/docs
2. Expand `POST /api/v1/auth/register`
3. Click "Try it out"
4. Enter request body:
   ```json
   {
     "username": "apitest",
     "email": "apitest@example.com",
     "password": "SecurePassword123!"
   }
   ```
5. Click "Execute"
6. Verify response: Status 200, user data returned

---

#### Step 2: Login and Get Token

**Endpoint**: `POST /api/v1/auth/login`

1. Expand `POST /api/v1/auth/login`
2. Click "Try it out"
3. Enter credentials in form:
   - username: `apitest`
   - password: `SecurePassword123!`
4. Click "Execute"
5. Copy the `access_token` from response

---

#### Step 3: Test Protected Endpoint

**Endpoint**: `GET /api/v1/users/me`

1. Click the "Authorize" button at the top of Swagger UI
2. Enter: `Bearer YOUR_ACCESS_TOKEN_HERE`
3. Click "Authorize"
4. Expand `GET /api/v1/users/me`
5. Click "Try it out" → "Execute"
6. Verify response: Your user profile data

---

#### Step 4: Create Content

**Navigate to Content Service**: http://localhost:8001/docs

1. Authorize with the same token
2. Expand `POST /api/v1/content`
3. Enter request body:
   ```json
   {
     "title": "API Test Article",
     "content_type": "article",
     "body": "This content was created via Swagger UI",
     "metadata": {
       "tags": ["api", "test"]
     }
   }
   ```
4. Execute and copy the returned `content_id`

---

#### Step 5: Vote on Content

**Navigate to Verification Service**: http://localhost:8002/docs

1. Authorize with your token
2. Expand `POST /api/v1/verify/{content_id}/vote`
3. Enter the `content_id` from Step 4
4. Request body:
   ```json
   {
     "vote": true
   }
   ```
5. Execute

---

#### Step 6: Add Comment

1. Expand `POST /api/v1/verify/{content_id}/comments`
2. Enter the `content_id`
3. Request body:
   ```json
   {
     "comment": "Great article! Tested via API."
   }
   ```
4. Execute

---

#### Step 7: Get Vote Statistics

1. Expand `GET /api/v1/verify/{content_id}/votes`
2. Enter the `content_id`
3. Execute
4. Verify: `upvotes: 1, downvotes: 0`

---

#### Step 8: Search Content

**Navigate to Search Service**: http://localhost:8003/docs

1. Expand `GET /api/v1/search`
2. Enter query parameter: `query: API Test`
3. Execute
4. Verify: Your created content appears in results

---

### Automated API Testing with Postman

**Create Postman Collection:**

1. **Install Postman**: Download from [postman.com](https://www.postman.com/downloads/)

2. **Import OpenAPI Spec**:
   - In Postman, click "Import"
   - Enter URL: `http://localhost:8000/openapi.json`
   - Repeat for other services

3. **Create Environment**:
   - Variables:
     - `base_url`: `http://localhost:8000`
     - `token`: (will be set dynamically)

4. **Add Tests to Requests**:

**Example: Register Request Test Script**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.username).to.eql("apitest");
    pm.expect(jsonData.email).to.eql("apitest@example.com");
});
```

**Example: Login Request Test Script**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Token received", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.access_token).to.be.a('string');
    
    // Save token to environment
    pm.environment.set("token", jsonData.access_token);
});
```

5. **Run Collection**:
   - Click "Run" on the collection
   - Select requests to run
   - Click "Run VeridiaApp"

---

## Part 5: Testing Best Practices

### General Best Practices

1. **Test Isolation**: Each test should be independent
2. **Test Data**: Use factories or fixtures for test data
3. **Clear Names**: Test names should describe what they test
4. **Fast Tests**: Unit tests should run in milliseconds
5. **DRY Principle**: Use fixtures and helper functions
6. **CI Integration**: Run tests on every commit
7. **Code Coverage**: Aim for 80%+ coverage on critical paths

### Testing Checklist

**Unit Tests:**
- [ ] Test all business logic functions
- [ ] Test validation logic
- [ ] Test error handling
- [ ] Test edge cases

**Integration Tests:**
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Test error responses

**E2E Tests:**
- [ ] Test critical user journeys
- [ ] Test registration and login
- [ ] Test content creation workflow
- [ ] Test voting and commenting

**API Tests:**
- [ ] Test all CRUD operations via Swagger
- [ ] Test authentication endpoints
- [ ] Test authorization (permissions)
- [ ] Test error cases (400, 401, 404, 500)

---

## Summary

### Testing Commands Reference

**Backend (Python/pytest):**
```bash
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific file
pytest tests/test_auth.py

# With verbose output
pytest -v

# Watch mode (with pytest-watch)
ptw
```

**Frontend (Jest):**
```bash
# Run all tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

**E2E (Playwright):**
```bash
# Run all E2E tests
npx playwright test

# Headed mode
npx playwright test --headed

# Debug
npx playwright test --debug

# Report
npx playwright show-report
```

### Next Steps

Proceed to `05_api_documentation_and_design.md` to learn about API design principles and documentation.
