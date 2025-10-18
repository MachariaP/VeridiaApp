<div align="center">

# 🔍 VeridiaApp Search Service

### Full-Text Search & Content Discovery Microservice

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8.x-005571.svg)](https://www.elastic.co/)
[![Search](https://img.shields.io/badge/Search-Full_Text-yellow.svg)](https://www.elastic.co/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Powerful search with fuzzy matching and real-time indexing**

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

The VeridiaApp Search Service is a specialized microservice providing powerful full-text search capabilities across all content submissions using Elasticsearch. Built with FastAPI and Elasticsearch, this service enables users to discover content through natural language queries with fuzzy matching, typo tolerance, and relevance scoring. The service indexes content submissions in real-time, supports advanced filtering by verification status and tags, and provides fast search results even with millions of documents. As the discovery layer for the platform, it helps users find relevant content and trending verification topics.

**Project Goals:**

* **Full-Text Search**: Enable natural language content discovery with fuzzy matching and typo tolerance for user-friendly queries
* **Real-Time Indexing**: Synchronize content submissions from Content Service to Elasticsearch for immediate searchability
* **Advanced Filtering**: Support filtering by verification status (verified/false/disputed/pending) and content tags for targeted searches
* **High Performance**: Deliver search results in under 200ms even with millions of indexed documents through Elasticsearch optimization
* **Relevance Ranking**: Use Elasticsearch's BM25 algorithm for intelligent result ranking based on term frequency and document relevance
* **Scalability**: Support horizontal scaling through Elasticsearch's distributed architecture for growing content volumes

**Key Tech Stack:**

* **Backend**: Python 3.11+ with FastAPI for high-performance async search API
* **Search Engine**: Elasticsearch 8.x for distributed full-text search and analytics
* **Client**: Official Elasticsearch Python client for robust index and query operations
* **Authentication**: JWT integration with User Service for secure index management
* **Testing**: pytest with Elasticsearch test fixtures for search accuracy validation

---

## 👥 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Backend Developer** | Implement search endpoints, query builders, and synchronization logic with Content Service |
| **Search Engineer** | Design Elasticsearch mappings, configure analyzers, optimize query performance, and tune relevance scoring |
| **Database Administrator** | Manage Elasticsearch cluster, create index templates, configure sharding strategy, and monitor cluster health |
| **QA Engineer** | Test search accuracy, fuzzy matching behavior, filter combinations, and pagination edge cases |
| **DevOps Engineer** | Deploy Elasticsearch cluster, configure monitoring, implement backup strategies, and optimize resource allocation |
| **Data Analyst** | Analyze search patterns, identify popular queries, optimize autocomplete suggestions, and improve result relevance |

---

## 🛠️ 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **Python 3.11+** | Primary programming language with excellent async support for concurrent search request handling |
| **FastAPI** | Modern async web framework providing automatic validation, OpenAPI documentation, and high throughput |
| **Elasticsearch 8.x** | Distributed search and analytics engine chosen for full-text search, fuzzy matching, and horizontal scalability |
| **elasticsearch-py** | Official Python client for Elasticsearch enabling index management, document indexing, and query execution |
| **Pydantic** | Data validation ensuring search queries and index documents conform to expected schemas before processing |
| **python-jose** | JWT token validation for authenticating index management operations (create, update, delete documents) |
| **pytest** | Testing framework with Elasticsearch fixtures for testing search accuracy and query behavior |
| **httpx** | Async HTTP client for testing search API endpoints and simulating concurrent search traffic |
| **uvicorn** | ASGI server running FastAPI with production-grade performance for high search request volumes |
| **python-dotenv** | Environment variable management for configuring Elasticsearch URLs, JWT secrets, and index names |

---

## 🗄️ 4. Database Design Overview

**Key Entities:**

* **Content Index** - Elasticsearch document representing searchable content. Fields include: content_id (keyword field for exact matching), author_id (keyword for filtering by author), content_text (text field with full-text analysis), content_url (keyword field), tags (array of keywords for tag filtering), status (keyword: pending/verified/disputed/false for status filtering), submission_date (date field for temporal sorting), and auto-generated _score (relevance ranking). The text field uses standard analyzer with tokenization, lowercasing, and stemming, enabling searches like "running" to match "run" and "runner". Multi-field mapping allows both analyzed (for searching) and keyword (for sorting/filtering) versions of text fields.

**Relationships:**

* **Content → SearchIndex (One-to-One)**: Each content submission in the Content Service has a corresponding document in the Elasticsearch index. The content_id serves as both MongoDB _id and Elasticsearch document _id, maintaining referential integrity. When content is submitted, the Content Service calls the Search Service's index endpoint to create the Elasticsearch document. Updates to content (status changes from voting, new tags) trigger re-indexing through the same endpoint, keeping search results synchronized with source data.

* **User → SearchIndex (Implicit One-to-Many)**: Search documents include author_id enabling "find all content by this author" queries. This relationship is implicit - no foreign key exists, but the author_id keyword field enables efficient filtering. Elasticsearch's term query on author_id returns all documents by a user instantly, supporting user profile pages showing their submissions and contributions to the verification platform.

---

## ✨ 5. Feature Breakdown

* **Content Indexing**: Authenticated endpoint for adding content to the search index. Accepts content document with content_id, author_id, content_text, tags, status, and submission_date. Document is transformed into Elasticsearch format and indexed. The content_id is used as Elasticsearch document ID for idempotent indexing - re-indexing the same content_id updates the existing document rather than creating duplicates. Indexing is near-instantaneous (milliseconds), making content searchable immediately after submission.

* **Full-Text Search**: Public search endpoint accepting text queries and returning ranked results. Uses Elasticsearch's multi_match query searching across content_text and tags fields simultaneously. Fuzzy matching tolerates up to 2 character differences (typos), so "verificaton" finds "verification". BM25 relevance algorithm ranks documents by term frequency (how often search terms appear) and inverse document frequency (rarity of terms across all documents), surfacing most relevant results first. Supports phrase queries with quotes for exact matching.

* **Advanced Filtering**: Search queries support filtering by verification status (verified/false/disputed/pending) and tags through Elasticsearch's bool query with filter clauses. Filters are combined with search queries using AND logic - results must match both the text query and filters. Multiple tags can be specified (OR logic - match any tag) while status is exclusive (must match exact status). Filters are cached by Elasticsearch for performance, making repeated filtered searches extremely fast.

* **Fuzzy Matching**: Automatic typo correction through Elasticsearch's fuzziness parameter set to "AUTO". Single-character typos are tolerated for words 3-5 characters, two-character typos for longer words. This makes search user-friendly - "verificatin platfrom" successfully finds "verification platform" content. Fuzziness is configurable per query, allowing strict searches when needed. Transposition errors (swapped characters) are also corrected.

* **Pagination**: Search results support pagination with page number and results-per-page parameters (default 10, max 100). Elasticsearch's from/size pagination enables efficient result windowing. Total hit count is returned with each response, allowing UIs to display "Showing 1-10 of 1,247 results" and render page navigation. Deep pagination (beyond 10,000 results) uses search_after for better performance, though most users only view first few pages.

* **Index Updates**: Authenticated endpoint for updating existing documents in the search index. Used when content status changes (e.g., from pending to verified after voting) or tags are modified. Update uses content_id as document ID, replacing the entire document with new data. Elasticsearch's versioning prevents lost updates in concurrent scenarios. Updates are near-instantaneous, keeping search results synchronized with source data changes.

* **Index Deletion**: Authenticated endpoint for removing documents from search index. Used when content is deleted from Content Service or marked for removal. Deletion uses content_id to identify the document. Returns 404 if document doesn't exist, allowing idempotent deletion. Soft-deleted content may remain indexed with special "deleted" status for audit purposes, or be physically removed depending on retention policies.

* **Health Checks**: Service health endpoints verify API availability and Elasticsearch cluster connectivity. Elasticsearch health endpoint checks cluster status (green/yellow/red) and document count. Used by load balancers and monitoring to detect cluster issues. Critical for alerting on Elasticsearch failures that would prevent searches from working.

---

## 🔒 6. API Security Overview

* **JWT Authentication for Indexing**: Index management operations (create, update, delete documents) require valid JWT access tokens from the User Service. Only authenticated users can add content to search index, preventing spam indexing. Tokens are validated using shared JWT_SECRET_KEY. The author_id from JWT claims is used as the document's author field, ensuring accurate attribution. Anonymous index attempts return 401 Unauthorized.

* **Public Search Access**: Search queries are intentionally public, requiring no authentication. This design decision enables content discovery for anonymous users evaluating the platform. Public access increases platform adoption and allows sharing search result links freely. Rate limiting (planned) will prevent search API abuse while maintaining open access for legitimate users.

* **Input Validation**: Pydantic schemas validate all search queries and index documents. Search queries validate query text, page numbers, results per page limits, and filter values. Index documents validate content_id format, required fields, and field lengths. Invalid inputs return 422 Unprocessable Entity with detailed error messages. Validation prevents malformed data from reaching Elasticsearch, which could cause query failures.

* **Query Injection Protection**: Search queries use Elasticsearch's query DSL with parameterized values, not string concatenation. User query text is passed as a parameter to multi_match query, preventing Elasticsearch injection attacks. Special characters are automatically escaped by the client library. Even malicious queries with special Elasticsearch syntax are treated as literal search text, not executed as commands.

* **CORS Configuration**: Cross-Origin Resource Sharing configured to allow search requests from approved frontend domains. In development, localhost is permitted for testing. Production whitelists specific frontend domain. Search being public, CORS is more permissive than other services, but still restricted to prevent unauthorized embedding on malicious sites.

* **Rate Limiting**: Future implementation will protect against search abuse and resource exhaustion. Anonymous users will be limited to 60 searches per minute per IP, while authenticated users get higher limits (300 searches/minute). Heavy rate limiting blocks will be escalated to firewall-level IP bans. Rate limit headers inform clients of remaining quota, helping prevent accidental throttling.

* **Index Access Control**: While search is public, index management is restricted. Only authenticated services (Content Service) can index documents, not end users. This prevents users from polluting the index with fake content. Future enhancements may add role-based indexing where moderators can manually index external content for verification.

* **Elasticsearch Security**: Production Elasticsearch clusters use authentication (elastic/password), TLS encryption for cluster communication, and network isolation (no public internet access). Only the Search Service can connect to Elasticsearch, preventing direct access from attackers. Elasticsearch security features (X-Pack Security) enable audit logging, role-based access, and field-level security if needed.

---

## 🚀 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the Search Service development lifecycle, ensuring search accuracy, preventing query regressions, and enabling rapid feature delivery. For the Search Service, CI/CD is critical because bugs in search queries or indexing could render content undiscoverable, undermining the platform's usability and requiring comprehensive automated testing.

The Search Service uses **GitHub Actions** as the CI/CD platform, with workflows triggered on pushes and pull requests. The pipeline includes: code linting with flake8 and black for code quality, running pytest suite covering search accuracy (expected results for known queries), fuzzy matching behavior, filter combinations, pagination, and edge cases, code coverage reporting (target: 80%+), security scanning with bandit for common vulnerabilities, and Docker image building for containerization.

**Continuous Integration (CI)** validates every code change. When code is pushed, the pipeline provisions Python 3.11 environment, installs dependencies from requirements.txt, starts Elasticsearch 8.x container via Docker Compose, waits for cluster health green status, creates test index with mappings, loads test data (known content samples), and executes pytest suite. Tests verify search accuracy by querying for known terms and asserting expected documents appear in results, test fuzzy matching by introducing typos and verifying results still match, and test filters by combining status/tag filters with queries. Failed tests block merging.

**Continuous Deployment (CD)** automatically deploys to staging and production after merge. The pipeline builds Docker image with latest code, tags it with git commit SHA for traceability, pushes to container registry (AWS ECR, Docker Hub), and updates deployment configuration (Kubernetes, ECS). No database migrations needed (Elasticsearch is schema-free), but index templates may be updated to change mappings for new documents. Environment-specific configuration (Elasticsearch URLs, JWT secrets, index names) is injected from GitHub Secrets. Staging deploys immediately; production may require approval.

The entire pipeline completes in 4-6 minutes. Failed deployments rollback automatically. Monitoring tracks search latency, query throughput, and Elasticsearch cluster health, alerting on performance degradation or cluster issues before impacting users.

---

## 📚 8. Resources

* [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) - Comprehensive search engine guide
* [Elasticsearch Python Client](https://elasticsearch-py.readthedocs.io/) - Official Python library documentation
* [FastAPI Documentation](https://fastapi.tiangolo.com/) - Modern Python web framework
* [Full-Text Search Concepts](https://en.wikipedia.org/wiki/Full-text_search) - Search fundamentals
* [BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25) - Elasticsearch relevance ranking algorithm
* [Query DSL Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html) - Elasticsearch query language

---

## 📄 9. License

This project is licensed under the **MIT License**.

---

## 👨‍💻 10. Created By

<div align="center">

**Phinehas Macharia**

[![GitHub](https://img.shields.io/badge/GitHub-MachariaP-181717?style=for-the-badge&logo=github)](https://github.com/MachariaP)

*Powering content discovery for VeridiaApp*

</div>
