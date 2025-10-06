#!/usr/bin/env python3
"""
Test script to verify that authentication endpoints are configured correctly
and do not have duplicate /api/v1 prefixes.
"""

import requests
import sys

BASE_URL = "http://localhost:8000"

def test_correct_endpoints():
    """Test that correct endpoint paths work"""
    print("Testing correct endpoint paths...")
    
    # Test root endpoint
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200, f"Root endpoint failed: {response.status_code}"
    print("✓ GET / - OK")
    
    # Test register endpoint (should fail with 422 for missing data, but endpoint exists)
    response = requests.post(f"{BASE_URL}/api/v1/auth/register")
    assert response.status_code == 422, f"Register endpoint returned unexpected status: {response.status_code}"
    print("✓ POST /api/v1/auth/register - Endpoint exists")
    
    # Test login endpoint (should fail with 422 for missing data, but endpoint exists)
    response = requests.post(f"{BASE_URL}/api/v1/auth/login")
    assert response.status_code == 422, f"Login endpoint returned unexpected status: {response.status_code}"
    print("✓ POST /api/v1/auth/login - Endpoint exists")
    
    # Test me endpoint (should fail with 401 for missing auth, but endpoint exists)
    response = requests.get(f"{BASE_URL}/api/v1/auth/me")
    assert response.status_code == 401, f"Me endpoint returned unexpected status: {response.status_code}"
    print("✓ GET /api/v1/auth/me - Endpoint exists")
    
    print("\nAll correct endpoints are working! ✓")

def test_duplicate_prefix_rejected():
    """Test that duplicate /api/v1 prefix is correctly rejected"""
    print("\nTesting that duplicate prefix is rejected...")
    
    # Test duplicate prefix path (should return 404)
    response = requests.post(f"{BASE_URL}/api/v1/api/v1/auth/login")
    assert response.status_code == 404, f"Duplicate prefix should return 404, got: {response.status_code}"
    
    # Verify error message
    data = response.json()
    assert "api/v1/api/v1/auth/login" in data["detail"], "Error message should mention the wrong path"
    assert "/api/v1/auth" in data["detail"], "Error message should mention the correct path"
    print("✓ POST /api/v1/api/v1/auth/login - Correctly rejected with 404")
    print(f"  Error message: {data['detail']}")
    
    print("\nDuplicate prefix is correctly rejected! ✓")

if __name__ == "__main__":
    try:
        test_correct_endpoints()
        test_duplicate_prefix_rejected()
        print("\n" + "="*60)
        print("ALL TESTS PASSED ✓")
        print("="*60)
        print("\nConclusion:")
        print("- Router configuration is CORRECT")
        print("- Router has NO prefix parameter")
        print("- App includes router with prefix='/api/v1/auth'")
        print("- Endpoints are at /api/v1/auth/* (correct)")
        print("- Duplicate /api/v1/api/v1/* paths are rejected")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server at http://localhost:8000")
        print("Please start the server with: uvicorn app.main:app --port 8000")
        sys.exit(1)
