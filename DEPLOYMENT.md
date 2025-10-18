# VeridiaApp Deployment Guide

Complete guide for deploying VeridiaApp's microservices architecture.

## Architecture Overview

VeridiaApp consists of 5 independent microservices:

1. **User Service** (Port 8000) - Authentication & Authorization
2. **Content Service** (Port 8001) - Content Submission & Management
3. **Search Service** (Port 8002) - Elasticsearch-powered Search
4. **Voting Service** (Port 8003) - Community Voting System
5. **Comment Service** (Port 8004) - Discussion Threads

## Prerequisites

### For Docker Deployment
- Docker 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB disk space

### For Manual Deployment
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- MongoDB 7+
- Elasticsearch 8.11+

## Quick Start with Docker Compose

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/MachariaP/VeridiaApp.git
cd VeridiaApp

# Create environment files from examples
cp user_service/.env.example user_service/.env
cp content_service/.env.example content_service/.env
cp search_service/.env.example search_service/.env
cp voting_service/.env.example voting_service/.env
cp comment_service/.env.example comment_service/.env

# IMPORTANT: Set a secure JWT_SECRET_KEY in all .env files
# The same key must be used across all services
```

### 2. Start All Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### 3. Verify Services

```bash
# User Service
curl http://localhost:8000/health

# Content Service
curl http://localhost:8001/health

# Search Service
curl http://localhost:8002/health

# Voting Service
curl http://localhost:8003/health

# Comment Service
curl http://localhost:8004/health
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

## Service-by-Service Deployment

### User Service (Port 8000)

```bash
cd user_service

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start database
docker-compose up -d db

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API Documentation: http://localhost:8000/docs

### Content Service (Port 8001)

```bash
cd content_service

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB
docker-compose up -d mongodb

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

API Documentation: http://localhost:8001/docs

### Search Service (Port 8002)

```bash
cd search_service

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start Elasticsearch
docker-compose up -d elasticsearch

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

API Documentation: http://localhost:8002/docs

### Voting Service (Port 8003)

```bash
cd voting_service

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start database
docker-compose up -d db

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

API Documentation: http://localhost:8003/docs

### Comment Service (Port 8004)

```bash
cd comment_service

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start database
docker-compose up -d db

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

API Documentation: http://localhost:8004/docs

## Environment Configuration

### Critical Settings

All services must share the same `JWT_SECRET_KEY`:

```env
JWT_SECRET_KEY=your-very-secure-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
```

### Database URLs

Each service uses its own database:

```env
# User Service
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/veridiapp_users

# Content Service
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=veridiapp_content_db

# Search Service
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=content_index

# Voting Service
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/veridiapp_votes

# Comment Service
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/veridiapp_comments
```

## Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET_KEY (minimum 32 characters)
- [ ] Enable HTTPS/TLS on all services
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable monitoring and logging
- [ ] Use environment-specific .env files
- [ ] Implement rate limiting
- [ ] Enable CORS only for trusted domains
- [ ] Use managed database services

### Recommended Cloud Setup

#### AWS Deployment

```
- EC2 instances for microservices (or ECS/EKS)
- RDS for PostgreSQL databases
- DocumentDB for MongoDB
- Amazon Elasticsearch Service
- Application Load Balancer
- S3 for file uploads
- CloudWatch for monitoring
```

#### GCP Deployment

```
- Cloud Run or GKE for microservices
- Cloud SQL for PostgreSQL
- MongoDB Atlas
- Elastic Cloud
- Cloud Load Balancing
- Cloud Storage for file uploads
- Cloud Monitoring
```

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Push to registry
docker-compose -f docker-compose.prod.yml push

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Database Migrations

### Creating New Migrations

```bash
# User Service
cd user_service
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head

# Voting Service
cd voting_service
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head

# Comment Service
cd comment_service
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### Rollback Migrations

```bash
# Rollback one version
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>

# Rollback all
alembic downgrade base
```

## Monitoring and Logging

### Health Checks

All services expose health check endpoints:

```bash
GET /health
```

### Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user_service

# View last 100 lines
docker-compose logs --tail=100 search_service
```

### Metrics

Consider integrating:
- Prometheus for metrics collection
- Grafana for visualization
- ELK Stack for log aggregation
- Sentry for error tracking

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service_name>

# Check if port is already in use
netstat -tulpn | grep <port>

# Restart service
docker-compose restart <service_name>
```

### Database Connection Issues

```bash
# Test database connectivity
docker-compose exec user_db psql -U postgres -c "SELECT 1;"
docker-compose exec content_db mongosh --eval "db.adminCommand('ping')"

# Check if service can reach database
docker-compose exec user_service ping user_db
```

### JWT Token Issues

Ensure all services use the same JWT_SECRET_KEY:
```bash
grep JWT_SECRET_KEY *_service/.env
```

## Scaling

### Horizontal Scaling

```bash
# Scale a service
docker-compose up -d --scale user_service=3

# With load balancer
# Use nginx or traefik to distribute requests
```

### Database Scaling

- **PostgreSQL**: Use read replicas, connection pooling (PgBouncer)
- **MongoDB**: Enable replication and sharding
- **Elasticsearch**: Add more nodes to the cluster

## Backup and Recovery

### Database Backups

```bash
# PostgreSQL backup
docker-compose exec user_db pg_dump -U postgres veridiapp_users > backup_users.sql

# MongoDB backup
docker-compose exec content_db mongodump --out=/backup

# Restore PostgreSQL
docker-compose exec -T user_db psql -U postgres veridiapp_users < backup_users.sql

# Restore MongoDB
docker-compose exec content_db mongorestore /backup
```

### Automated Backups

Set up cron jobs or use cloud provider backup services:
- AWS RDS automated backups
- GCP Cloud SQL automated backups
- MongoDB Atlas continuous backups

## Testing

### Run Tests

```bash
# User Service
cd user_service
pytest

# Content Service
cd content_service
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

### Integration Testing

```bash
# Start all services
docker-compose up -d

# Run integration tests
python tests/integration_test.py
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/MachariaP/VeridiaApp/issues
- Documentation: Each service has its own README.md
- API Docs: Available at /docs endpoint for each service

## License

MIT License - See LICENSE file for details
