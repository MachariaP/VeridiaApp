#!/bin/bash
# Quick test script to verify user service database setup is working

set -e

echo "========================================"
echo "VeridiaApp User Service Setup Test"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "Error: Please run this script from the user_service directory"
    echo "Usage: cd user_service && ./test_setup.sh"
    exit 1
fi

echo "Step 1: Checking Python version..."
python3 --version
echo ""

echo "Step 2: Installing dependencies..."
pip install -r requirements.txt -q
echo "✓ Dependencies installed"
echo ""

echo "Step 3: Checking for argon2-cffi (required for password hashing)..."
if pip list | grep -q argon2-cffi; then
    echo "✓ argon2-cffi is installed"
else
    echo "✗ argon2-cffi is missing! Installing..."
    pip install argon2-cffi
fi
echo ""

echo "Step 4: Starting user service on port 8000..."
echo "(Press Ctrl+C to stop after testing)"
echo ""
echo "The database will be created automatically as 'veridiaapp.db'"
echo "You can test the API at http://localhost:8000/docs"
echo ""

# Start the service
uvicorn app.main:app --reload --port 8000
