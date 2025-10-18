# VeridiaApp Comment Service

## 📜 Table of Contents
* [Project Overview](#1-project-overview)
* [Team Roles and Responsibilities](#2-team-roles-and-responsibilities)
* [Technology Stack Overview](#3-technology-stack-overview)
* [Database Design Overview](#4-database-design-overview)
* [Feature Breakdown](#5-feature-breakdown)
* [API Security Overview](#6-api-security-overview)
* [CI/CD Pipeline Overview](#7-cicd-pipeline-overview)
* [Resources](#8-resources)
* [License](#9-license)
* [Created By](#10-created-by)

---

## 1. Project Overview

**Brief Description:**

The VeridiaApp Comment Service is a specialized microservice enabling threaded discussions and community engagement around content submissions. Built with FastAPI and PostgreSQL, this service provides robust commenting functionality with nested reply support, XSS protection, and role-based moderation capabilities. Users can discuss content authenticity, provide supporting evidence, and engage in constructive debate through a hierarchical comment structure. The service integrates seamlessly with the User Service for authentication and the Content Service for linking discussions to specific content items.

**Project Goals:**

* **Threaded Discussions**: Support nested comment replies creating rich conversation threads around content verification
* **Security First**: Implement HTML sanitization preventing XSS attacks while allowing safe formatting (bold, links, code blocks)
* **Moderation Tools**: Provide role-based permissions enabling comment authors and moderators to edit or delete inappropriate content
* **Soft Deletion**: Use soft delete pattern preserving comment history and thread structure while removing inappropriate content
* **High Performance**: Optimize query performance with strategic indexing on user_id, content_id, and parent_comment_id
* **Community Engagement**: Enable transparent discussions where users can share evidence and reasoning about content authenticity

**Key Tech Stack:**

* **Backend**: Python 3.11+ with FastAPI for high-performance async API
* **Database**: PostgreSQL 14+ with UUID primary keys and foreign key constraints
* **ORM**: SQLAlchemy with relationship management for nested comment loading
* **Security**: Bleach library for HTML sanitization and XSS protection
* **Authentication**: JWT integration with User Service for secure access control

---

## 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Backend Developer** | Implement comment CRUD endpoints, nested reply logic, and query optimization for threaded discussions |
| **Database Administrator** | Design comment schema with self-referential foreign keys, create indexes, and optimize recursive queries for thread loading |
| **Security Engineer** | Implement HTML sanitization, XSS protection, permission checks, and ensure comment moderation prevents abuse |
| **QA Engineer** | Test comment threading, HTML sanitization edge cases, permission enforcement, and soft deletion behavior |
| **DevOps Engineer** | Configure PostgreSQL deployment, manage database migrations, set up monitoring for query performance |
| **Community Manager** | Define moderation policies, test moderation tools, and ensure comment features support healthy discussions |

---

## 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **Python 3.11+** | Primary programming language with excellent async support for handling concurrent comment operations |
| **FastAPI** | Modern async web framework providing automatic validation, OpenAPI documentation, and high performance |
| **PostgreSQL 14+** | Relational database chosen for strong foreign key support, ACID compliance, and efficient recursive queries for comment threads |
| **SQLAlchemy 2.0** | Python ORM enabling relationship management, self-referential foreign keys, and protection against SQL injection |
| **Alembic** | Database migration tool for version-controlled schema changes and safe production deployments |
| **UUID** | Universally unique identifiers for comment IDs ensuring global uniqueness across distributed systems |
| **Bleach** | HTML sanitization library preventing XSS attacks by cleaning user-submitted HTML to safe subset |
| **Pydantic** | Data validation ensuring comment text length limits, required fields, and proper UUID formats |
| **python-jose** | JWT token validation for authenticating comment authors and extracting user identities |
| **pytest** | Testing framework with async support for comprehensive comment API and business logic testing |
| **httpx** | Async HTTP client for testing API endpoints and simulating multi-user comment scenarios |
| **uvicorn** | ASGI server running FastAPI with production-grade performance and hot-reload in development |
| **python-dotenv** | Environment variable management for secure configuration of database URLs and JWT secrets |

---

## 4. Database Design Overview

**Key Entities:**

* **Comment** - Core entity storing all user comments and discussion threads. Fields include: id (UUID primary key), user_id (UUID of comment author), content_id (UUID of content being discussed), parent_comment_id (optional UUID for nested replies creating threaded structure), comment_text (TEXT for flexible length comments), is_deleted (boolean for soft deletion preserving thread structure), and created_at (timestamp for chronological ordering). The self-referential foreign key on parent_comment_id enables unlimited nesting depth, though UI typically limits display to 2-3 levels for readability.

**Relationships:**

* **User → Comment (One-to-Many)**: Each comment stores the user_id of its author, linking to the User in the User Service. This relationship enables comment attribution, author verification, and permission checks (users can edit their own comments). The relationship supports "view all comments by user" functionality for user profiles and helps moderators track user behavior patterns for abuse detection.

* **Content → Comment (One-to-Many)**: Comments reference specific content items through content_id, linking discussions to verification submissions. This relationship enables displaying all comments for a content item, sorted chronologically or by popularity. The indexed content_id field ensures efficient queries when loading comment threads, which is the most common access pattern (users viewing a content item want to see all discussion).

* **Comment → Comment (Self-Referential One-to-Many)**: Comments can be replies to other comments through the parent_comment_id foreign key. This creates a tree structure where top-level comments (parent_comment_id = NULL) have multiple children (replies), and those replies can have their own replies. SQLAlchemy's relationship with remote_side configuration enables automatic loading of reply chains. Soft deletion preserves thread structure even when parent comments are deleted.

---

## 5. Feature Breakdown

* **Comment Creation**: Authenticated users can post comments on any content item, providing their perspective on content authenticity. Comments require content_id (which content is being discussed) and comment_text (the actual comment). The optional parent_comment_id enables creating replies to existing comments. Author identity is extracted from JWT token, preventing spoofing. XSS sanitization runs automatically before storage, removing dangerous HTML while preserving safe formatting like bold, italics, and links.

* **Threaded Replies**: Unlimited nesting support through self-referential foreign keys enables rich discussion threads. Users reply to specific comments by providing the parent comment's ID. SQLAlchemy relationships automatically load reply chains, making it easy to construct nested comment trees for display. The database structure supports infinite depth, though frontend implementations typically limit display to 2-3 levels with "show more" functionality for deeper threads.

* **XSS Protection**: Comprehensive HTML sanitization using the Bleach library prevents cross-site scripting attacks. User-submitted HTML is cleaned to allow only safe tags (p, br, strong, em, ul, ol, li, blockquote, code, pre) and attributes (href and title on links). Dangerous elements like script tags, event handlers, and inline styles are stripped. This allows users to format comments with basic markup while preventing malicious JavaScript injection that could steal tokens or hijack sessions.

* **Soft Deletion**: Comments are never physically deleted from the database, preserving discussion thread integrity. Instead, the is_deleted flag is set to true, and comment_text is replaced with "[deleted]" when retrieved. This approach maintains thread structure so replies to deleted comments remain in context, prevents gaps in discussions that would confuse readers, and preserves content for moderation appeals and audit trails. Only comment authors and moderators/admins can soft-delete comments.

* **Role-Based Permissions**: Edit and delete operations enforce permission checks using JWT role claims. Comment authors can edit or delete their own comments at any time. Moderators and admins can edit or delete any comment for moderation purposes. Regular users cannot modify others' comments, preventing censorship and maintaining discussion integrity. Unauthorized modification attempts return 403 Forbidden with clear error messages.

* **Comment Retrieval**: Multiple query patterns supported - get all comments for a content item (most common), get a specific comment by ID, and get all comments by a user. Results are ordered chronologically by default with optional sorting by popularity (planned). The API returns full comment objects including author_id, timestamps, deletion status, and reply relationships. Nested replies are loaded efficiently using SQLAlchemy's selectin loading strategy to avoid N+1 query problems.

* **Comment Updates**: Authenticated users can edit their own comment text after posting, useful for correcting typos or adding additional context. The comment_text is updated and re-sanitized with Bleach to ensure edited content is still XSS-safe. Only comment text can be modified - author, content_id, parent_comment_id, and creation timestamp are immutable to prevent discussion manipulation. Edit history tracking (planned feature) would log all modifications for transparency.

* **Health Checks**: Service health endpoints verify API availability and PostgreSQL connectivity. Used by load balancers (AWS ALB, Kubernetes probes) to detect failures and route traffic away from unhealthy instances. Database connectivity checks ensure the service can actually execute queries, not just respond to HTTP requests. Critical for automated recovery and monitoring.

---

## 6. API Security Overview

* **JWT Authentication**: Comment creation, updates, and deletions require valid JWT access tokens from the User Service. Tokens are validated using the shared JWT_SECRET_KEY, ensuring only authenticated users can participate in discussions. The user_id claim is extracted to identify comment authors, preventing users from posting as someone else. Expired tokens are rejected with 401 Unauthorized. Anonymous users can read comments but cannot post or modify them.

* **Authorization Checks**: Write operations (update, delete) enforce permission rules based on JWT role claims. Comment authors can modify their own comments (verified by comparing JWT user_id with comment.user_id). Moderators and admins (identified by role claim in JWT) can modify any comment for moderation purposes. These checks happen at the database layer and API layer for defense in depth. Unauthorized attempts return 403 Forbidden with clear error messages explaining permission requirements.

* **XSS Protection with Bleach**: All comment text is sanitized before storage using Bleach's clean() function with strict whitelist. Allowed tags: p, br, strong, em, u, a (with href/title only), ul, ol, li, blockquote, code, pre. All other tags, attributes, and JavaScript are stripped. This prevents stored XSS attacks where malicious HTML is saved to the database and executes when other users view comments. Bleach is battle-tested and actively maintained, providing reliable protection against evolving XSS techniques.

* **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries prevents SQL injection attacks. All user inputs (comment_text, UUIDs) are bound as parameters, never concatenated into SQL strings. SQLAlchemy's query builder automatically escapes special characters and uses prepared statements. Even if validation is bypassed, the database driver prevents SQL injection at the protocol level. Regular security audits verify no raw SQL concatenation exists in the codebase.

* **Input Validation**: Pydantic schemas validate all request data before processing. content_id and parent_comment_id must be valid UUIDs, comment_text has maximum length limits (10,000 characters) to prevent storage abuse, and all required fields are enforced. Invalid UUIDs, oversized text, or missing required fields result in 422 Unprocessable Entity responses with detailed error messages guiding clients to fix requests.

* **CORS Configuration**: Cross-Origin Resource Sharing configured to allow requests from approved frontend domains only. In development, localhost origins are permitted for testing. Production whitelists only the specific frontend domain (e.g., https://veridiapp.com). Credentials (JWT in Authorization headers) are only accepted from trusted origins, preventing malicious websites from making authenticated requests through users' browsers.

* **Database-Level Constraints**: Foreign key constraints ensure comment integrity - user_id, content_id, and parent_comment_id reference valid entities (enforced at application level since services use separate databases). UUID uniqueness is guaranteed by the database. Indexes on frequently-queried fields (user_id, content_id) prevent performance degradation under load, ensuring consistent response times even with millions of comments.

* **Rate Limiting**: Future implementation will protect against comment spam and API abuse. Authenticated users will be limited to reasonable comment rates (e.g., 10 comments per minute), preventing automated spam bots while allowing legitimate discussion. IP-based limits will protect against anonymous flooding attempts. Rate limit information will be returned in response headers (X-RateLimit-Limit, X-RateLimit-Remaining) to help clients avoid throttling.

---

## 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the Comment Service development lifecycle, ensuring code quality, preventing regressions, and enabling rapid feature delivery. For the Comment Service, CI/CD is critical because bugs in nested comment handling or XSS sanitization could break discussion threads or create security vulnerabilities, making automated testing essential.

The Comment Service uses **GitHub Actions** as the CI/CD platform, with workflows triggered automatically on pushes to feature branches and pull requests to main. The pipeline includes: code linting with flake8 and black for style consistency, running pytest test suite covering comment CRUD operations and nested threading, XSS sanitization tests verifying Bleach configuration, code coverage reporting (target: 80%+), security scanning with bandit detecting common vulnerabilities, and Docker image building to verify containerization.

**Continuous Integration (CI)** validates every code change before merge. When code is pushed, the pipeline provisions a clean Python 3.11 environment, installs dependencies from requirements.txt, starts a PostgreSQL 14 container using Docker Compose, runs Alembic migrations to set up the database schema, and executes the complete pytest suite. Tests verify comment creation, nested replies, soft deletion, XSS protection, permission checks, and error handling. Failed tests automatically block pull request merging, preventing broken code from reaching main branch.

**Continuous Deployment (CD)** automatically deploys to staging and production after merge to main. The pipeline builds a Docker image with the latest code, tags it with git commit SHA for traceability, pushes to container registry (AWS ECR, Docker Hub, Google Container Registry), and updates deployment configuration (Kubernetes, ECS, Docker Compose). Database migrations run automatically before service restart with rollback capability on failure. Environment-specific configuration (database URLs, JWT secrets) is injected from GitHub Secrets or cloud provider secret management. Staging deployment happens immediately for smoke testing; production may require manual approval for additional safety.

The entire pipeline from commit to production deployment typically completes in 5-7 minutes, enabling multiple deployments per day. Failed deployments trigger automatic rollback to previous stable version, and alerts are sent to the development team via Slack or email. Monitoring dashboards track deployment success rates, helping identify and fix problematic changes quickly.

---

## 8. Resources

* [FastAPI Documentation](https://fastapi.tiangolo.com/) - Modern Python web framework
* [SQLAlchemy Documentation](https://docs.sqlalchemy.org/) - Python ORM for database operations
* [Alembic Documentation](https://alembic.sqlalchemy.org/) - Database migration tool
* [Bleach Documentation](https://bleach.readthedocs.io/) - HTML sanitization library for XSS protection
* [PostgreSQL UUID Documentation](https://www.postgresql.org/docs/current/datatype-uuid.html) - UUID data type guide
* [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) - XSS protection best practices

---

## 9. License

This project is licensed under the **MIT License**.

---

## 10. Created By

**Phinehas Macharia**
