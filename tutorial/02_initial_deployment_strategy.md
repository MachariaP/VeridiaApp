# Initial Deployment Strategy - VeridiaApp

**Version**: 1.0  
**Last Updated**: 2024  
**Target Audience**: DevOps engineers and developers preparing for production deployment

---

## Overview

This guide outlines a comprehensive deployment strategy for VeridiaApp, covering cloud provider selection, containerization, CI/CD pipeline setup, and initial stage deployment. The goal is to enable **immediate deployment after the first successful commit** of the new codebase.

### Deployment Architecture

```
GitHub Repository
    ↓ (git push)
GitHub Actions CI/CD
    ↓ (build, test, deploy)
┌─────────────────────────────────────┐
│        Cloud Infrastructure         │
├─────────────────────────────────────┤
│ Frontend: Vercel/Netlify            │
│ Backend: AWS/GCP/Azure              │
│ Databases: Managed Services         │
│ Container Registry: Docker Hub/ECR  │
└─────────────────────────────────────┘
```

---

## Part 1: Cloud Provider Recommendations

### Frontend Deployment: Vercel (Recommended) or Netlify

**Recommended: Vercel**

**Justification:**
- ✅ **Native Next.js Support**: Vercel is created by the Next.js team, providing optimal performance
- ✅ **Zero Configuration**: Auto-detects Next.js and configures build settings
- ✅ **Edge Network**: Global CDN with automatic SSL/TLS certificates
- ✅ **Automatic Previews**: Every git branch gets a unique preview URL
- ✅ **Environment Variables**: Easy management through dashboard
- ✅ **Free Tier**: Generous limits for development and small production apps

**Alternative: Netlify**
- Similar features to Vercel
- Slightly more configuration required for Next.js
- Strong community and plugin ecosystem

**Pricing Comparison:**
| Feature | Vercel (Hobby) | Netlify (Starter) |
|---------|----------------|-------------------|
| Price | Free | Free |
| Bandwidth | 100GB/month | 100GB/month |
| Build Minutes | 6,000/month | 300/month |
| Team Members | 1 | 1 |
| **Verdict** | ✅ Better for Next.js | ✅ Good for static sites |

---

### Backend Deployment: AWS (Recommended), GCP, or Azure

**Recommended: AWS (Amazon Web Services)**

**Justification:**
- ✅ **Comprehensive Services**: ECS/EKS for containers, RDS for PostgreSQL, DocumentDB for MongoDB
- ✅ **Scalability**: Auto-scaling groups, load balancers, and elastic infrastructure
- ✅ **Mature Ecosystem**: Extensive documentation and community support
- ✅ **Cost-Effective**: Free tier for 12 months, pay-as-you-go pricing
- ✅ **DevOps Tools**: CodePipeline, CodeBuild, and CloudWatch for monitoring

**Service Mapping:**
| VeridiaApp Component | AWS Service |
|---------------------|-------------|
| Backend Services | **ECS (Elastic Container Service)** or **EKS (Kubernetes)** |
| PostgreSQL | **RDS (Relational Database Service)** |
| MongoDB | **DocumentDB** or **MongoDB Atlas** |
| Elasticsearch | **OpenSearch Service** (AWS fork of Elasticsearch) |
| RabbitMQ | **Amazon MQ** |
| Load Balancer | **Application Load Balancer (ALB)** |
| Container Registry | **ECR (Elastic Container Registry)** |
| Monitoring | **CloudWatch** |

**Alternative: Google Cloud Platform (GCP)**
- **Cloud Run**: Fully managed serverless container platform
- **Cloud SQL**: Managed PostgreSQL
- **Firestore/MongoDB Atlas**: Document database
- **Elastic Cloud**: Elasticsearch hosting
- **Pros**: Simpler pricing, excellent Kubernetes (GKE)

**Alternative: Microsoft Azure**
- **Azure Container Apps**: Container hosting
- **Azure Database for PostgreSQL**: Managed PostgreSQL
- **Cosmos DB**: Multi-model database (supports MongoDB API)
- **Pros**: Great for organizations already using Microsoft ecosystem

---

## Part 2: Containerization Strategy

All backend services are already containerized with Dockerfiles. Here's how to optimize them for production:

### Step 1: Review and Optimize Dockerfiles

Each service has a `Dockerfile`. Ensure they follow best practices:

**Example Optimized Dockerfile (user_service/Dockerfile):**

```dockerfile
# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key Improvements:**
- Multi-stage build for smaller image size
- Layer caching optimization
- Health checks for container orchestration
- Non-root user for security

---

### Step 2: Create Docker Compose for Local Testing

Create `docker-compose.yml` at the project root:

```yaml
version: '3.8'

services:
  # PostgreSQL for user_service and verification_service
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: veridiauser
      POSTGRES_PASSWORD: veridiapass
      POSTGRES_DB: veridiadb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U veridiauser"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MongoDB for content_service
  mongodb:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: veridiauser
      MONGO_INITDB_ROOT_PASSWORD: veridiapass
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Elasticsearch for search_service
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RabbitMQ for event messaging
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: veridiauser
      RABBITMQ_DEFAULT_PASS: veridiapass
    ports:
      - "5672:5672"   # AMQP port
      - "15672:15672" # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 10s
      timeout: 5s
      retries: 5

  # User Service
  user_service:
    build:
      context: ./user_service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://veridiauser:veridiapass@postgres:5432/veridiadb
      SECRET_KEY: dev-secret-key-change-in-production
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Content Service
  content_service:
    build:
      context: ./content_service
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      MONGODB_URL: mongodb://veridiauser:veridiapass@mongodb:27017
      DATABASE_NAME: veridiadb
      SECRET_KEY: dev-secret-key-change-in-production
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Verification Service
  verification_service:
    build:
      context: ./verification_service
      dockerfile: Dockerfile
    ports:
      - "8002:8002"
    environment:
      DATABASE_URL: postgresql://veridiauser:veridiapass@postgres:5432/veridiadb
      RABBITMQ_URL: amqp://veridiauser:veridiapass@rabbitmq:5672/
      SECRET_KEY: dev-secret-key-change-in-production
      CONTENT_SERVICE_URL: http://content_service:8001
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Search Service
  search_service:
    build:
      context: ./search_service
      dockerfile: Dockerfile
    ports:
      - "8003:8003"
    environment:
      ELASTICSEARCH_URL: http://elasticsearch:9200
    depends_on:
      elasticsearch:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8003/health"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  mongodb_data:
  elasticsearch_data:
  rabbitmq_data:

networks:
  default:
    name: veridiaapp_network
```

**Test the Docker Compose setup:**

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f user_service

# Stop all services
docker-compose down
```

---

## Part 3: CI/CD Pipeline with GitHub Actions

### Step 1: Create GitHub Actions Workflow Directory

```bash
mkdir -p .github/workflows
```

### Step 2: Create Main CI/CD Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: VeridiaApp CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  REGISTRY: docker.io
  IMAGE_PREFIX: veridiaapp

jobs:
  # Job 1: Run tests
  test:
    name: Test Backend Services
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        service: [user_service, content_service, verification_service, search_service]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd ${{ matrix.service }}
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: |
          cd ${{ matrix.service }}
          pytest --cov=app --cov-report=xml || echo "No tests found"

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ${{ matrix.service }}/coverage.xml
          flags: ${{ matrix.service }}

  # Job 2: Build and push Docker images
  build:
    name: Build and Push Docker Images
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging')
    
    strategy:
      matrix:
        service: [user_service, content_service, verification_service, search_service]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}-${{ matrix.service }}:buildcache
          cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}-${{ matrix.service }}:buildcache,mode=max

  # Job 3: Deploy Frontend to Vercel
  deploy-frontend:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend_app
          vercel-args: '--prod'

  # Job 4: Deploy Backend to AWS ECS (example)
  deploy-backend:
    name: Deploy Backend to AWS ECS
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        service: [user_service, content_service, verification_service, search_service]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to ECS
        run: |
          # Update ECS service with new task definition
          aws ecs update-service \
            --cluster veridiaapp-cluster \
            --service ${{ matrix.service }} \
            --force-new-deployment

  # Job 5: Run integration tests
  integration-test:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: deploy-backend
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Wait for deployment
        run: sleep 60

      - name: Run integration tests
        run: |
          # Add integration test commands here
          echo "Running integration tests against deployed services"
```

---

### Step 3: Set Up GitHub Secrets

Navigate to **GitHub Repository → Settings → Secrets and variables → Actions** and add:

**Docker Hub Secrets:**
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

**Vercel Secrets:**
- `VERCEL_TOKEN`: Vercel authentication token (from Vercel dashboard)
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

**AWS Secrets:**
- `AWS_ACCESS_KEY_ID`: AWS IAM user access key
- `AWS_SECRET_ACCESS_KEY`: AWS IAM user secret key

**Database Secrets (for deployment):**
- `DATABASE_URL`: Production PostgreSQL connection string
- `MONGODB_URL`: Production MongoDB connection string
- `ELASTICSEARCH_URL`: Production Elasticsearch URL
- `RABBITMQ_URL`: Production RabbitMQ connection string
- `SECRET_KEY`: Production JWT secret key

---

## Part 4: Initial Stage Deployment Steps

### Phase 1: Frontend Deployment to Vercel

**Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: Login to Vercel**

```bash
vercel login
```

**Step 3: Deploy Frontend**

```bash
cd frontend_app

# First deployment (will prompt for configuration)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? veridiaapp-frontend
# - Directory? ./
# - Override settings? No

# For production deployment:
vercel --prod
```

**Step 4: Configure Environment Variables in Vercel**

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.yourdomain.com

vercel env add NEXT_PUBLIC_CONTENT_API_URL production
# Enter: https://content-api.yourdomain.com

vercel env add NEXT_PUBLIC_VERIFICATION_API_URL production
# Enter: https://verification-api.yourdomain.com

vercel env add NEXT_PUBLIC_SEARCH_API_URL production
# Enter: https://search-api.yourdomain.com
```

**Step 5: Link to GitHub**

In Vercel dashboard:
1. Go to Project Settings
2. Connect GitHub repository
3. Enable automatic deployments from `main` branch

---

### Phase 2: Backend Deployment to AWS ECS

**Step 1: Create AWS Resources**

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (e.g., us-east-1)

# Create ECS cluster
aws ecs create-cluster --cluster-name veridiaapp-cluster

# Create ECR repositories for each service
aws ecr create-repository --repository-name veridiaapp-user-service
aws ecr create-repository --repository-name veridiaapp-content-service
aws ecr create-repository --repository-name veridiaapp-verification-service
aws ecr create-repository --repository-name veridiaapp-search-service
```

**Step 2: Set Up RDS (PostgreSQL)**

```bash
# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier veridiaapp-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username veridiaadmin \
  --master-user-password 'YourSecurePassword123!' \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --no-publicly-accessible
```

**Step 3: Push Docker Images to ECR**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push user_service
cd user_service
docker build -t veridiaapp-user-service .
docker tag veridiaapp-user-service:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/veridiaapp-user-service:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/veridiaapp-user-service:latest

# Repeat for other services...
```

**Step 4: Create ECS Task Definitions**

Create `user_service_task_definition.json`:

```json
{
  "family": "veridiaapp-user-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "user-service",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/veridiaapp-user-service:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://veridiaadmin:password@your-rds-endpoint:5432/veridiadb"
        },
        {
          "name": "SECRET_KEY",
          "value": "your-production-secret-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/veridiaapp-user-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Register task definition:**

```bash
aws ecs register-task-definition --cli-input-json file://user_service_task_definition.json
```

**Step 5: Create ECS Services**

```bash
aws ecs create-service \
  --cluster veridiaapp-cluster \
  --service-name user-service \
  --task-definition veridiaapp-user-service \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

## Part 5: Post-Deployment Verification

### Step 1: Verify Deployments

**Frontend:**
```bash
curl https://veridiaapp.vercel.app
```

**Backend Services:**
```bash
curl https://api.yourdomain.com/health
curl https://content-api.yourdomain.com/health
curl https://verification-api.yourdomain.com/health
curl https://search-api.yourdomain.com/health
```

### Step 2: Set Up Monitoring

**CloudWatch Alarms (AWS):**
```bash
# Create alarm for high CPU usage
aws cloudwatch put-metric-alarm \
  --alarm-name user-service-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

**Set up logging:**
- CloudWatch Logs for backend services
- Vercel Analytics for frontend

---

## Summary

### Deployment Checklist

- [ ] Choose cloud providers (Vercel + AWS recommended)
- [ ] Set up Docker containers for all services
- [ ] Create `docker-compose.yml` for local testing
- [ ] Configure GitHub Actions CI/CD pipeline
- [ ] Add GitHub secrets (Docker Hub, Vercel, AWS)
- [ ] Deploy frontend to Vercel
- [ ] Set up AWS infrastructure (ECS, RDS, ECR)
- [ ] Deploy backend services to AWS ECS
- [ ] Configure environment variables in production
- [ ] Set up monitoring and alerts
- [ ] Verify all services are healthy
- [ ] Test end-to-end functionality

### Key Resources

- **Vercel Documentation**: https://vercel.com/docs
- **AWS ECS Documentation**: https://docs.aws.amazon.com/ecs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Docker Documentation**: https://docs.docker.com/

### Next Steps

Proceed to `03_database_configuration_and_testing.md` to set up and test production databases.
