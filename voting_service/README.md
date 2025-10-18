# VeridiaApp Voting Service

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

The VeridiaApp Voting Service is the democratic heart of the content verification platform, enabling community members to vote on content authenticity and collectively determine verification status. Built with FastAPI and PostgreSQL, this service implements a fair voting system where users can classify content as authentic, false, or unsure, with optional reasoning. The service employs database-level constraints preventing duplicate votes, calculates real-time verification scores through vote aggregation, and updates content status based on community consensus thresholds. This democratic approach combines wisdom of crowds with transparent accountability.

**Project Goals:**

* **Democratic Verification**: Enable community-driven content authenticity determination through fair, transparent voting mechanisms
* **Duplicate Prevention**: Enforce one-vote-per-user-per-content rule at database level using unique constraints for data integrity
* **Real-Time Aggregation**: Calculate verification scores and status instantly as votes are cast, providing immediate feedback
* **Evidence Support**: Allow voters to provide reasoning and evidence supporting their votes, enriching verification quality
* **Transparent Thresholds**: Use configurable percentage thresholds (default 70%) for verified/false status determination
* **Vote History**: Maintain complete voting records enabling reputation systems, audit trails, and vote pattern analysis

**Key Tech Stack:**

* **Backend**: Python 3.11+ with FastAPI for high-performance async voting operations
* **Database**: PostgreSQL 14+ with ACID compliance for transactional vote integrity
* **ORM**: SQLAlchemy with unique constraints preventing vote manipulation
* **Authentication**: JWT integration with User Service for secure voter identification
* **Testing**: pytest with comprehensive vote aggregation and edge case testing

---

## 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Backend Developer** | Implement voting endpoints, vote aggregation logic, status calculation algorithms, and optimize query performance |
| **Database Administrator** | Design vote schema with unique constraints, create indexes on user_id and content_id, optimize aggregation queries |
| **Algorithm Designer** | Define vote aggregation formulas, status determination thresholds, and weighting strategies for different user reputation levels |
| **QA Engineer** | Test vote counting accuracy, duplicate prevention, threshold calculations, edge cases (tie scenarios, insufficient votes) |
| **DevOps Engineer** | Configure PostgreSQL deployment, set up monitoring for vote throughput, manage database migrations |
| **Data Analyst** | Analyze voting patterns, detect voting manipulation attempts, optimize threshold values based on community behavior |

---

## 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **Python 3.11+** | Primary programming language with excellent support for mathematical operations in vote aggregation algorithms |
| **FastAPI** | Modern async web framework providing automatic validation, OpenAPI documentation, and high request throughput |
| **PostgreSQL 14+** | Relational database with ACID compliance ensuring vote integrity and supporting complex aggregation queries |
| **SQLAlchemy 2.0** | Python ORM enabling declarative models, unique constraints, and protection against SQL injection in vote queries |
| **Alembic** | Database migration tool for version-controlled schema changes and safe production deployments of voting features |
| **UUID** | Universally unique identifiers for vote IDs ensuring global uniqueness across distributed systems |
| **Enum** | Python enumerations for vote types (authentic, false, unsure) providing type safety and preventing invalid vote values |
| **Pydantic** | Data validation ensuring vote requests contain valid content_id, vote_type, and optional reasoning text |
| **python-jose** | JWT token validation for authenticating voters and extracting user identities from access tokens |
| **pytest** | Testing framework for comprehensive vote logic testing including aggregation, duplicate prevention, and threshold calculations |
| **httpx** | Async HTTP client for testing voting API endpoints and simulating concurrent voting scenarios |
| **uvicorn** | ASGI server running FastAPI with production-grade performance for handling high vote submission rates |
| **python-dotenv** | Environment variable management for secure configuration of database URLs, JWT secrets, and threshold values |

---

## 4. Database Design Overview

**Key Entities:**

* **Vote** - Core entity recording individual user votes on content items. Fields include: id (UUID primary key), user_id (UUID of voter extracted from JWT), content_id (UUID of content being voted on), vote_type (ENUM: authentic/false/unsure), reasoning (optional TEXT explaining vote decision with evidence or analysis), and voted_at (timestamp for temporal analysis). The unique constraint on (user_id, content_id) pair enforced at database level ensures each user can only vote once per content item, preventing vote manipulation and maintaining one-person-one-vote principle.

**Relationships:**

* **User → Vote (One-to-Many)**: Each vote stores the user_id of the voter, linking to the User in the User Service. This relationship enables tracking individual voting histories, calculating user reputation based on voting accuracy, and detecting suspicious voting patterns (e.g., always voting "false" or coordinated voting rings). The indexed user_id field supports efficient queries for "show all votes by this user" functionality, useful for user profiles and moderation.

* **Content → Vote (One-to-Many)**: Votes reference specific content items through content_id, linking democratic verification to submissions. This is the most critical relationship - all votes for a content item are aggregated to calculate authenticity percentage, confidence level, and final verification status. The indexed content_id field ensures efficient aggregation queries when calculating vote results, which happens on every vote submission to provide real-time status updates.

* **Vote Constraint (Unique)**: Database-level unique constraint on (user_id, content_id) enforces the fundamental rule that each user can only vote once per content item. Attempting to insert a duplicate vote results in database error, caught by the application and converted to a 409 Conflict response suggesting vote update instead. This constraint is enforced at the database layer, not just application layer, providing ironclad duplicate prevention even if application logic has bugs.

---

## 5. Feature Breakdown

* **Vote Submission**: Authenticated users can cast votes on any content item by providing content_id, vote_type (authentic/false/unsure), and optional reasoning. Voter identity is extracted from JWT token, ensuring votes are attributed correctly and users cannot vote as someone else. The system checks for existing votes using the unique constraint - duplicate vote attempts return 409 Conflict with a helpful error message. Vote reasoning allows users to explain their decision, cite sources, or provide evidence, enriching the verification quality beyond simple thumbs up/down.

* **Duplicate Prevention**: One-vote-per-user-per-content rule enforced through database unique constraint on (user_id, content_id). When a user attempts to vote on content they've already voted on, the database rejects the insertion with a unique constraint violation. The application catches this error and returns 409 Conflict with a message like "You have already voted on this content. Use PATCH to update your existing vote." This database-level enforcement is more reliable than application-level checks, which could have race conditions between vote existence checks and insertions.

* **Vote Aggregation**: Real-time calculation of verification statistics whenever votes are retrieved. Aggregation query counts votes by type (authentic, false, unsure) for the content item, calculates percentages (authentic_percent = authentic_votes / total_votes * 100), and determines overall status based on thresholds. If authentic percentage ≥ 70%, status is "verified". If false percentage ≥ 70%, status is "false". Otherwise, status is "disputed" (indicating community disagreement). Pending status means zero votes exist. Aggregation is efficient using SQL COUNT and GROUP BY, handling thousands of votes per content item without performance degradation.

* **Vote Results Endpoint**: Public API endpoint returning vote statistics for any content item without authentication required. Returns total vote count, breakdown by vote type (authentic_count, false_count, unsure_count), percentages for each type, overall verification status, and confidence level (higher confidence with more votes). This transparency allows anyone to see voting details, not just vote outcomes, building trust in the verification process. Results are calculated in real-time, not cached, ensuring users always see current status.

* **User Vote History**: Authenticated endpoint returning all votes cast by the current user, sorted chronologically. Enables users to review their voting history, track content they've engaged with, and update previous votes if their opinion changes based on new evidence. Useful for user profiles showing participation level and voting patterns. The endpoint filters votes by user_id from JWT, preventing users from viewing others' vote histories (privacy protection).

* **Vote Update**: Users can change their vote on content if they discover new evidence or change their mind. PATCH endpoint updates existing vote's vote_type and reasoning. Vote ownership is verified by comparing JWT user_id with vote.user_id, ensuring users can only update their own votes. Timestamps are updated to reflect modification time (planned feature). Vote updates trigger re-aggregation, potentially changing content verification status based on the new vote distribution.

* **Check User Vote**: Convenience endpoint checking if the authenticated user has voted on specific content and returning their vote details if they have. Prevents UI confusion where users might not remember if they've voted. Returns vote_type and reasoning if vote exists, or 404 if no vote found. Used by frontend to show "You voted: authentic" indicators and pre-populate vote forms for vote updates.

* **Health Checks**: Service health endpoints verifying API availability and PostgreSQL connectivity. Used by load balancers and orchestration platforms to detect service degradation and route traffic appropriately. Database connectivity checks ensure the service can actually read/write votes, not just respond to HTTP requests. Critical for automated recovery and monitoring alerting.

---

## 6. API Security Overview

* **JWT Authentication**: Vote submission, updates, and vote history retrieval require valid JWT access tokens from the User Service. Tokens are validated using the shared JWT_SECRET_KEY, ensuring only authenticated users can participate in verification. The user_id claim is extracted to identify voters, preventing users from voting as someone else or viewing others' vote histories. Expired tokens are rejected with 401 Unauthorized. Anonymous users can view vote results but cannot cast votes.

* **Unique Constraint Enforcement**: Database-level unique constraint on (user_id, content_id) provides ironclad duplicate vote prevention. Even if application code has bugs or race conditions, the database rejects duplicate vote attempts with integrity violation errors. This constraint is created during migration and persists as long as the table exists, providing permanent protection against vote manipulation. Application layer catches constraint violations and returns user-friendly 409 Conflict responses.

* **Vote Ownership Verification**: Update operations verify vote ownership by comparing JWT user_id with vote.user_id from database. Only the original voter can modify their vote - other users (including admins) cannot alter votes to prevent result manipulation. This maintains voting integrity and democratic principles. Unauthorized update attempts return 403 Forbidden. Moderators can potentially delete votes in extreme abuse cases, but deletion is logged for audit trails.

* **Input Validation**: Pydantic schemas validate all vote submission data. content_id must be valid UUID format, vote_type must be one of the allowed enum values (authentic/false/unsure), and reasoning text has maximum length limits to prevent database storage abuse. Invalid vote types or malformed UUIDs are rejected with 422 Unprocessable Entity responses before any database operations occur, preventing garbage data from entering the system.

* **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries prevents SQL injection in vote operations. All user inputs (UUIDs, reasoning text) are bound as query parameters, never concatenated into SQL strings. SQLAlchemy's query builder automatically escapes special characters and uses prepared statements. Vote aggregation queries use safe SQL functions (COUNT, GROUP BY) without string concatenation, eliminating SQL injection vectors even in complex aggregation logic.

* **CORS Configuration**: Cross-Origin Resource Sharing configured to allow requests from approved frontend domains only. In development, localhost is permitted for testing. Production whitelists specific frontend domain (e.g., https://veridiapp.com). Credentials (JWT in Authorization headers) are only accepted from trusted origins, preventing malicious websites from making authenticated vote requests through users' browsers.

* **Rate Limiting**: Future implementation will protect against vote spam and API abuse. Authenticated users will be limited to reasonable vote submission rates (e.g., 30 votes per minute) to prevent automated voting bots while allowing legitimate rapid voting on multiple content items. IP-based limits will protect against coordinated attacks using multiple accounts. Rate limit information will be returned in headers for client guidance.

* **Vote Manipulation Detection**: Future analytics will detect suspicious voting patterns like coordinated voting rings (multiple accounts always voting the same way), voting bots (identical timing patterns), and reputation-gaming attempts. Statistical anomaly detection will flag accounts exhibiting abnormal behavior for investigation. Detected manipulation may result in vote invalidation, account suspension, and law enforcement referral in severe cases.

---

## 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the Voting Service development lifecycle, ensuring vote counting accuracy, preventing regressions in democratic verification logic, and enabling rapid feature delivery. For the Voting Service, CI/CD is critical because bugs in vote aggregation or duplicate prevention could undermine the entire verification platform's integrity, making comprehensive automated testing essential.

The Voting Service uses **GitHub Actions** as the CI/CD platform, with workflows triggered on pushes to feature branches and pull requests to main. The pipeline includes: code linting with flake8 and black for code quality, running pytest suite covering vote submission, aggregation logic, duplicate prevention, threshold calculations, and edge cases (ties, insufficient votes), code coverage reporting (target: 80%+), security scanning with bandit for common vulnerabilities, and Docker image building for containerization verification.

**Continuous Integration (CI)** validates every code change before merge. When code is pushed, the pipeline provisions a Python 3.11 environment, installs dependencies from requirements.txt, starts PostgreSQL 14 container via Docker Compose, runs Alembic migrations to create vote schema with unique constraints, and executes the complete pytest suite. Tests verify vote counting accuracy by submitting known vote distributions and asserting correct percentages, test duplicate prevention by attempting to vote twice and expecting constraint violation, and test status calculations across threshold boundaries (69% vs 70% authentic). Failed tests automatically block pull request merging.

**Continuous Deployment (CD)** automatically deploys to staging and production after merge to main. The pipeline builds Docker image with latest code, tags it with git commit SHA for traceability, pushes to container registry (AWS ECR, Docker Hub, Google Container Registry), and updates deployment configuration (Kubernetes, ECS). Database migrations run automatically before service restart, adding new indexes or modifying vote schema safely. Environment-specific configuration (database URLs, JWT secrets, threshold values) is injected from GitHub Secrets or cloud secret management. Staging deploys immediately; production may require approval for critical services like voting.

The entire pipeline from commit to production typically completes in 5-7 minutes. Failed deployments trigger automatic rollback to previous stable version, ensuring voting is never interrupted. Monitoring alerts track deployment success, vote submission rates, and aggregation query performance, helping identify issues before users are impacted.

---

## 8. Resources

* [FastAPI Documentation](https://fastapi.tiangolo.com/) - Modern Python web framework
* [SQLAlchemy Documentation](https://docs.sqlalchemy.org/) - Python ORM with unique constraint support
* [PostgreSQL Unique Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS) - Database-level duplicate prevention
* [Alembic Documentation](https://alembic.sqlalchemy.org/) - Database migration tool
* [Voting Systems Overview](https://en.wikipedia.org/wiki/Voting_system) - Democratic decision-making mechanisms
* [Wisdom of Crowds](https://en.wikipedia.org/wiki/Wisdom_of_crowds) - Collective intelligence theory

---

## 9. License

This project is licensed under the **MIT License**.

---

## 10. Created By

**Phinehas Macharia**
