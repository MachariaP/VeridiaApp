# VeridiaApp: Empowering Truth-Seekers in a World of Information Overload

VeridiaApp is a dynamic, mobile-first platform designed for truth-seekers, researchers, and content creators. It enables users to create, share, and discover verified, AI-assisted content through a community-driven ecosystem. Built with a microservices architecture and a headless approach, VeridiaApp ensures scalability, flexibility, and resilience while prioritizing user privacy, content verification, and seamless integration with emerging technologies.

## 🎨 Design System

VeridiaApp features a **comprehensive, modern design system** that emphasizes:
- **Trustworthiness** - Professional, consistent, and reliable
- **Precision** - Clean lines with intentional whitespace
- **Modernity** - Contemporary without being trendy
- **Accessibility** - WCAG 2.1 AA compliance target
- **Performance** - 60 FPS animations, optimistic UI

### Design Documentation
- **[DESIGN_SUMMARY.md](./DESIGN_SUMMARY.md)** - Quick overview and reference
- **[DESIGN.md](./DESIGN.md)** - Complete design system specification
- **[COMPONENTS.md](./COMPONENTS.md)** - Reusable UI component library
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** - Accessibility compliance guide

## 🔒 Security & Compliance

VeridiaApp prioritizes **data integrity, privacy, and trustworthiness** aligned with European best practices:

### Security Features
- **RBAC (Role-Based Access Control)**: Fine-grained permissions for Standard Users, Verified Contributors, and Moderators
- **JWT Authentication**: Short-lived access tokens (30 min) + refresh token rotation (7 days)
- **Audit Logging**: Non-repudiable tracking of all critical operations
- **Password Security**: Argon2 (primary) + bcrypt (fallback) hashing

### GDPR Compliance
- **Data Minimization**: Only essential data collected (username, email, password hash)
- **Right to Access**: Data export API endpoint (Article 20)
- **Right to Erasure**: Complete account deletion with cross-service cleanup (Article 17)
- **Data Portability**: Machine-readable JSON export format
- **Audit Trail**: Comprehensive logging for accountability

### Documentation
- **[RBAC.md](./RBAC.md)** - Role-based access control guide with permissions matrix
- **[GDPR_COMPLIANCE.md](./GDPR_COMPLIANCE.md)** - Complete GDPR implementation details
- **[API_ENHANCEMENTS.md](./API_ENHANCEMENTS.md)** - API documentation with security features

## Project Overview
VeridiaApp aims to revolutionize how users engage with information by:
- **Empowering Creation:** Tools for generating and verifying content with AI assistance.
- **Fostering Community:** Collaborative features for discussions, voting, and real-time interactions.
- **Driving Discovery:** Advanced search and recommendation engines powered by AI and user feedback.

Our target audience includes journalists, educators, researchers, and everyday users seeking reliable information.

## Architecture
VeridiaApp follows a **microservices architecture** with a **headless approach**:

### Backend Microservices
- **user_service** (Port 8000): User authentication, registration, and profile management using PostgreSQL
- **content_service** (Port 8001): Content lifecycle management (creation, retrieval) using MongoDB
- **verification_service** (Port 8002): Community voting, discussions, and AI verification using PostgreSQL
- **search_service** (Port 8003): Full-text search and discovery using Elasticsearch

### Frontend
- **frontend_app**: Next.js/React application with TypeScript and Tailwind CSS
  - Authentication flow with JWT tokens
  - Protected dashboard with user profile
  - Content submission interface
  - Content detail pages with voting and discussions
  - Discovery/search interface

### Infrastructure
- **Databases:** PostgreSQL (user_service, verification_service), MongoDB (content_service), Elasticsearch (search_service)
- **Messaging:** RabbitMQ for event-driven communication between services
- **Containerization:** Docker for all services
- **Future:** Kubernetes orchestration on AWS EKS

### Event-Driven Architecture
Services communicate asynchronously via RabbitMQ:
1. **ContentCreated** events: Published by content_service, consumed by verification_service and search_service
2. **StatusUpdated** events: Future enhancement for real-time status updates

## Getting Started

### Prerequisites
- Python 3.11+ (for backend services)
- Node.js 18+ (for frontend)
- MongoDB 6.0+
- PostgreSQL 14+
- Elasticsearch 8.x
- RabbitMQ 3.x

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/MachariaP/VeridiaApp.git
   cd VeridiaApp
   ```

2. Verify your setup (recommended):
   ```bash
   chmod +x verify-setup.sh
   ./verify-setup.sh
   ```
   This checks if your environment is properly configured.

3. Start backend services (each in a separate terminal):
   ```bash
   # User Service (Port 8000)
   cd user_service
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   
   # Content Service (Port 8001)
   cd content_service
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8001
   
   # Verification Service (Port 8002)
   cd verification_service
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8002
   
   # Search Service (Port 8003)
   cd search_service
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8003
   ```

4. Start frontend:
   ```bash
   cd frontend_app
   npm install
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - User Service API: http://localhost:8000/docs
   - Content Service API: http://localhost:8001/docs
   - Verification Service API: http://localhost:8002/docs
   - Search Service API: http://localhost:8003/docs

### Configuration & Setup Guides

📚 **Setup Documentation:**
- **[SETUP.md](./SETUP.md)** - Complete setup guide for all services
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables configuration guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions to common problems

📖 **Service Documentation:**
- **user_service**: [user_service/README.md](user_service/README.md)
- **content_service**: [content_service/README.md](content_service/README.md)
- **verification_service**: [verification_service/README.md](verification_service/README.md)
- **search_service**: [search_service/README.md](search_service/README.md)
- **frontend_app**: [frontend_app/README.md](frontend_app/README.md)

## Key Technologies

### Backend
- **FastAPI**: Modern, fast web framework for Python APIs
- **Pydantic**: Data validation and settings management
- **SQLAlchemy**: SQL toolkit and ORM for PostgreSQL
- **PyMongo**: MongoDB driver for Python
- **Elasticsearch**: Search and analytics engine
- **RabbitMQ/Pika**: Message broker and Python client
- **JWT (python-jose)**: Authentication tokens
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework

### Databases
- **PostgreSQL**: Structured data (users, votes, comments)
- **MongoDB**: Unstructured content data
- **Elasticsearch**: Full-text search and indexing

### Infrastructure
- **Docker**: Containerization for all services
- **RabbitMQ**: Event-driven messaging
- **Git**: Version control
- **Future**: Kubernetes, AWS EKS, CI/CD pipelines

## Features Implemented

### MVP Features ✅
- [x] User authentication and registration
- [x] JWT-based secure authentication with refresh token support
- [x] Protected dashboard with user profile
- [x] Content submission and management with comprehensive validation
- [x] Community voting system (verified/disputed)
- [x] Discussion comments on content
- [x] AI verification stub (ready for ML integration)
- [x] Full-text search with Elasticsearch
- [x] Category filtering and sorting
- [x] Event-driven microservices architecture
- [x] Mobile-first responsive design
- [x] Real-time content indexing
- [x] RESTful APIs with OpenAPI documentation

### Security & Compliance Features ✅ NEW
- [x] **RBAC**: Role-based access control (Standard User, Verified Contributor, Moderator)
- [x] **Audit Logging**: Non-repudiable tracking of critical operations
- [x] **GDPR Compliance**: Data export and account deletion endpoints
- [x] **Enhanced Security**: Refresh token rotation, Argon2 password hashing
- [x] **Content Validation**: URL checking, title/description validation, category verification
- [x] **Content Versioning**: Status history and edit tracking for transparency
- [x] **Notification System**: Multi-channel notification stub (in-app, email, push)

### Enhanced Verification System ✅ NEW
- [x] **Threshold-Based Status**: 85% verified with 50+ votes for "Verified" status
- [x] **Disputed Detection**: 35% disputed votes triggers "Disputed" status
- [x] **Status Calculation**: Automatic status updates based on vote thresholds
- [x] **AI Enhancement**: ML training feedback loop for continuous improvement
- [x] **Transparency Log**: Complete status change history with triggers

### Design System & UX ✅ ENHANCED
- [x] Comprehensive design system with 150+ design tokens
- [x] Modern color palette (Primary Blue #0A7FFF, Teal #00B5B8)
- [x] Professional typography (Inter + JetBrains Mono)
- [x] 20+ GPU-accelerated animations (60 FPS)
- [x] Skeleton screens with shimmer loading effects
- [x] Mobile bottom navigation with SVG icons (iOS/Android style)
- [x] Sticky header with scroll effects
- [x] Enhanced cards with hover lift effects
- [x] Status badges with icons (✓ Verified, ⚠ Disputed, ⏱ Pending, ✨ AI)
- [x] Dark mode support with proper contrast
- [x] Accessibility features (keyboard navigation, focus indicators, tooltips)
- [x] F-pattern and Z-pattern layouts
- [x] 30+ SVG icon system (navigation, actions, status, content)
- [x] Toast notification system
- [x] Modal dialog component with focus trap
- [x] Tooltip component with position control
- [x] Empty state components with illustrations
- [x] Micro-interactions (vote animations, bookmark effects, heart beat)
- [x] Hero section with animated background patterns
- [x] Stats dashboard with metrics
- [x] Comprehensive documentation (70KB+ across 4 guides)

### User Workflows

**1. Registration and Login**
- Users register with username, email, and password
- Secure password hashing with bcrypt
- JWT token authentication
- Automatic redirect to dashboard after login

**2. Content Submission**
- Authenticated users can submit content for verification
- Title, source URL, description, and category required
- Automatic event publishing to verification and search services
- Content status: "Pending Verification" initially

**3. Content Verification**
- AI verification check performed automatically (stub with enhanced analysis)
- Community members vote (verified/disputed)
- Real-time vote statistics with calculated status displayed
- **Status Thresholds**:
  - **Verified** (✓): 85% verified votes AND total > 50
  - **Disputed** (⚠): 35% disputed votes OR moderator flag
  - **Under Review**: 50+ votes but doesn't meet verified threshold
  - **Pending Verification** (⏱): Less than 50 votes
- Automatic status updates when thresholds are met
- Transparent status change log for accountability
- Status updates based on voting thresholds

**4. Community Discussions**
- Authenticated users can comment on content
- Comments displayed in chronological order
- Username and timestamp for each comment

**5. Content Discovery**
- Full-text search across all content
- Filter by category
- Sort by relevance or date
- Pagination support
- Fuzzy matching for typos

## Contributing
Contributions are welcome! Please read our CONTRIBUTING.md (coming soon) for guidelines.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
