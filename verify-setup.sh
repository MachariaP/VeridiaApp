#!/bin/bash
# VeridiaApp Setup Verification Script
# This script checks if your environment is properly configured

echo "======================================"
echo "VeridiaApp Setup Verification"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Function to print status
print_status() {
    if [ "$1" == "PASS" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    elif [ "$1" == "FAIL" ]; then
        echo -e "${RED}✗${NC} $2"
        ((CHECKS_FAILED++))
    elif [ "$1" == "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $2"
        ((CHECKS_WARNING++))
    else
        echo -e "  $2"
    fi
}

# Check Python
echo "Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    print_status "PASS" "Python 3 installed (version $PYTHON_VERSION)"
else
    print_status "FAIL" "Python 3 not found"
fi
echo ""

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "PASS" "Node.js installed (version $NODE_VERSION)"
else
    print_status "FAIL" "Node.js not found"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "PASS" "npm installed (version $NPM_VERSION)"
else
    print_status "FAIL" "npm not found"
fi
echo ""

# Check frontend environment
echo "Checking Frontend Configuration..."
if [ -f "frontend_app/.env.local" ]; then
    print_status "PASS" "frontend_app/.env.local exists"
    
    # Check client-side URL (for direct auth API calls)
    if grep -q "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" frontend_app/.env.local; then
        print_status "PASS" "User service URL is correct (port 8000)"
    else
        print_status "WARN" "User service URL might be incorrect"
    fi
    
    # Check server-side URLs (used by Next.js API proxy routes)
    if grep -q "API_URL=http://localhost:8000" frontend_app/.env.local; then
        print_status "PASS" "User service proxy URL is correct (port 8000)"
    else
        print_status "WARN" "User service proxy URL might be incorrect"
    fi
    
    if grep -q "CONTENT_API_URL=http://localhost:8001" frontend_app/.env.local; then
        print_status "PASS" "Content service URL is correct (port 8001)"
    else
        print_status "WARN" "Content service URL might be incorrect"
    fi
    
    if grep -q "VERIFICATION_API_URL=http://localhost:8002" frontend_app/.env.local; then
        print_status "PASS" "Verification service URL is correct (port 8002)"
    else
        print_status "FAIL" "Verification service URL is incorrect (should be port 8002)"
        echo "       Current value:"
        grep "VERIFICATION_API_URL" frontend_app/.env.local || echo "       Not set"
    fi
    
    if grep -q "SEARCH_API_URL=http://localhost:8003" frontend_app/.env.local; then
        print_status "PASS" "Search service URL is correct (port 8003)"
    else
        print_status "WARN" "Search service URL might be incorrect"
    fi
else
    print_status "FAIL" "frontend_app/.env.local not found"
    echo "       Create it by running: cp frontend_app/.env.example frontend_app/.env.local"
fi
echo ""

# Check verification service environment
echo "Checking Verification Service Configuration..."
if [ -f "verification_service/.env" ]; then
    print_status "PASS" "verification_service/.env exists"
    
    # Check if DATABASE_URL is set
    if grep -q "^DATABASE_URL=" verification_service/.env; then
        print_status "INFO" "PostgreSQL configured in verification_service/.env"
    else
        print_status "INFO" "Using SQLite (DATABASE_URL not set)"
    fi
else
    print_status "WARN" "verification_service/.env not found (will use SQLite)"
    echo "       Create it by running: cp verification_service/.env.example verification_service/.env"
fi
echo ""

# Check if services can be imported
echo "Checking Service Imports..."
if [ -d "verification_service" ]; then
    cd verification_service
    if pip3 list 2>/dev/null | grep -q "fastapi"; then
        if python3 -c "from app.main import app" 2>/dev/null; then
            print_status "PASS" "Verification service can be imported"
        else
            print_status "FAIL" "Verification service import failed"
            echo "       Try: cd verification_service && pip3 install -r requirements.txt"
        fi
    else
        print_status "WARN" "FastAPI not installed for verification service"
        echo "       Run: cd verification_service && pip3 install -r requirements.txt"
    fi
    cd ..
fi
echo ""

# Check if ports are available
echo "Checking Port Availability..."
for port in 8000 8001 8002 8003 3000; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "WARN" "Port $port is already in use"
    else
        print_status "PASS" "Port $port is available"
    fi
done
echo ""

# Check PostgreSQL (optional)
echo "Checking Optional Services..."
if command -v psql &> /dev/null; then
    print_status "INFO" "PostgreSQL client installed"
else
    print_status "INFO" "PostgreSQL not found (optional - SQLite will be used)"
fi

if command -v mongod &> /dev/null; then
    print_status "INFO" "MongoDB installed"
else
    print_status "INFO" "MongoDB not found (optional - in-memory storage will be used)"
fi

if command -v rabbitmq-server &> /dev/null; then
    print_status "INFO" "RabbitMQ installed"
else
    print_status "INFO" "RabbitMQ not found (optional - events will be logged)"
fi
echo ""

# Summary
echo "======================================"
echo "Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $CHECKS_PASSED"
if [ $CHECKS_WARNING -gt 0 ]; then
    echo -e "${YELLOW}Warnings:${NC} $CHECKS_WARNING"
fi
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed:${NC} $CHECKS_FAILED"
fi
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Your setup looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start verification service: cd verification_service && uvicorn app.main:app --reload --port 8002"
    echo "2. Start other backend services on their respective ports"
    echo "3. Start frontend: cd frontend_app && npm run dev"
    echo ""
    echo "For detailed instructions, see SETUP.md"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "For help, see:"
    echo "- SETUP.md - Complete setup guide"
    echo "- ENV_SETUP.md - Environment configuration guide"
    echo "- TROUBLESHOOTING.md - Solutions to common problems"
    exit 1
fi
