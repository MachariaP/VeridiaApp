<div align="center">

# 🔐 VeridiaApp User Service

### Secure Authentication & Authorization Microservice

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192.svg)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Production-ready authentication service with JWT tokens and RBAC**

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

The VeridiaApp User Service is a high-performance, production-ready microservice responsible for user authentication, authorization, and account management within the VeridiaApp ecosystem. Built with FastAPI and PostgreSQL, this service provides secure JWT-based authentication with refresh token rotation, role-based access control (RBAC), and comprehensive user management capabilities. The service acts as the central authentication authority for all other microservices in the platform, ensuring consistent security policies across the entire application.

**Project Goals:**

* **Secure Authentication**: Implement industry-standard JWT authentication with access and refresh tokens, ensuring stateless scalability
* **Role-Based Access Control**: Provide flexible RBAC system supporting user, moderator, and admin roles for fine-grained permissions
* **High Performance**: Achieve sub-100ms response times for authentication operations through optimized database queries and connection pooling
* **Production Readiness**: Maintain 80%+ test coverage with comprehensive unit and integration tests
* **Data Security**: Implement bcrypt password hashing, SQL injection protection, and secure secret management
* **Developer Experience**: Provide automatic OpenAPI documentation and clear API contracts for easy integration

**Key Tech Stack:**

* **Backend**: Python 3.11+ with FastAPI for high-performance asynchronous APIs
* **Database**: PostgreSQL 14+ with SQLAlchemy ORM for relational data management
* **Security**: JWT tokens with python-jose, Passlib with bcrypt for password hashing
* **Testing**: pytest with async support and coverage reporting
* **Migrations**: Alembic for database schema version control

---

## 👥 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Backend Developer** | Implement authentication endpoints, user management APIs, and business logic for user operations |
| **Security Engineer** | Design and implement JWT token strategy, password hashing, RBAC system, and security best practices |
| **Database Administrator** | Design user database schema, optimize queries, manage migrations with Alembic, and ensure data integrity |
| **QA Engineer** | Develop comprehensive test suite covering authentication flows, authorization checks, and edge cases |
| **DevOps Engineer** | Configure Docker containerization, environment variables, database connection management, and deployment automation |
| **API Designer** | Define OpenAPI specifications, design RESTful endpoints, and ensure consistent API contracts across services |

---

## 🛠️ 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **Python 3.11+** | Primary programming language chosen for performance, async/await support, and extensive security libraries |
| **FastAPI** | Modern async web framework providing automatic OpenAPI docs, Pydantic validation, and high performance (comparable to Node.js) |
| **PostgreSQL 14+** | Production-grade relational database for user data storage with ACID compliance and excellent performance |
| **SQLAlchemy 2.0** | Python ORM providing database abstraction, relationship management, and protection against SQL injection |
| **Alembic** | Database migration tool for version-controlled schema changes and safe production deployments |
| **Pydantic** | Data validation library ensuring type safety and automatic request/response validation at runtime |
| **Passlib with Bcrypt** | Password hashing library using bcrypt algorithm with automatic salt generation for maximum security |
| **python-jose** | JWT token creation and validation library supporting multiple algorithms including HS256 and RS256 |
| **pytest** | Testing framework with fixtures, async support, and parametrization for comprehensive test coverage |
| **pytest-cov** | Code coverage reporting tool ensuring quality standards are met (target: 80%+ coverage) |
| **httpx** | Async HTTP client for testing API endpoints and inter-service communication |
| **uvicorn** | ASGI server running FastAPI with hot-reload support for development and production deployment |
| **python-dotenv** | Environment variable management for secure configuration without hardcoding secrets |

---

## 🗄️ 4. Database Design Overview

**Key Entities:**

* **User** - Core entity storing all user account information including authentication credentials, profile data, and role assignments. Fields include: id (primary key), email (unique, indexed), hashed_password (bcrypt), first_name, last_name, role (enum: user/moderator/admin), is_active (boolean flag), and created_at (timestamp). The email field serves as the unique identifier for login, while the hashed_password is stored using bcrypt with automatic salting for security.

**Relationships:**

* **User → Content (One-to-Many)**: Each user can submit multiple content items for verification. This relationship is maintained through the author_id field in the Content service, linking back to the User.id. The relationship enables tracking content ownership, enforcing permissions (users can edit/delete their own content), and supporting user profile views showing all submitted content.

* **User → Vote (One-to-Many)**: A single user can cast votes on multiple content items across the platform. The relationship is enforced through the user_id foreign key in the Vote service. A unique constraint (user_id, content_id) at the database level ensures each user can only vote once per content item, preventing vote manipulation while maintaining a complete voting history for reputation systems.

* **User → Comment (One-to-Many)**: Users can create multiple comments across different content items. The user_id field in the Comment service establishes this relationship, enabling comment attribution, moderation based on user roles, and tracking of user engagement. This relationship supports features like "view all comments by user" and enforces permissions for comment editing and deletion.

---

## ✨ 5. Feature Breakdown

* **User Registration**: Complete registration flow with email validation, password strength requirements, and duplicate email detection. Validates email format using email-validator library, enforces minimum password length, and automatically hashes passwords with bcrypt before storage. Returns detailed error messages for validation failures to guide users through the registration process.

* **JWT Authentication**: Stateless authentication system using JSON Web Tokens with dual-token strategy. Access tokens expire after 15 minutes to minimize exposure risk, while refresh tokens last 7 days for user convenience. Tokens include user ID, role, and expiration claims, enabling efficient authorization without database lookups. Supports OAuth2 password flow for compatibility with standard OAuth2 clients.

* **Token Refresh**: Secure token refresh mechanism implementing token rotation for enhanced security. When a refresh token is used, both a new access token and new refresh token are issued, and the old refresh token is invalidated. This prevents token theft scenarios where an attacker uses a stolen refresh token, as the legitimate user's next refresh would fail, alerting them to the compromise.

* **Role-Based Access Control (RBAC)**: Flexible permission system with three built-in roles - User (standard access), Moderator (content management powers), and Admin (full system access). Roles are stored with each user and included in JWT claims for efficient authorization. Endpoints can require specific roles using dependency injection, automatically returning 403 Forbidden for unauthorized access attempts.

* **User Profile Management**: Retrieve authenticated user information including email, name, role, account creation date, and active status. Protected endpoint requiring valid JWT, automatically extracting user identity from token claims. Supports profile updates and account deactivation (soft delete) while maintaining referential integrity with user-created content.

* **Password Security**: Military-grade password protection using bcrypt hashing algorithm with configurable work factor (cost rounds). Each password is automatically salted with a unique random salt before hashing, preventing rainbow table attacks. Password verification uses constant-time comparison to prevent timing attacks that could leak information about password correctness.

* **Database Migrations**: Version-controlled schema management using Alembic, enabling safe database evolution without downtime. Migrations are automatically generated from SQLAlchemy model changes and can be applied incrementally or rolled back if issues arise. Supports multiple environments (development, staging, production) with different database configurations.

* **API Documentation**: Automatic interactive API documentation generated from FastAPI with OpenAPI 3.0 specification. Swagger UI provides a user-friendly interface for testing endpoints directly in the browser, while ReDoc offers clean, professional documentation for API consumers. All request/response schemas are automatically documented with examples and validation rules.

* **Health Checks**: Simple health check endpoints for monitoring service availability and database connectivity. Used by load balancers, orchestration platforms (Kubernetes), and monitoring systems to detect service degradation and trigger alerts or automatic recovery procedures.

* **Comprehensive Testing**: Complete test suite with 22+ tests covering authentication flows, authorization checks, token validation, password hashing, database operations, and error handling. Tests use fixtures for database setup/teardown, ensuring isolation between test cases. Includes positive tests (happy path) and negative tests (error conditions) for robust quality assurance.

---

## 🔒 6. API Security Overview

* **JWT Authentication**: Stateless token-based authentication using JSON Web Tokens signed with HS256 algorithm and a secret key. Access tokens expire after 15 minutes, minimizing the window of opportunity if a token is compromised. Refresh tokens last 7 days and are used exclusively for obtaining new access tokens, never for direct API access. Token claims include user ID, role, token type, and expiration timestamp, providing all necessary information for authorization without database lookups.

* **Role-Based Access Control (RBAC)**: Three-tier permission system enforced at both the endpoint and resource levels. User role (user/moderator/admin) is embedded in JWT claims and validated on each request. Protected endpoints use dependency injection to require specific roles, automatically rejecting unauthorized requests with 403 Forbidden. This prevents privilege escalation attacks where a standard user attempts to access administrative functions.

* **Password Hashing with Bcrypt**: Passwords are never stored in plain text or using weak hashing algorithms. Bcrypt hashing function with automatic salting ensures that even if the database is compromised, passwords cannot be recovered. The work factor (cost parameter) can be increased over time to maintain security as computing power increases, without requiring users to reset passwords.

* **Input Validation**: All API inputs are validated using Pydantic models before processing. Email addresses must match valid format patterns, passwords must meet minimum length requirements, and all string fields have maximum length limits to prevent buffer overflow attacks. Invalid inputs are rejected with detailed error messages (in development) or generic messages (in production) to avoid information leakage.

* **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries ensures that user inputs are never directly concatenated into SQL statements. All database operations use bound parameters, making SQL injection attacks impossible even if malicious input bypasses validation layers.

* **CORS Configuration**: Cross-Origin Resource Sharing (CORS) is configured to allow requests only from approved frontend domains. In development, localhost origins are permitted for testing. In production, only the specific frontend domain is whitelisted, preventing unauthorized websites from accessing the API. Credentials (cookies, authorization headers) are only accepted from trusted origins.

* **Secret Key Management**: All sensitive configuration values (database passwords, JWT secret keys) are stored in environment variables, never hardcoded in source files. This follows the Twelve-Factor App methodology and prevents accidental exposure through version control. Production deployments use secret management systems like AWS Secrets Manager or HashiCorp Vault for additional security layers.

* **HTTPS Enforcement**: In production, all API communication must occur over HTTPS with TLS 1.3. HTTP requests are automatically redirected to HTTPS, and security headers (HSTS) instruct browsers to only use secure connections. This prevents man-in-the-middle attacks where attackers intercept credentials or tokens during transmission.

* **Rate Limiting**: Protection against brute force attacks and API abuse through request rate limiting (to be implemented). Authentication endpoints will have strict limits (e.g., 5 login attempts per minute per IP) to prevent credential stuffing attacks, while general API endpoints will have higher limits based on user tier (authenticated users get higher limits than anonymous requests).

---

## 🚀 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the software development lifecycle, ensuring that code changes are automatically tested, validated, and deployed without manual intervention. For the User Service, CI/CD is critical because authentication bugs or security vulnerabilities could compromise the entire platform, making automated quality checks essential before deployment.

The User Service uses **GitHub Actions** as the CI/CD platform, triggered automatically on every push to feature branches and pull requests to the main branch. The pipeline consists of multiple stages: linting with flake8 and black to enforce code style consistency, running the complete test suite with pytest to verify all authentication flows work correctly, generating code coverage reports to ensure 80%+ coverage is maintained, and performing security scanning with tools like bandit to detect common vulnerabilities.

**Continuous Integration (CI)** validates every code change before it can be merged. When a developer pushes code or opens a pull request, the pipeline automatically spins up a clean environment with Python 3.11, installs all dependencies from requirements.txt, sets up a test PostgreSQL database, runs database migrations with Alembic, and executes the full test suite. If any test fails, the pull request is blocked from merging, preventing broken code from reaching production. Code coverage reports are posted as comments on pull requests, giving reviewers visibility into test quality.

**Continuous Deployment (CD)** automatically deploys code to staging and production environments after merge to main branch. The pipeline builds a Docker image with the latest code, tags it with the git commit SHA for traceability, pushes it to a container registry (AWS ECR or Docker Hub), and updates the deployment configuration in Kubernetes or ECS. Staging deployment happens immediately for smoke testing, while production deployment may require manual approval for additional safety. Database migrations run automatically before container restart, with rollback capability if migration fails. Environment-specific secrets are injected at runtime from GitHub Secrets or AWS Secrets Manager, ensuring production credentials never appear in code or logs.

The entire pipeline from code commit to production deployment typically completes in 5-8 minutes for the User Service, enabling multiple deployments per day with confidence. Failed deployments trigger automatic rollback to the previous stable version and send alerts to the development team via Slack or email.

---

## 📚 8. Resources

* [FastAPI Documentation](https://fastapi.tiangolo.com/) - Official guide for building APIs with FastAPI
* [SQLAlchemy Documentation](https://docs.sqlalchemy.org/) - ORM and database toolkit for Python
* [Alembic Documentation](https://alembic.sqlalchemy.org/) - Database migration tool for SQLAlchemy
* [Pydantic Documentation](https://docs.pydantic.dev/) - Data validation using Python type annotations
* [JWT.io](https://jwt.io/) - JSON Web Token debugger and reference implementation
* [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) - Security best practices for authentication
* [pytest Documentation](https://docs.pytest.org/) - Python testing framework guide

---

## 📄 9. License

This project is licensed under the **MIT License**.

---

## 👨‍💻 10. Created By

<div align="center">

**Phinehas Macharia**

[![GitHub](https://img.shields.io/badge/GitHub-MachariaP-181717?style=for-the-badge&logo=github)](https://github.com/MachariaP)

*Secure authentication for VeridiaApp ecosystem*

</div>
