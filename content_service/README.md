<div align="center">

# 📝 VeridiaApp Content Service

### Content Submission & Management Microservice

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248.svg)](https://www.mongodb.com/)
[![File Upload](https://img.shields.io/badge/Upload-10MB_Max-orange.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Flexible document storage with media upload support**

</div>

---

## 📜 Table of Contents
* [📋 Project Overview](#-1-project-overview)
* [👥 Team Roles and Responsibilities](#-2-team-roles-and-responsibilities)
* [🛠️ Technology Stack Overview](#️-3-technology-stack-overview)
* [🗄️ Database Design Overview](#️-4-database-design-overview)
* [✨ Feature Breakdown](#-5-feature-breakdown)
* [🔒 API Security Overview](#-6-api-security-overview)
* [🚀 CI/CD Pipeline Overview](#-7-cicd-pipeline-overview)
* [📚 Resources](#-8-resources)
* [📄 License](#-9-license)
* [👨‍💻 Created By](#-10-created-by)

---

## 📋 1. Project Overview

**Brief Description:**

The VeridiaApp Content Service is a specialized microservice responsible for managing content submission, storage, and retrieval within the VeridiaApp verification platform. Built with FastAPI and MongoDB, this service handles user-submitted content requiring verification including text, URLs, images, and documents. The service provides flexible document storage, file upload capabilities, and integrates seamlessly with other microservices through JWT authentication. As the central repository for all verification content, it serves as the foundation for the voting, commenting, and search services.

**Project Goals:**

* **Flexible Content Storage**: Leverage MongoDB's document-oriented architecture for storing diverse content types without rigid schema constraints
* **Media Upload Support**: Enable users to submit images, documents, and text files up to 10MB for comprehensive content verification
* **High Throughput**: Handle hundreds of concurrent content submissions with async operations and efficient file processing
* **Service Integration**: Provide clean API contracts for seamless integration with voting, commenting, and search services
* **Data Integrity**: Ensure content attribution and ownership tracking through secure JWT-based author identification
* **Scalability**: Support horizontal scaling through stateless design and MongoDB's distributed architecture

**Key Tech Stack:**

* **Backend**: Python 3.11+ with FastAPI for high-performance async APIs
* **Database**: MongoDB for flexible, schema-less document storage
* **File Storage**: Local filesystem with plans for cloud storage (S3, GCS, Azure Blob Storage)
* **Security**: JWT authentication integrated with User Service
* **Testing**: pytest with async support and comprehensive test coverage

---

## 👥 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Backend Developer** | Implement content submission endpoints, file upload handling, and MongoDB integration for flexible data storage |
| **Database Administrator** | Design MongoDB collections, create performance indexes, optimize queries, and manage data retention policies |
| **Full-Stack Developer** | Integrate content submission UI with backend API, handle file uploads from frontend, and manage media display |
| **QA Engineer** | Test content submission flows, file upload edge cases, validation rules, and MongoDB document integrity |
| **DevOps Engineer** | Configure MongoDB deployment, set up file storage volumes, manage environment variables, and implement backups |
| **Security Engineer** | Implement JWT validation, file upload security, input sanitization, and prevent malicious file uploads |

---

## 🛠️ 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **Python 3.11+** | Primary programming language with excellent async support for handling concurrent file uploads and database operations |
| **FastAPI** | Modern async web framework providing automatic validation, multipart/form-data support, and OpenAPI documentation |
| **MongoDB 6+** | NoSQL document database chosen for flexible schema allowing diverse content types without migration overhead |
| **Motor** | Async MongoDB driver for Python enabling non-blocking database operations and high concurrent request throughput |
| **Pydantic** | Data validation library ensuring content submissions meet required schemas before storage in MongoDB |
| **python-multipart** | Library for handling multipart/form-data requests enabling file upload functionality through HTTP |
| **aiofiles** | Async file I/O library for non-blocking file write operations when saving uploaded media attachments |
| **python-jose** | JWT token validation library ensuring only authenticated users can submit content (shared with User Service) |
| **pytest** | Testing framework with async support for testing API endpoints and MongoDB operations |
| **httpx** | Async HTTP client for testing API endpoints and potential inter-service communication |
| **uvicorn** | ASGI server running FastAPI application with hot-reload in development and production-grade performance |
| **python-dotenv** | Environment variable management for configuration without hardcoding sensitive values |

---

## 🗄️ 4. Database Design Overview

**Key Entities:**

* **Content** - Core document storing all submitted content for verification. MongoDB document structure includes: _id (ObjectId, auto-generated), author_id (string, user ID from JWT), content_url (optional string for URL submissions), content_text (optional string for text content), media_attachment (optional string path to uploaded file), status (enum: pending/verified/disputed/false), tags (array of strings for categorization), and submission_date (ISODate timestamp). The flexible schema allows optional fields, enabling users to submit URLs, text, files, or any combination without complex validation logic.

**Relationships:**

* **User → Content (One-to-Many)**: Each content document stores the author_id extracted from the JWT token, linking it to the User in the User Service. This relationship enables content ownership tracking, permissions enforcement (users can edit/delete their own content), and user profile views showing all submitted content. The relationship is maintained through the author_id field rather than a foreign key, following microservices best practices where services don't share databases.

* **Content → Vote (One-to-Many)**: The Voting Service stores votes referencing the content's _id (converted to string for cross-service compatibility). Each content item accumulates votes from multiple users, which are aggregated to calculate verification scores and status. The Content Service's status field is updated based on voting results, creating a feedback loop where community input determines content authenticity.

* **Content → Comment (One-to-Many)**: The Comment Service references content items through content_id, enabling users to discuss and provide evidence about content authenticity. Comments are retrieved separately through the Comment Service API but are conceptually "owned" by the content item, supporting threaded discussions and moderation workflows tied to specific content submissions.

---

## ✨ 5. Feature Breakdown

* **Content Submission**: Comprehensive content submission API accepting text, URLs, or media files through multipart/form-data POST requests. Users must provide at least one of: content_url, content_text, or media_file. Validation ensures URLs are properly formatted, text doesn't exceed 10,000 characters, and combined submission size stays within limits. Author identity is automatically extracted from JWT token, ensuring accurate attribution without client-side spoofing.

* **Media File Upload**: Support for uploading images (JPG, PNG, GIF), documents (PDF), and text files (TXT) up to 10MB in size. Files are validated for type and size before processing. Each uploaded file is stored with a UUID-based filename to prevent collisions and directory traversal attacks. File paths are stored in MongoDB documents, while actual files reside in a configurable upload directory (local filesystem or cloud storage mount point).

* **Tag-Based Categorization**: Flexible tagging system allowing up to 20 tags per content submission. Tags are automatically normalized (trimmed, deduplicated) and stored as an array in MongoDB. Enables future filtering and search functionality, helping users discover related content and allowing moderators to organize submissions by category (news, science, politics, etc.).

* **JWT Authentication**: Secure authentication integrated with User Service through shared JWT secret key. All content submission endpoints require valid JWT access tokens in Authorization headers. Token validation extracts user ID and role, enabling permission checks and content ownership tracking. Expired or invalid tokens result in 401 Unauthorized responses with clear error messages.

* **MongoDB Document Storage**: All content stored as flexible JSON-like documents in MongoDB, enabling schema evolution without migrations. Documents support optional fields, nested structures, and arrays naturally. MongoDB's document model perfectly fits content submissions where structure varies (URL-only vs. text-only vs. media submissions), avoiding the complexity of nullable columns and joins in relational databases.

* **Content Status Tracking**: Each content document includes a status field (pending/verified/disputed/false) indicating verification outcome. Status starts as "pending" upon submission and is updated by the Voting Service based on community votes. The Content Service provides APIs for status updates, enabling real-time verification workflows where content authenticity is determined democratically.

* **Health Check Endpoints**: Simple health check endpoints verifying service availability and MongoDB connectivity. Used by load balancers, Kubernetes probes, and monitoring systems to detect failures and trigger automatic recovery. Checks include database connection tests ensuring the service can accept submissions without silent failures.

* **API Documentation**: Automatic interactive documentation generated by FastAPI with OpenAPI 3.0 specification. Swagger UI provides file upload testing directly in the browser, making integration testing easier for frontend developers. All request schemas, response models, and authentication requirements are clearly documented with examples.

---

## 🔒 6. API Security Overview

* **JWT Authentication**: All content submission endpoints require valid JWT access tokens issued by the User Service. Tokens are validated using the shared JWT_SECRET_KEY environment variable, ensuring only authenticated users can submit content. The author_id is extracted from validated token claims, preventing users from submitting content as someone else. Expired tokens are rejected with 401 Unauthorized, requiring users to refresh their access tokens through the User Service.

* **File Upload Security**: Strict validation of uploaded files prevents malicious uploads. File type checking uses both extension validation (.jpg, .pdf, etc.) and MIME type verification. File size is limited to 10MB (configurable) to prevent storage exhaustion attacks. Files are stored with UUID-based names, not user-provided filenames, preventing directory traversal attacks where attackers upload files like "../../../../etc/passwd". Future enhancements will include virus scanning using ClamAV or cloud provider scanning services.

* **Input Validation**: All request data validated through Pydantic schemas before processing. content_url must match URL patterns, content_text has maximum length limits, and tags are validated for count and format. Invalid inputs are rejected with detailed error messages (400 Bad Request), preventing malformed data from entering MongoDB and causing downstream issues in other services.

* **MongoDB Injection Protection**: Motor driver with Pydantic validation prevents MongoDB injection attacks. All user inputs are validated and typed before being used in queries. Unlike SQL injection, MongoDB injection typically involves injecting JavaScript or operators into queries. The service never uses raw string concatenation for queries, and all parameters are properly typed and escaped by Motor.

* **CORS Configuration**: Cross-Origin Resource Sharing configured to allow requests only from approved frontend domains. In development, localhost origins are permitted for testing. In production, only the specific frontend domain is whitelisted (e.g., https://veridiapp.com). Credentials (JWT tokens in Authorization headers) are only accepted from trusted origins, preventing unauthorized websites from accessing the API through users' browsers.

* **Secret Key Management**: The JWT_SECRET_KEY must be identical to the User Service's key for token validation to work. This shared secret is stored in environment variables, never in code or version control. Production deployments use secret management systems (AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets) to inject the key at runtime, with automatic rotation capabilities for enhanced security.

* **File Storage Permissions**: Uploaded files are stored with restrictive permissions (644 or more restrictive) preventing execution. The upload directory is separate from application code directories, preventing attackers from uploading malicious scripts and executing them. For cloud storage, presigned URLs with short expiration times will be used for file access, avoiding permanent public URL exposure.

* **Rate Limiting**: Future implementation will include rate limiting on content submission endpoints to prevent abuse. Authenticated users will be limited to 10-20 submissions per hour, while IP-based limits prevent anonymous flooding. This protects MongoDB from being overwhelmed with spam content and ensures fair resource allocation among users.

---

## 🚀 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the content service development lifecycle, ensuring all code changes are tested, validated, and deployed reliably. For the Content Service, CI/CD is essential because bugs in file upload handling could lead to data loss or security vulnerabilities, making automated testing critical before production deployment.

The Content Service uses **GitHub Actions** as the CI/CD platform, with workflows triggered on pushes to feature branches and pull requests to main. The pipeline consists of: code linting with flake8 and black for style consistency, running the complete pytest suite including file upload tests, checking code coverage (target: 80%+), security scanning with bandit for common vulnerabilities, and building Docker images to verify containerization works correctly.

**Continuous Integration (CI)** validates every code change before merge. When code is pushed, the pipeline spins up a clean Python 3.11 environment, installs dependencies from requirements.txt, starts a MongoDB container using Docker Compose services, and runs all tests with pytest. File upload tests verify multipart/form-data handling, file type validation, and error conditions (oversized files, invalid types). Coverage reports are generated and must meet thresholds. Failed tests block pull request merging, preventing broken code from reaching production.

**Continuous Deployment (CD)** automatically deploys to staging and production after merge to main. The pipeline builds a Docker image with the latest code, tags it with the git commit SHA and "latest" for production, pushes to container registry (AWS ECR, Docker Hub, or Google Container Registry), and updates Kubernetes deployment manifests or ECS task definitions. Environment-specific configuration is injected from GitHub Secrets (development uses local filesystem for uploads, production uses S3 with proper IAM roles). MongoDB connection strings and JWT secret keys are securely injected at runtime.

The entire pipeline completes in 4-6 minutes, enabling rapid iteration. Deployment includes smoke tests verifying the service can submit and retrieve content in the target environment. Failed deployments automatically rollback to the previous stable version, and alerts are sent to the development team via Slack or email for immediate investigation.

---

## 📚 8. Resources

* [FastAPI Documentation](https://fastapi.tiangolo.com/) - Web framework with automatic validation and documentation
* [MongoDB Documentation](https://docs.mongodb.com/) - NoSQL database for flexible document storage
* [Motor Documentation](https://motor.readthedocs.io/) - Async Python driver for MongoDB
* [Pydantic Documentation](https://docs.pydantic.dev/) - Data validation using Python type hints
* [Multipart Form Data Specification](https://www.rfc-editor.org/rfc/rfc7578) - Standard for file uploads over HTTP
* [JWT.io](https://jwt.io/) - JSON Web Token debugger and documentation

---

## 📄 9. License

This project is licensed under the **MIT License**.

---

## 👨‍💻 10. Created By

<div align="center">

**Phinehas Macharia**

[![GitHub](https://img.shields.io/badge/GitHub-MachariaP-181717?style=for-the-badge&logo=github)](https://github.com/MachariaP)

*Content management for VeridiaApp ecosystem*

</div>
