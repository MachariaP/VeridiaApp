# VeridiaApp - Community-Driven Content Verification Platform

## 🚀 Quick Start

**⚠️ Important: Before running the application, please review [SECURITY.md](SECURITY.md) for instructions on setting up required environment variables and secrets.**

### Running the Application

#### Backend Setup
```bash
cd user_service

# Copy and configure environment variables (REQUIRED)
cp .env.example .env
# Edit .env and generate secure values for DATABASE_URL, POSTGRES_PASSWORD, and JWT_SECRET_KEY
# See SECURITY.md for instructions on generating strong, random secrets

# Start PostgreSQL database
docker compose up -d db

# Run database migrations
alembic upgrade head

# Start the backend API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API will be available at http://localhost:8000

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend application will be available at http://localhost:3000

### Testing the Application
1. Visit http://localhost:3000
2. Click "Join Now" to create an account
3. Fill in the registration form and submit
4. Login with your credentials
5. You'll see the authenticated dashboard!

---

## 📜 Table of Contents
* [Project Overview](#1-project-overview)
* [Team Roles and Responsibilities](#2-team-roles-and-responsibilities)
* [Technology Stack Overview](#3-technology-stack-overview)
* [Database Design Overview](#4-database-design-overview)
* [Feature Breakdown](#5-feature-breakdown)
* [API Security Overview](#6-api-security-overview)
* [CI/CD Pipeline Overview](#7-cicd-pipeline-overview)
* [Resources](#8-resources)
* [Security Guidelines](#9-security-guidelines)
* [License](#10-license)
* [Created By](#11-created-by)

---

## 1. Project Overview

**Brief Description:**

VeridiaApp is a next-generation, community-driven content verification platform designed to combat misinformation and enhance content credibility through collective intelligence and AI-powered verification. The platform enables users to submit content for verification, allows community members to vote and comment on content authenticity, and leverages advanced search capabilities for content discovery. Built on a modern microservices architecture, VeridiaApp ensures scalability, security, and high performance while maintaining GDPR compliance and robust data protection standards.

The system addresses the critical challenge of information authenticity in the digital age by providing a transparent, democratic verification process where community expertise meets cutting-edge technology. VeridiaApp combines human judgment with automated AI verification to create a comprehensive truth-checking ecosystem.

**Project Goals:**

* **Scalability**: Implement a microservices architecture that can horizontally scale to handle millions of users and content submissions
* **Security First**: Ensure enterprise-grade security with JWT authentication, role-based access control (RBAC), and comprehensive input validation
* **High Performance**: Achieve sub-second response times through optimized database queries, caching strategies, and efficient indexing
* **GDPR Compliance**: Provide full data privacy controls including user data export, deletion, and audit logging capabilities
* **Real-time Verification**: Enable instant content verification status updates through event-driven architecture and WebSocket notifications
* **Comprehensive Testing**: Maintain 80%+ test coverage across all services with unit, integration, and end-to-end testing
* **Production-Ready Deployment**: Implement automated CI/CD pipelines with Docker containerization and cloud-native infrastructure

**Key Tech Stack:**

* **Backend**: Python 3.11+ with FastAPI for high-performance RESTful APIs
* **Frontend**: Next.js 15 with React 19 and TypeScript for modern, responsive user interface
* **Databases**: PostgreSQL (relational data), MongoDB (document storage), Elasticsearch (full-text search)
* **Infrastructure**: Docker containerization, RabbitMQ message broker, GitHub Actions CI/CD
* **Cloud**: AWS/GCP/Azure compatible deployment with managed database services

---

## 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Lead Software Architect** | Design overall system architecture, ensure scalability patterns, define microservices boundaries, and establish technical standards |
| **DevOps Engineer** | Configure CI/CD pipelines, manage Docker containerization, implement infrastructure as code, and maintain deployment automation |
| **Senior Backend Developer (Python/FastAPI)** | Develop and maintain microservices, implement RESTful APIs, optimize database queries, and ensure backend performance |
| **Senior Frontend Developer (React/Next.js)** | Build responsive user interfaces, implement state management, optimize frontend performance, and ensure accessibility standards |
| **Full-Stack Developer** | Bridge frontend and backend development, integrate APIs, implement end-to-end features, and support both layers |
| **UX/UI Designer** | Design user interfaces, create wireframes and mockups, ensure WCAG 2.1 AA compliance, and optimize user experience flows |
| **QA Engineer/Test Automation Specialist** | Develop automated tests (unit, integration, E2E), maintain test frameworks, ensure quality standards, and perform regression testing |
| **Database Administrator** | Design database schemas, optimize queries, manage database migrations, ensure data integrity, and implement backup strategies |
| **Security Engineer** | Implement authentication and authorization, conduct security audits, address vulnerabilities, and ensure compliance with security standards |
| **Cloud Architect** | Design cloud infrastructure, optimize resource utilization, ensure high availability, and implement disaster recovery strategies |
| **API Designer** | Define API contracts, create OpenAPI specifications, ensure RESTful best practices, and maintain API documentation |
| **Technical Writer** | Create comprehensive documentation, maintain README files, write deployment guides, and produce user-facing documentation |
| **Performance Engineer** | Monitor application performance, identify bottlenecks, implement caching strategies, and optimize resource utilization |
| **DevSecOps Engineer** | Integrate security into CI/CD pipelines, automate security scanning, implement secrets management, and ensure compliance |
| **Monitoring & Observability Specialist** | Configure logging and monitoring systems, create dashboards, set up alerting, and ensure system observability |
| **Compliance & GDPR Specialist** | Ensure GDPR compliance, implement data privacy controls, manage consent workflows, and maintain audit trails |

---

## 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **Python 3.11+** | Primary backend programming language chosen for its performance, extensive library ecosystem, and excellent async support via FastAPI |
| **FastAPI** | Modern, high-performance web framework for building RESTful APIs with automatic OpenAPI documentation and built-in data validation |
| **Next.js 15** | React framework for server-side rendering, static site generation, and optimized frontend performance with automatic code splitting |
| **React 19** | Component-based UI library for building interactive user interfaces with declarative syntax and efficient virtual DOM rendering |
| **TypeScript** | Statically-typed superset of JavaScript providing type safety, better IDE support, and improved code maintainability |
| **Tailwind CSS 4** | Utility-first CSS framework for rapid UI development with consistent design system and responsive styling |
| **PostgreSQL** | Primary relational database for user service and verification service storing structured data with ACID compliance |
| **MongoDB** | NoSQL document database for content service storing flexible, schema-less content data with high write throughput |
| **Elasticsearch** | Distributed search and analytics engine for search service enabling full-text search, fuzzy matching, and real-time indexing |
| **Docker** | Containerization platform for packaging services with dependencies, ensuring consistent environments across development and production |
| **RabbitMQ** | Message broker implementing event-driven architecture for asynchronous communication between microservices |
| **JWT (JSON Web Tokens)** | Stateless authentication mechanism for secure API access with short-lived tokens and refresh token rotation |
| **GitHub Actions** | CI/CD automation platform for running tests, building Docker images, and deploying to cloud environments |
| **Redis** | In-memory data store for caching frequently accessed data, session management, and rate limiting |
| **pytest** | Testing framework for Python backend services with fixtures, parametrization, and comprehensive assertion capabilities |
| **Jest** | JavaScript testing framework for frontend unit tests with snapshot testing and mock capabilities |
| **Playwright** | End-to-end testing framework for automated browser testing across multiple platforms and browsers |
| **Pydantic** | Data validation library for FastAPI providing automatic request/response validation and serialization |
| **SQLAlchemy** | ORM (Object-Relational Mapping) for PostgreSQL providing database abstraction and migration management |
| **Alembic** | Database migration tool for managing schema changes and version control of database structure |
| **CORS (Cross-Origin Resource Sharing)** | Security feature allowing controlled access to APIs from different origins with configurable rules |
| **OpenAPI/Swagger** | API documentation standard providing interactive API explorer and client SDK generation |
| **AWS/GCP/Azure** | Cloud platforms for production deployment with managed services for databases, load balancing, and auto-scaling |

---

## 4. Database Design Overview

**Key Entities:**

* **User** - Stores user account information including authentication credentials, profile data, roles, and permissions. Includes fields for email, hashed passwords, role assignments (admin, moderator, user), account creation timestamps, and GDPR-related data export/deletion tracking.

* **Content** - Represents submitted content items requiring verification. Contains content text, metadata, submission timestamp, author reference, current verification status (pending, verified, disputed, false), vote counts, and rich media attachments.

* **Vote** - Records individual user votes on content verification. Tracks user ID, content ID, vote type (authentic, false, unsure), vote timestamp, and optional reasoning/evidence provided by the voter.

* **Comment** - Stores user comments and discussions on content items. Includes comment text, author reference, content reference, parent comment ID (for threaded discussions), timestamps, and moderation status.

* **VerificationResult** - Aggregates verification outcomes combining community votes and AI analysis. Contains overall verification score, confidence level, AI analysis results, final status determination, and audit trail.

* **SearchIndex** - Elasticsearch documents optimized for full-text search. Includes indexed content text, metadata, tags, categories, popularity scores, and relevance boosting factors.

* **AuditLog** - Tracks all significant user actions for GDPR compliance and security auditing. Records action type, user ID, affected resources, timestamps, IP addresses, and change details.

**Relationships:**

* **User → Content (One-to-Many)**: A single user can submit multiple content items for verification. This relationship tracks content ownership and enables user-specific content management, allowing users to view their submission history and manage their contributed content.

* **User → Vote (One-to-Many)**: Each user can cast multiple votes across different content items, but only one vote per content item (enforced at database level with unique constraint). This ensures fair voting while preventing vote manipulation and enabling vote history tracking for reputation systems.

* **Content → Vote (One-to-Many)**: A single content item receives multiple votes from different users. Votes are aggregated to calculate overall verification scores, confidence levels, and final verification status. The relationship supports real-time vote counting and dynamic verification status updates as votes accumulate.

---

## 5. Feature Breakdown

* **User Authentication & Authorization**: Comprehensive JWT-based authentication system with secure registration, login, logout, and password reset flows. Implements refresh token rotation, token expiration management, and role-based access control (RBAC) for different permission levels (admin, moderator, user). Includes OAuth 2.0 preparation for future social login integration.

* **Content Submission & Management**: Full content lifecycle management allowing users to submit text, images, videos, and URLs for verification. Supports content categorization, tagging, and metadata enrichment. Provides draft saving, edit history tracking, and content withdrawal capabilities for content owners.

* **Community Voting System**: Democratic verification mechanism where users vote on content authenticity with options: authentic, false, or unsure. Each vote can include supporting evidence, reasoning, and confidence levels. Implements vote weighting based on user reputation and expertise, with real-time vote aggregation and verification status calculation.

* **Comment & Discussion Threads**: Robust commenting system supporting threaded discussions on content items. Enables users to provide context, share evidence, and engage in constructive debate about content authenticity. Includes comment moderation, reporting, nested replies, and markdown formatting support.

* **AI-Powered Verification Assistant**: Automated content analysis using natural language processing and machine learning models to detect common misinformation patterns, check against known fact databases, and provide preliminary authenticity scores. AI suggestions complement human judgment rather than replacing it.

* **Advanced Search & Discovery**: Elasticsearch-powered full-text search with fuzzy matching, typo tolerance, and relevance scoring. Supports filtering by category, verification status, date range, popularity, and custom sorting. Includes autocomplete suggestions, search history, and personalized content recommendations.

* **Real-time Notifications**: Event-driven notification system using RabbitMQ for instant updates on vote changes, verification status updates, comment replies, and content mentions. Supports in-app notifications, email alerts, and webhook integrations for third-party systems.

* **GDPR Compliance Tools**: Complete data privacy controls including user data export (JSON/CSV formats), right to be forgotten (complete data deletion), consent management, audit trail access, and data processing transparency. All user actions are logged for compliance auditing.

* **Admin Dashboard & Moderation**: Comprehensive administrative interface for content moderation, user management, system monitoring, and configuration. Includes tools for reviewing flagged content, managing user roles, viewing analytics, and configuring system parameters.

* **Rate Limiting & Abuse Prevention**: Multi-layered protection against API abuse including per-user rate limiting, IP-based throttling, CAPTCHA integration for suspicious activities, and automated bot detection to ensure fair usage and system stability.

---

## 6. API Security Overview

* **JWT Authentication**: JSON Web Tokens provide stateless, scalable authentication across all microservices. Access tokens expire after 15 minutes to minimize exposure risk, while refresh tokens enable seamless session extension. Tokens are signed using RS256 algorithm with rotating keys, and include user ID, roles, and permissions in claims for efficient authorization checks without database lookups.

* **Role-Based Access Control (RBAC)**: Granular permission system defining three primary roles - Admin (full system access), Moderator (content management and user moderation), and User (standard content interaction). Each API endpoint enforces role requirements, preventing unauthorized access to sensitive operations like user deletion or system configuration changes.

* **Input Validation & Sanitization**: All incoming API requests undergo strict validation using Pydantic models in FastAPI. Data types, formats, lengths, and patterns are enforced at the schema level. User-provided content is sanitized to prevent XSS attacks, SQL injection, and NoSQL injection. File uploads are validated for type, size, and scanned for malware.

* **Rate Limiting**: Multi-tier rate limiting protects against abuse and ensures fair resource allocation. Implemented using Redis-backed token bucket algorithm with different limits for authenticated vs. anonymous users. Standard users limited to 100 requests/minute, while premium users may have higher limits. Returns 429 status with Retry-After headers when limits exceeded.

* **HTTPS/TLS Encryption**: All API communication enforces HTTPS with TLS 1.3 for data in transit. HTTP requests are automatically redirected to HTTPS. Strong cipher suites configured, and certificate pinning implemented for mobile clients to prevent man-in-the-middle attacks.

* **CORS Configuration**: Cross-Origin Resource Sharing configured with whitelist approach, allowing only approved frontend domains. Credentials (cookies, authorization headers) only accepted from trusted origins. Preflight requests properly handled for complex CORS scenarios.

* **API Versioning**: URL-based versioning (e.g., /api/v1/) ensures backward compatibility while enabling evolution. Critical breaking changes result in new version release with migration guides. Old versions maintained for deprecation period (minimum 6 months) with sunset headers informing clients of timeline.

* **Security Headers**: Comprehensive security headers including Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, and X-XSS-Protection to defend against common web vulnerabilities and provide defense-in-depth.

* **Audit Logging**: All security-relevant events logged including authentication attempts (successful and failed), authorization denials, data access, and modifications. Logs include timestamps, user IDs, IP addresses, user agents, and request details for forensic analysis and compliance auditing.

---

## 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the software delivery process, enabling rapid, reliable, and repeatable deployments while maintaining code quality and system stability. For VeridiaApp, CI/CD is critical to managing the complexity of a microservices architecture where multiple services must be independently tested, built, and deployed in coordination.

The CI/CD pipeline is implemented using **GitHub Actions** as the primary automation platform, chosen for its native GitHub integration, extensive marketplace of pre-built actions, and flexible workflow definition. Each service has its own workflow defined in YAML that triggers on specific events (push, pull request, tag creation) to the relevant service directories.

**Continuous Integration (CI)** phase begins when code is pushed to any branch. Automated workflows execute linting (Black, flake8 for Python; ESLint, Prettier for TypeScript), run comprehensive test suites (unit, integration tests with pytest and Jest), perform security scanning using tools like Bandit and npm audit, and build Docker images to verify containerization. Code coverage reports are generated and must meet the 80% threshold. All checks must pass before code can be merged to the main branch via pull request.

**Continuous Deployment (CD)** phase activates when code is merged to the main branch or a release tag is created. The pipeline automatically builds production Docker images with proper versioning, pushes images to container registries (AWS ECR, Google Container Registry, or Docker Hub), updates Kubernetes manifests or ECS task definitions, and deploys to staging environment first for smoke testing. Upon successful staging validation, deployment proceeds to production with rolling update strategy to ensure zero-downtime. Database migrations are executed automatically with rollback capability if failures occur.

The pipeline includes **environment-specific configurations** managed through GitHub Secrets and environment variables, ensuring sensitive credentials never appear in code. Infrastructure provisioning uses Terraform or CloudFormation for reproducible, version-controlled infrastructure changes. Monitoring integration with tools like Datadog or Prometheus alerts the team of deployment issues, automatically rolling back on critical errors. The entire process from code commit to production deployment typically completes in 10-15 minutes for individual services, enabling multiple deployments per day with confidence.

---

## 8. Resources

### Official Documentation
* [FastAPI Documentation](https://fastapi.tiangolo.com/) - Comprehensive guide for building high-performance APIs
* [Next.js Documentation](https://nextjs.org/docs) - React framework for production-grade applications
* [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Advanced relational database features
* [MongoDB Documentation](https://docs.mongodb.com/) - NoSQL document database guide
* [Elasticsearch Documentation](https://www.elastic.co/guide/) - Full-text search and analytics engine
* [Docker Documentation](https://docs.docker.com/) - Container platform and best practices
* [GitHub Actions Documentation](https://docs.github.com/en/actions) - CI/CD automation workflows

### Cloud Platforms
* [AWS Documentation](https://docs.aws.amazon.com/) - Amazon Web Services cloud platform
* [Google Cloud Platform Documentation](https://cloud.google.com/docs) - GCP services and APIs
* [Microsoft Azure Documentation](https://docs.microsoft.com/en-us/azure/) - Azure cloud services

### Development Tools
* [pytest Documentation](https://docs.pytest.org/) - Python testing framework
* [Jest Documentation](https://jestjs.io/docs/getting-started) - JavaScript testing framework
* [Playwright Documentation](https://playwright.dev/) - End-to-end testing automation
* [Pydantic Documentation](https://docs.pydantic.dev/) - Data validation for Python

### Security Resources
* [OWASP Top Ten](https://owasp.org/www-project-top-ten/) - Web application security risks
* [JWT.io](https://jwt.io/) - JSON Web Token standards and debugger
* [GDPR Compliance Guidelines](https://gdpr.eu/) - European data protection regulation

### Learning Resources
* [REST API Best Practices](https://restfulapi.net/) - RESTful API design patterns
* [Microservices Patterns](https://microservices.io/patterns/) - Architecture patterns for microservices
* [The Twelve-Factor App](https://12factor.net/) - Methodology for building modern applications

---

## 9. Security Guidelines

For detailed information on managing secrets, environment variables, and security best practices, please refer to [SECURITY.md](SECURITY.md).

**Key Security Points:**
* Never commit real secrets to version control
* Always use environment variables for sensitive configuration
* Generate strong, random secrets for production
* Rotate secrets regularly
* **⚠️ CRITICAL**: Use the same JWT_SECRET_KEY across all services - different keys will break authentication!

---

## 10. License

This project is licensed under the **MIT License**.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 11. Created By

**Phinehas Macharia**

Lead Software Architect | Full-Stack Developer | Technical Innovator

VeridiaApp was conceived and developed to address the critical challenge of misinformation in the digital age through community-driven verification powered by cutting-edge technology. This project represents a commitment to transparency, truth, and collaborative intelligence in content verification.

---

*Last Updated: October 2024*  
*Version: 1.0*  
*Built with ❤️ for a more trustworthy internet*
