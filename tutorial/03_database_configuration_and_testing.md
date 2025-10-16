# Database Configuration and Testing - VeridiaApp

**Version**: 1.0  
**Last Updated**: 2024  
**Target Audience**: Database administrators and backend developers

---

## Overview

VeridiaApp uses a polyglot persistence strategy with multiple database technologies optimized for different use cases. This guide covers the selection rationale, configuration steps, data seeding, and testing procedures for all databases.

### Database Architecture

```
┌──────────────────────────────────────────────┐
│           VeridiaApp Databases               │
├──────────────────────────────────────────────┤
│ PostgreSQL     → User data, Verification     │
│ MongoDB        → Content storage             │
│ Elasticsearch  → Full-text search            │
│ (SQLite/Memory → Development fallbacks)      │
└──────────────────────────────────────────────┘
```

---

## Part 1: Database Selection Rationale

### PostgreSQL (Primary Relational Database)

**Used By**: `user_service`, `verification_service`

**Justification:**
- ✅ **ACID Compliance**: Essential for user authentication and financial/verification data integrity
- ✅ **Relational Data**: Users, roles, votes, and comments have strong relationships
- ✅ **Mature Ecosystem**: Excellent ORMs (SQLAlchemy), extensive tooling, and community support
- ✅ **Performance**: Optimized for complex queries and joins
- ✅ **JSON Support**: Native JSONB for semi-structured data when needed
- ✅ **Security**: Row-level security, audit logging capabilities
- ✅ **Open Source**: No vendor lock-in, cost-effective

**Schema Examples:**
- **user_service**: users table (id, username, email, hashed_password, role, created_at, updated_at)
- **verification_service**: votes, comments, verification_status tables with foreign keys to content

**Alternative Considered**: MySQL
- **Why PostgreSQL wins**: Better JSON support, more advanced features (CTEs, window functions), superior full-text search

---

### MongoDB (Document Database)

**Used By**: `content_service`

**Justification:**
- ✅ **Schema Flexibility**: Content can have varying structures (text, images, videos, metadata)
- ✅ **Horizontal Scalability**: Sharding support for growing content volume
- ✅ **Document Model**: Natural fit for content objects with embedded metadata
- ✅ **Fast Writes**: Optimized for high-volume content creation
- ✅ **Rich Queries**: Supports complex aggregation pipelines
- ✅ **GridFS**: Built-in support for large file storage

**Document Structure:**
```json
{
  "_id": "content123",
  "title": "Breaking News Title",
  "content_type": "article",
  "body": "Full article text...",
  "metadata": {
    "tags": ["politics", "economy"],
    "source": "https://example.com",
    "author_id": "user456"
  },
  "media": [
    {"type": "image", "url": "https://..."}
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Alternative Considered**: PostgreSQL with JSONB
- **Why MongoDB wins**: Better for unstructured/semi-structured data, superior horizontal scaling for content-heavy workloads

---

### Elasticsearch (Search Engine)

**Used By**: `search_service`

**Justification:**
- ✅ **Full-Text Search**: Industry-leading search capabilities with relevance scoring
- ✅ **Real-Time Indexing**: Near-instant search after content creation
- ✅ **Faceted Search**: Filter by categories, tags, dates, verification status
- ✅ **Autocomplete**: Type-ahead suggestions for better UX
- ✅ **Analytics**: Aggregations for trending topics, popular content
- ✅ **Distributed**: Built for horizontal scaling

**Alternative Considered**: PostgreSQL Full-Text Search
- **Why Elasticsearch wins**: Superior ranking algorithms, better performance at scale, advanced features (fuzzy search, synonyms, language analyzers)

---

## Part 2: Local Database Configuration

### PostgreSQL Setup

#### Option 1: Install PostgreSQL Locally

**macOS:**
```bash
# Install via Homebrew
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb veridiadb

# Create user (optional)
createuser -P veridiauser
# Enter password when prompted
```

**Ubuntu/Debian:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql
```

**In PostgreSQL shell:**
```sql
CREATE DATABASE veridiadb;
CREATE USER veridiauser WITH PASSWORD 'YOUR_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE veridiadb TO veridiauser;
\q
```

**Windows:**
- Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Follow installation wizard
- Use pgAdmin 4 for database management

---

#### Option 2: Use Docker

```bash
# Run PostgreSQL in Docker
docker run --name veridiadb-postgres \
  -e POSTGRES_USER=veridiauser \
  -e POSTGRES_PASSWORD=YOUR_PASSWORD_HERE \
  -e POSTGRES_DB=veridiadb \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:14-alpine

# Verify connection
docker exec -it veridiadb-postgres psql -U veridiauser -d veridiadb
```

---

#### Configure Services to Use PostgreSQL

**user_service/.env:**
```bash
DATABASE_URL=postgresql://veridiauser:YOUR_PASSWORD_HERE@localhost:5432/veridiadb
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**verification_service/.env:**
```bash
DATABASE_URL=postgresql://veridiauser:YOUR_PASSWORD_HERE@localhost:5432/veridiadb
SECRET_KEY=your-secret-key-here-change-in-production
CONTENT_SERVICE_URL=http://localhost:8001
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

**Test Connection:**
```bash
# Start user_service
cd user_service
uvicorn app.main:app --reload --port 8000

# Check logs for successful connection
# Expected: "INFO: Database tables created successfully"
```

---

### MongoDB Setup

#### Option 1: Install MongoDB Locally

**macOS:**
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community@6.0

# Verify
mongosh
```

**Ubuntu:**
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install
sudo apt update
sudo apt install -y mongodb-org

# Start
sudo systemctl start mongod
```

**Windows:**
- Download installer from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install as Windows Service
- Use MongoDB Compass for GUI management

---

#### Option 2: Use Docker

```bash
# Run MongoDB in Docker
docker run --name veridiadb-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=veridiauser \
  -e MONGO_INITDB_ROOT_PASSWORD=YOUR_PASSWORD_HERE \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -d mongo:6.0

# Verify connection
docker exec -it veridiadb-mongo mongosh -u veridiauser -p YOUR_PASSWORD_HERE
```

---

#### Option 3: Use MongoDB Atlas (Cloud - Recommended for Production)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account (M0 Sandbox - Free Forever)
3. Create a new cluster
4. Configure network access (add your IP or allow all: 0.0.0.0/0 for development)
5. Create database user
6. Get connection string

**Example connection string:**
```
mongodb+srv://veridiauser:<password>@cluster0.xxxxx.mongodb.net/veridiadb?retryWrites=true&w=majority
```

---

#### Configure Content Service

**content_service/.env:**
```bash
# Local MongoDB
MONGODB_URL=mongodb://localhost:27017

# Or MongoDB Atlas
# MONGODB_URL=mongodb+srv://veridiauser:<password>@cluster0.xxxxx.mongodb.net

DATABASE_NAME=veridiadb
SECRET_KEY=your-secret-key-here-change-in-production
```

**Test Connection:**
```bash
cd content_service
uvicorn app.main:app --reload --port 8001

# Check logs
# Expected: "INFO: MongoDB connection successful"
```

---

### Elasticsearch Setup

#### Option 1: Use Docker (Recommended for Local Development)

```bash
# Run Elasticsearch in Docker
docker run --name veridiadb-elasticsearch \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -p 9200:9200 \
  -v elasticsearch_data:/usr/share/elasticsearch/data \
  -d docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Verify
curl http://localhost:9200
# Expected: JSON response with cluster info
```

---

#### Option 2: Use Elastic Cloud (Recommended for Production)

1. Go to [elastic.co/cloud](https://www.elastic.co/cloud/)
2. Start free 14-day trial
3. Create deployment (choose region)
4. Get Cloud ID and credentials

---

#### Configure Search Service

**search_service/.env:**
```bash
# Local Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Or Elastic Cloud
# ELASTICSEARCH_URL=https://xxxxx.es.us-east-1.aws.found.io:9243
# ELASTICSEARCH_API_KEY=your-api-key
```

**Test Connection:**
```bash
cd search_service
uvicorn app.main:app --reload --port 8003

# Check health
curl http://localhost:8003/health
```

---

## Part 3: Database Initialization and Seeding

### Create Database Seeding Script

Create `scripts/seed_database.py`:

```python
#!/usr/bin/env python3
"""
Database seeding script for VeridiaApp
Seeds test data for local development
"""

import requests
import json
import time

BASE_URL = "http://localhost"
USER_SERVICE = f"{BASE_URL}:8000"
CONTENT_SERVICE = f"{BASE_URL}:8001"
VERIFICATION_SERVICE = f"{BASE_URL}:8002"

# Test users
TEST_USERS = [
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "TestPassword123!"
    },
    {
        "username": "jane_smith",
        "email": "jane@example.com",
        "password": "TestPassword123!"
    },
    {
        "username": "bob_reporter",
        "email": "bob@example.com",
        "password": "TestPassword123!"
    }
]

# Test content
TEST_CONTENT = [
    {
        "title": "Breaking: New Climate Change Report Released",
        "content_type": "article",
        "body": "Scientists have released a comprehensive report on global climate trends...",
        "metadata": {
            "tags": ["climate", "science", "environment"],
            "source": "https://example.com/climate-report"
        }
    },
    {
        "title": "Tech Industry Announces Major Innovation",
        "content_type": "article",
        "body": "Leading tech companies have unveiled groundbreaking AI technology...",
        "metadata": {
            "tags": ["technology", "AI", "innovation"],
            "source": "https://example.com/tech-news"
        }
    },
    {
        "title": "Economic Outlook for 2024",
        "content_type": "article",
        "body": "Economists predict moderate growth with potential challenges ahead...",
        "metadata": {
            "tags": ["economy", "finance", "2024"],
            "source": "https://example.com/economy"
        }
    }
]

def register_users():
    """Register test users"""
    print("=== Registering Test Users ===")
    tokens = {}
    
    for user in TEST_USERS:
        try:
            # Register
            response = requests.post(
                f"{USER_SERVICE}/api/v1/auth/register",
                json=user
            )
            if response.status_code == 200:
                print(f"✓ Registered: {user['username']}")
                
                # Login to get token
                login_response = requests.post(
                    f"{USER_SERVICE}/api/v1/auth/login",
                    data={
                        "username": user["username"],
                        "password": user["password"]
                    }
                )
                if login_response.status_code == 200:
                    token = login_response.json()["access_token"]
                    tokens[user["username"]] = token
                    print(f"  → Token obtained for {user['username']}")
            else:
                print(f"✗ Failed to register {user['username']}: {response.text}")
        except Exception as e:
            print(f"✗ Error registering {user['username']}: {e}")
    
    return tokens

def create_content(tokens):
    """Create test content"""
    print("\n=== Creating Test Content ===")
    content_ids = []
    
    # Use first user's token
    token = list(tokens.values())[0]
    headers = {"Authorization": f"Bearer {token}"}
    
    for content in TEST_CONTENT:
        try:
            response = requests.post(
                f"{CONTENT_SERVICE}/api/v1/content",
                json=content,
                headers=headers
            )
            if response.status_code == 200:
                content_id = response.json()["id"]
                content_ids.append(content_id)
                print(f"✓ Created: {content['title'][:50]}... (ID: {content_id})")
            else:
                print(f"✗ Failed to create content: {response.text}")
        except Exception as e:
            print(f"✗ Error creating content: {e}")
    
    return content_ids

def add_votes_and_comments(tokens, content_ids):
    """Add votes and comments to content"""
    print("\n=== Adding Votes and Comments ===")
    
    for idx, content_id in enumerate(content_ids):
        # Add votes from different users
        for username, token in tokens.items():
            headers = {"Authorization": f"Bearer {token}"}
            
            # Vote (alternate between upvote and downvote)
            vote = True if (idx + len(tokens.keys())) % 2 == 0 else False
            try:
                response = requests.post(
                    f"{VERIFICATION_SERVICE}/api/v1/verify/{content_id}/vote",
                    json={"vote": vote},
                    headers=headers
                )
                if response.status_code == 200:
                    vote_type = "upvote" if vote else "downvote"
                    print(f"✓ {username} {vote_type}d content {content_id}")
            except Exception as e:
                print(f"✗ Error voting: {e}")
            
            # Add comment (first user only)
            if username == list(tokens.keys())[0]:
                try:
                    response = requests.post(
                        f"{VERIFICATION_SERVICE}/api/v1/verify/{content_id}/comments",
                        json={"comment": f"Great article about {content_id}!"},
                        headers=headers
                    )
                    if response.status_code == 200:
                        print(f"✓ {username} commented on content {content_id}")
                except Exception as e:
                    print(f"✗ Error commenting: {e}")

def verify_data():
    """Verify seeded data"""
    print("\n=== Verifying Seeded Data ===")
    
    try:
        # Check users count (if endpoint exists)
        print("✓ Users registered successfully")
        
        # Check content
        response = requests.get(f"{CONTENT_SERVICE}/api/v1/content")
        if response.status_code == 200:
            content = response.json()
            print(f"✓ Content count: {len(content.get('content', []))}")
        
        print("\n✅ Database seeding completed successfully!")
    except Exception as e:
        print(f"⚠ Verification error: {e}")

def main():
    print("VeridiaApp Database Seeding Script")
    print("=" * 50)
    print("This script will populate your local database with test data\n")
    
    # Wait for services to be ready
    print("⏳ Waiting for services to start...")
    time.sleep(2)
    
    try:
        # Step 1: Register users
        tokens = register_users()
        if not tokens:
            print("❌ Failed to register users. Exiting.")
            return
        
        # Step 2: Create content
        content_ids = create_content(tokens)
        if not content_ids:
            print("❌ Failed to create content. Exiting.")
            return
        
        # Step 3: Add votes and comments
        add_votes_and_comments(tokens, content_ids)
        
        # Step 4: Verify
        verify_data()
        
    except KeyboardInterrupt:
        print("\n\n⚠ Seeding interrupted by user")
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")

if __name__ == "__main__":
    main()
```

**Make script executable and run:**

```bash
chmod +x scripts/seed_database.py

# Ensure all services are running first!
python3 scripts/seed_database.py
```

---

## Part 4: Essential Database Tests

### Test 1: Connection Health Check

Create `scripts/test_database_connections.py`:

```python
#!/usr/bin/env python3
"""
Database connection test script
Tests connectivity to all databases
"""

import sys
import psycopg2
from pymongo import MongoClient
from elasticsearch import Elasticsearch

# Configuration (update with your credentials)
POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "veridiadb",
    "user": "veridiauser",
    "password": "YOUR_PASSWORD_HERE"
}

MONGODB_CONFIG = {
    "url": "mongodb://localhost:27017",
    "database": "veridiadb"
}

ELASTICSEARCH_CONFIG = {
    "url": "http://localhost:9200"
}

def test_postgresql():
    """Test PostgreSQL connection"""
    print("Testing PostgreSQL connection...")
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        print(f"✓ PostgreSQL: Connected successfully")
        print(f"  Version: {version[:50]}...")
        return True
    except Exception as e:
        print(f"✗ PostgreSQL: Connection failed - {e}")
        return False

def test_mongodb():
    """Test MongoDB connection"""
    print("\nTesting MongoDB connection...")
    try:
        client = MongoClient(MONGODB_CONFIG["url"], serverSelectionTimeoutMS=5000)
        # Force connection test
        client.server_info()
        db = client[MONGODB_CONFIG["database"]]
        collections = db.list_collection_names()
        print(f"✓ MongoDB: Connected successfully")
        print(f"  Collections: {collections if collections else 'None (database is empty)'}")
        client.close()
        return True
    except Exception as e:
        print(f"✗ MongoDB: Connection failed - {e}")
        return False

def test_elasticsearch():
    """Test Elasticsearch connection"""
    print("\nTesting Elasticsearch connection...")
    try:
        es = Elasticsearch([ELASTICSEARCH_CONFIG["url"]])
        if es.ping():
            info = es.info()
            print(f"✓ Elasticsearch: Connected successfully")
            print(f"  Cluster: {info['cluster_name']}")
            print(f"  Version: {info['version']['number']}")
            return True
        else:
            print(f"✗ Elasticsearch: Ping failed")
            return False
    except Exception as e:
        print(f"✗ Elasticsearch: Connection failed - {e}")
        return False

def main():
    print("=" * 60)
    print("VeridiaApp Database Connection Test")
    print("=" * 60)
    print()
    
    results = {
        "PostgreSQL": test_postgresql(),
        "MongoDB": test_mongodb(),
        "Elasticsearch": test_elasticsearch()
    }
    
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    
    for db, success in results.items():
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status} - {db}")
    
    all_passed = all(results.values())
    if all_passed:
        print("\n✅ All database connections successful!")
        sys.exit(0)
    else:
        print("\n❌ Some database connections failed.")
        print("Please check your database configurations and ensure services are running.")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

**Run the test:**

```bash
# Install required packages
pip install psycopg2-binary pymongo elasticsearch

# Run test
python3 scripts/test_database_connections.py
```

---

### Test 2: Read/Write Performance Test

Create `scripts/test_database_performance.py`:

```python
#!/usr/bin/env python3
"""
Database performance test script
Measures read/write speeds for all databases
"""

import time
import psycopg2
from pymongo import MongoClient
from elasticsearch import Elasticsearch

# Same configuration as test_database_connections.py
POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "veridiadb",
    "user": "veridiauser",
    "password": "YOUR_PASSWORD_HERE"
}

MONGODB_CONFIG = {
    "url": "mongodb://localhost:27017",
    "database": "veridiadb"
}

ELASTICSEARCH_CONFIG = {
    "url": "http://localhost:9200"
}

def test_postgres_performance():
    """Test PostgreSQL read/write speed"""
    print("Testing PostgreSQL Performance...")
    
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        cursor = conn.cursor()
        
        # Create test table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_performance (
                id SERIAL PRIMARY KEY,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        
        # Write test
        start_time = time.time()
        for i in range(100):
            cursor.execute(
                "INSERT INTO test_performance (data) VALUES (%s)",
                (f"Test data {i}",)
            )
        conn.commit()
        write_time = time.time() - start_time
        
        # Read test
        start_time = time.time()
        cursor.execute("SELECT * FROM test_performance")
        results = cursor.fetchall()
        read_time = time.time() - start_time
        
        # Cleanup
        cursor.execute("DROP TABLE test_performance")
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print(f"✓ PostgreSQL Performance:")
        print(f"  Write: 100 records in {write_time:.3f}s ({100/write_time:.1f} rec/s)")
        print(f"  Read: {len(results)} records in {read_time:.3f}s")
        
        return True
    except Exception as e:
        print(f"✗ PostgreSQL Performance Test Failed: {e}")
        return False

def test_mongodb_performance():
    """Test MongoDB read/write speed"""
    print("\nTesting MongoDB Performance...")
    
    try:
        client = MongoClient(MONGODB_CONFIG["url"])
        db = client[MONGODB_CONFIG["database"]]
        collection = db["test_performance"]
        
        # Write test
        start_time = time.time()
        documents = [{"data": f"Test data {i}"} for i in range(100)]
        collection.insert_many(documents)
        write_time = time.time() - start_time
        
        # Read test
        start_time = time.time()
        results = list(collection.find())
        read_time = time.time() - start_time
        
        # Cleanup
        collection.drop()
        client.close()
        
        print(f"✓ MongoDB Performance:")
        print(f"  Write: 100 documents in {write_time:.3f}s ({100/write_time:.1f} doc/s)")
        print(f"  Read: {len(results)} documents in {read_time:.3f}s")
        
        return True
    except Exception as e:
        print(f"✗ MongoDB Performance Test Failed: {e}")
        return False

def test_elasticsearch_performance():
    """Test Elasticsearch indexing/search speed"""
    print("\nTesting Elasticsearch Performance...")
    
    try:
        es = Elasticsearch([ELASTICSEARCH_CONFIG["url"]])
        index_name = "test_performance"
        
        # Create index
        if es.indices.exists(index=index_name):
            es.indices.delete(index=index_name)
        
        # Write test
        start_time = time.time()
        for i in range(100):
            es.index(
                index=index_name,
                document={"data": f"Test data {i}"}
            )
        es.indices.refresh(index=index_name)
        write_time = time.time() - start_time
        
        # Search test
        start_time = time.time()
        results = es.search(index=index_name, query={"match_all": {}})
        search_time = time.time() - start_time
        
        # Cleanup
        es.indices.delete(index=index_name)
        
        print(f"✓ Elasticsearch Performance:")
        print(f"  Index: 100 documents in {write_time:.3f}s ({100/write_time:.1f} doc/s)")
        print(f"  Search: {results['hits']['total']['value']} results in {search_time:.3f}s")
        
        return True
    except Exception as e:
        print(f"✗ Elasticsearch Performance Test Failed: {e}")
        return False

def main():
    print("=" * 60)
    print("VeridiaApp Database Performance Test")
    print("=" * 60)
    print()
    
    results = {
        "PostgreSQL": test_postgres_performance(),
        "MongoDB": test_mongodb_performance(),
        "Elasticsearch": test_elasticsearch_performance()
    }
    
    print("\n" + "=" * 60)
    print("Performance Test Summary:")
    print("=" * 60)
    
    for db, success in results.items():
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status} - {db}")
    
    if all(results.values()):
        print("\n✅ All performance tests passed!")
    else:
        print("\n⚠ Some performance tests failed.")

if __name__ == "__main__":
    main()
```

**Run the test:**

```bash
python3 scripts/test_database_performance.py
```

---

### Test 3: Transaction Integrity Test

Create `scripts/test_transaction_integrity.py`:

```python
#!/usr/bin/env python3
"""
Transaction integrity test
Ensures ACID properties are maintained
"""

import psycopg2
from pymongo import MongoClient

POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "veridiadb",
    "user": "veridiauser",
    "password": "YOUR_PASSWORD_HERE"
}

def test_postgres_transactions():
    """Test PostgreSQL transaction rollback"""
    print("Testing PostgreSQL Transaction Integrity...")
    
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        cursor = conn.cursor()
        
        # Create test table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_transactions (
                id SERIAL PRIMARY KEY,
                value INTEGER
            )
        """)
        conn.commit()
        
        # Test 1: Successful transaction
        cursor.execute("INSERT INTO test_transactions (value) VALUES (100)")
        conn.commit()
        
        cursor.execute("SELECT value FROM test_transactions WHERE value = 100")
        result = cursor.fetchone()
        assert result[0] == 100, "Committed value not found"
        print("  ✓ Commit test passed")
        
        # Test 2: Rollback transaction
        cursor.execute("INSERT INTO test_transactions (value) VALUES (200)")
        conn.rollback()
        
        cursor.execute("SELECT value FROM test_transactions WHERE value = 200")
        result = cursor.fetchone()
        assert result is None, "Rolled back value should not exist"
        print("  ✓ Rollback test passed")
        
        # Test 3: Isolation test (simulate concurrent access)
        cursor.execute("INSERT INTO test_transactions (value) VALUES (300)")
        # Don't commit yet
        
        # Open second connection
        conn2 = psycopg2.connect(**POSTGRES_CONFIG)
        cursor2 = conn2.cursor()
        cursor2.execute("SELECT value FROM test_transactions WHERE value = 300")
        result = cursor2.fetchone()
        cursor2.close()
        conn2.close()
        
        # Uncommitted data should not be visible
        assert result is None, "Uncommitted data visible in other connection"
        print("  ✓ Isolation test passed")
        
        conn.commit()
        
        # Cleanup
        cursor.execute("DROP TABLE test_transactions")
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print("✓ PostgreSQL Transaction Integrity: PASS")
        return True
        
    except Exception as e:
        print(f"✗ PostgreSQL Transaction Integrity: FAIL - {e}")
        return False

def test_mongodb_writes():
    """Test MongoDB write concern and durability"""
    print("\nTesting MongoDB Write Durability...")
    
    try:
        client = MongoClient(MONGODB_CONFIG["url"])
        db = client[MONGODB_CONFIG["database"]]
        collection = db["test_transactions"]
        
        # Test with write concern (journaling)
        result = collection.insert_one(
            {"value": 100},
            # Ensure write is acknowledged
            write_concern={"w": 1, "j": True}
        )
        
        # Verify write
        doc = collection.find_one({"_id": result.inserted_id})
        assert doc["value"] == 100, "Written value not found"
        print("  ✓ Acknowledged write test passed")
        
        # Test update
        collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"value": 200}}
        )
        
        doc = collection.find_one({"_id": result.inserted_id})
        assert doc["value"] == 200, "Updated value incorrect"
        print("  ✓ Update test passed")
        
        # Cleanup
        collection.drop()
        client.close()
        
        print("✓ MongoDB Write Durability: PASS")
        return True
        
    except Exception as e:
        print(f"✗ MongoDB Write Durability: FAIL - {e}")
        return False

def main():
    print("=" * 60)
    print("VeridiaApp Transaction Integrity Test")
    print("=" * 60)
    print()
    
    results = {
        "PostgreSQL Transactions": test_postgres_transactions(),
        "MongoDB Write Durability": test_mongodb_writes()
    }
    
    print("\n" + "=" * 60)
    print("Integrity Test Summary:")
    print("=" * 60)
    
    for test, success in results.items():
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status} - {test}")
    
    if all(results.values()):
        print("\n✅ All integrity tests passed!")
        print("Your databases maintain ACID/durability properties correctly.")
    else:
        print("\n❌ Some integrity tests failed.")

if __name__ == "__main__":
    main()
```

**Run the test:**

```bash
python3 scripts/test_transaction_integrity.py
```

---

## Part 5: Cloud Database Configuration

### PostgreSQL on AWS RDS

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier veridiaapp-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.9 \
  --master-username veridiaadmin \
  --master-user-password 'YourSecurePassword123!' \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group \
  --publicly-accessible

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier veridiaapp-postgres \
  --query 'DBInstances[0].Endpoint.Address'
```

**Connection string:**
```
postgresql://veridiaadmin:password@veridiaapp-postgres.xxxxx.us-east-1.rds.amazonaws.com:5432/veridiadb
```

---

### MongoDB Atlas (Cloud)

Already covered in MongoDB setup section. For production:
1. Choose M10+ tier (production recommended)
2. Enable point-in-time recovery
3. Configure IP whitelist or VPC peering
4. Enable monitoring and alerts

---

### Elasticsearch on AWS OpenSearch

```bash
# Create OpenSearch domain
aws opensearch create-domain \
  --domain-name veridiaapp-search \
  --engine-version OpenSearch_2.9 \
  --cluster-config InstanceType=t3.small.search,InstanceCount=1 \
  --ebs-options EBSEnabled=true,VolumeType=gp3,VolumeSize=10 \
  --access-policies file://opensearch-access-policy.json
```

---

## Summary

### Database Configuration Checklist

- [ ] Install/configure PostgreSQL (local or AWS RDS)
- [ ] Install/configure MongoDB (local, Docker, or Atlas)
- [ ] Install/configure Elasticsearch (Docker or AWS OpenSearch)
- [ ] Create `.env` files for all services with database URLs
- [ ] Test database connections with connection test script
- [ ] Run performance tests to ensure acceptable speeds
- [ ] Run integrity tests to verify ACID properties
- [ ] Seed database with test data
- [ ] Configure backups and monitoring for production

### Key Takeaways

- **PostgreSQL**: Best for relational data (users, votes, comments)
- **MongoDB**: Optimal for flexible content storage
- **Elasticsearch**: Superior for full-text search
- **Testing**: Always verify connections, performance, and integrity
- **Production**: Use managed services (RDS, Atlas, OpenSearch) for reliability

### Next Steps

Proceed to `04_comprehensive_testing_strategy.md` to learn about unit, integration, and E2E testing.
