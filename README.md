# VeridiaApp: Empowering Truth-Seekers in a World of Information Overload

VeridiaApp is a dynamic, mobile-first platform designed for truth-seekers, researchers, and content creators. It enables users to create, share, and discover verified, AI-assisted content through a community-driven ecosystem. Built with a microservices architecture and a headless approach, VeridiaApp ensures scalability, flexibility, and resilience while prioritizing user privacy, content verification, and seamless integration with emerging technologies.

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
- MongoDB 6.0+ (optional - defaults to in-memory storage)
- PostgreSQL 14+ (optional - defaults to SQLite)
- Elasticsearch 8.x (optional - defaults to in-memory storage)
- RabbitMQ 3.x (optional - currently stubbed)

**Note:** Most external services are optional. The application can run with just Python and Node.js installed, using SQLite for databases and in-memory storage for other services.

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/MachariaP/VeridiaApp.git
   cd VeridiaApp
   ```

2. Start backend services (each in a separate terminal):
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

3. Start frontend:
   ```bash
   cd frontend_app
   npm install
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - User Service API: http://localhost:8000/docs
   - Content Service API: http://localhost:8001/docs
   - Verification Service API: http://localhost:8002/docs
   - Search Service API: http://localhost:8003/docs

### Troubleshooting

**Unable to login after registration?** 
👉 See [QUICK_FIX.md](QUICK_FIX.md) for immediate solution

**Database configuration help?**
👉 See [DATABASE_SETUP.md](DATABASE_SETUP.md) for complete guide

**General setup issues?**
👉 See [SETUP.md](SETUP.md) for detailed instructions

### Detailed Setup
For detailed setup instructions for each service:
- **user_service**: See [user_service/README.md](user_service/README.md)
- **content_service**: See [content_service/README.md](content_service/README.md)
- **verification_service**: See [verification_service/README.md](verification_service/README.md)
- **search_service**: See [search_service/README.md](search_service/README.md)
- **frontend_app**: See [frontend_app/README.md](frontend_app/README.md)

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
- [x] JWT-based secure authentication
- [x] Protected dashboard with user profile
- [x] Content submission and management
- [x] Community voting system (verified/disputed)
- [x] Discussion comments on content
- [x] AI verification stub (ready for ML integration)
- [x] Full-text search with Elasticsearch
- [x] Category filtering and sorting
- [x] Event-driven microservices architecture
- [x] Mobile-first responsive design
- [x] Real-time content indexing
- [x] RESTful APIs with OpenAPI documentation

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
- AI verification check performed automatically (stub)
- Community members vote (verified/disputed)
- Real-time vote statistics displayed
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
