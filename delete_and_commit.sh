#!/bin/bash

# Script to delete all files except tutorial folder
# Each file deletion is committed individually with a descriptive message
# This is done for learning purposes to start rebuilding step by step

set -e  # Exit on error

echo "========================================"
echo "VeridiaApp Repository Cleanup Script"
echo "========================================"
echo ""
echo "This script will delete all files except the tutorial folder"
echo "Each file will be committed individually with a descriptive message"
echo ""

# Function to get file description and commit message
get_commit_message() {
    local file="$1"
    local description=""
    local commit_msg=""
    
    case "$file" in
        # Root documentation files
        "README.md")
            description="Main project README with architecture overview and getting started guide"
            ;;
        "SETUP.md")
            description="Complete setup guide for all services with quick start instructions"
            ;;
        "ENV_SETUP.md")
            description="Environment variables setup guide for frontend and backend services"
            ;;
        "TROUBLESHOOTING.md")
            description="Troubleshooting guide with solutions to common problems"
            ;;
        "GETTING_STARTED.md")
            description="Quick start guide for new developers"
            ;;
        "SETUP_INSTRUCTIONS.md")
            description="Detailed setup and fix explanation documentation"
            ;;
        "ACCESSIBILITY.md")
            description="Accessibility compliance guide for WCAG 2.1 AA standards"
            ;;
        "COMPONENTS.md")
            description="Reusable UI component library documentation"
            ;;
        "DESIGN.md")
            description="Complete design system specification with tokens and guidelines"
            ;;
        "RBAC.md")
            description="Role-based access control guide with permissions matrix"
            ;;
        "GDPR_COMPLIANCE.md")
            description="GDPR implementation details for data privacy compliance"
            ;;
        "CORS_FIX_SUMMARY.md")
            description="Summary of CORS configuration fixes across services"
            ;;
        "PR_SUMMARY.md")
            description="Pull request summary for CORS fix and documentation cleanup"
            ;;
        ".gitignore")
            description="Git ignore configuration for build artifacts and dependencies"
            ;;
        "verify-setup.sh")
            description="Setup verification script to check environment configuration"
            ;;
        "package-lock.json")
            description="Root package lock file for Node.js dependencies"
            ;;
            
        # User Service
        "user_service/"*)
            if [[ "$file" == *"/README.md" ]]; then
                description="User service documentation - handles authentication, registration, and profile management"
            elif [[ "$file" == *"/main.py" ]]; then
                description="User service main entry point - starts FastAPI app on port 8000"
            elif [[ "$file" == *"/requirements.txt" ]]; then
                description="User service Python dependencies list"
            elif [[ "$file" == *"/Dockerfile" ]]; then
                description="User service Docker container configuration"
            elif [[ "$file" == *"/.env.example" ]]; then
                description="User service environment variables template"
            elif [[ "$file" == *"/.gitignore" ]]; then
                description="User service git ignore configuration"
            elif [[ "$file" == *"/FIX_SUMMARY.md" ]]; then
                description="User service fix summary documentation"
            elif [[ "$file" == *"/ROUTER_CONFIGURATION.md" ]]; then
                description="User service router configuration documentation"
            elif [[ "$file" == *"/test_endpoints.py" ]]; then
                description="User service endpoint tests"
            elif [[ "$file" == *"/app/main.py" ]]; then
                description="User service FastAPI application initialization and CORS configuration"
            elif [[ "$file" == *"/endpoints/auth.py" ]]; then
                description="User service authentication endpoints - login, register, token refresh"
            elif [[ "$file" == *"/endpoints/gdpr.py" ]]; then
                description="User service GDPR endpoints - data export and account deletion"
            elif [[ "$file" == *"/models/user.py" ]]; then
                description="User service database model - user table with authentication fields"
            elif [[ "$file" == *"/models/audit_log.py" ]]; then
                description="User service audit log model - tracks user actions for compliance"
            elif [[ "$file" == *"/schemas/user.py" ]]; then
                description="User service Pydantic schemas for API request/response validation"
            elif [[ "$file" == *"/core/database.py" ]]; then
                description="User service database configuration and session management"
            elif [[ "$file" == *"/core/security.py" ]]; then
                description="User service security utilities - password hashing, JWT tokens"
            elif [[ "$file" == *"/core/config.py" ]]; then
                description="User service configuration settings from environment variables"
            elif [[ "$file" == *"/utils/audit.py" ]]; then
                description="User service audit logging utilities for compliance tracking"
            elif [[ "$file" == *"/utils/messaging.py" ]]; then
                description="User service RabbitMQ messaging utilities for event publishing"
            else
                description="User service component - handles authentication and user management"
            fi
            ;;
            
        # Content Service
        "content_service/"*)
            if [[ "$file" == *"/README.md" ]]; then
                description="Content service documentation - handles content lifecycle management"
            elif [[ "$file" == *"/main.py" ]]; then
                description="Content service main entry point - starts FastAPI app on port 8001"
            elif [[ "$file" == *"/requirements.txt" ]]; then
                description="Content service Python dependencies list"
            elif [[ "$file" == *"/Dockerfile" ]]; then
                description="Content service Docker container configuration"
            elif [[ "$file" == *"/.env.example" ]]; then
                description="Content service environment variables template"
            elif [[ "$file" == *"/app/main.py" ]]; then
                description="Content service FastAPI application initialization and CORS configuration"
            elif [[ "$file" == *"/endpoints/content.py" ]]; then
                description="Content service endpoints - create, retrieve, update content"
            elif [[ "$file" == *"/models/content.py" ]]; then
                description="Content service data model - content structure for MongoDB"
            elif [[ "$file" == *"/schemas/content.py" ]]; then
                description="Content service Pydantic schemas for API request/response validation"
            elif [[ "$file" == *"/core/database.py" ]]; then
                description="Content service MongoDB connection and configuration"
            elif [[ "$file" == *"/core/security.py" ]]; then
                description="Content service JWT token validation utilities"
            elif [[ "$file" == *"/core/config.py" ]]; then
                description="Content service configuration settings from environment variables"
            elif [[ "$file" == *"/utils/messaging.py" ]]; then
                description="Content service RabbitMQ messaging for ContentCreated events"
            elif [[ "$file" == *"/utils/validators.py" ]]; then
                description="Content service validation utilities for URLs and content"
            else
                description="Content service component - handles content creation and storage"
            fi
            ;;
            
        # Verification Service
        "verification_service/"*)
            if [[ "$file" == *"/README.md" ]]; then
                description="Verification service documentation - handles voting and AI verification"
            elif [[ "$file" == *"/main.py" ]]; then
                description="Verification service main entry point - starts FastAPI app on port 8002"
            elif [[ "$file" == *"/requirements.txt" ]]; then
                description="Verification service Python dependencies list"
            elif [[ "$file" == *"/Dockerfile" ]]; then
                description="Verification service Docker container configuration"
            elif [[ "$file" == *"/.env.example" ]]; then
                description="Verification service environment variables template"
            elif [[ "$file" == *"/app/main.py" ]]; then
                description="Verification service FastAPI application initialization and CORS configuration"
            elif [[ "$file" == *"/endpoints/verify.py" ]]; then
                description="Verification service endpoints - voting, comments, verification status"
            elif [[ "$file" == *"/models/verification.py" ]]; then
                description="Verification service database models - votes and comments tables"
            elif [[ "$file" == *"/schemas/verification.py" ]]; then
                description="Verification service Pydantic schemas for API request/response validation"
            elif [[ "$file" == *"/core/database.py" ]]; then
                description="Verification service database configuration and session management"
            elif [[ "$file" == *"/core/security.py" ]]; then
                description="Verification service JWT token validation utilities"
            elif [[ "$file" == *"/utils/ai_verification.py" ]]; then
                description="Verification service AI verification logic and ML integration stub"
            elif [[ "$file" == *"/utils/messaging.py" ]]; then
                description="Verification service RabbitMQ messaging for status updates"
            elif [[ "$file" == *"/utils/notifications.py" ]]; then
                description="Verification service notification system for user alerts"
            elif [[ "$file" == *"/utils/status_updater.py" ]]; then
                description="Verification service automatic status calculation based on vote thresholds"
            else
                description="Verification service component - handles community verification"
            fi
            ;;
            
        # Search Service
        "search_service/"*)
            if [[ "$file" == *"/README.md" ]]; then
                description="Search service documentation - handles full-text search and discovery"
            elif [[ "$file" == *"/main.py" ]]; then
                description="Search service main entry point - starts FastAPI app on port 8003"
            elif [[ "$file" == *"/requirements.txt" ]]; then
                description="Search service Python dependencies list"
            elif [[ "$file" == *"/Dockerfile" ]]; then
                description="Search service Docker container configuration"
            elif [[ "$file" == *"/.env.example" ]]; then
                description="Search service environment variables template"
            elif [[ "$file" == *"/app/main.py" ]]; then
                description="Search service FastAPI application initialization and CORS configuration"
            elif [[ "$file" == *"/endpoints/search.py" ]]; then
                description="Search service endpoints - full-text search and category filtering"
            elif [[ "$file" == *"/core/elasticsearch.py" ]]; then
                description="Search service Elasticsearch connection and indexing logic"
            elif [[ "$file" == *"/utils/messaging.py" ]]; then
                description="Search service RabbitMQ consumer for real-time content indexing"
            else
                description="Search service component - handles search and discovery features"
            fi
            ;;
            
        # Frontend App
        "frontend_app/"*)
            if [[ "$file" == *"/README.md" ]]; then
                description="Frontend app documentation - Next.js React application"
            elif [[ "$file" == *"/package.json" ]]; then
                description="Frontend app Node.js package configuration and dependencies"
            elif [[ "$file" == *"/package-lock.json" ]]; then
                description="Frontend app Node.js dependency lock file"
            elif [[ "$file" == *"/tsconfig.json" ]]; then
                description="Frontend app TypeScript configuration"
            elif [[ "$file" == *"/next.config.ts" ]]; then
                description="Frontend app Next.js configuration"
            elif [[ "$file" == *"/eslint.config.mjs" ]]; then
                description="Frontend app ESLint configuration for code quality"
            elif [[ "$file" == *"/postcss.config.mjs" ]]; then
                description="Frontend app PostCSS configuration for Tailwind CSS"
            elif [[ "$file" == *"/.env.example" ]]; then
                description="Frontend app environment variables template with API URLs"
            elif [[ "$file" == *"/.gitignore" ]]; then
                description="Frontend app git ignore configuration"
            elif [[ "$file" == *"/src/app/layout.tsx" ]]; then
                description="Frontend app root layout component with fonts and metadata"
            elif [[ "$file" == *"/src/app/page.tsx" ]]; then
                description="Frontend app homepage with welcome message and features"
            elif [[ "$file" == *"/src/app/globals.css" ]]; then
                description="Frontend app global styles and Tailwind CSS configuration"
            elif [[ "$file" == *"/src/app/login/page.tsx" ]]; then
                description="Frontend app login page with authentication form"
            elif [[ "$file" == *"/src/app/register/page.tsx" ]]; then
                description="Frontend app registration page with user signup form"
            elif [[ "$file" == *"/src/app/dashboard/page.tsx" ]]; then
                description="Frontend app user dashboard with profile and content management"
            elif [[ "$file" == *"/src/app/create/page.tsx" ]]; then
                description="Frontend app content creation page with submission form"
            elif [[ "$file" == *"/src/app/content/[id]/page.tsx" ]]; then
                description="Frontend app content detail page with voting and comments"
            elif [[ "$file" == *"/src/app/discovery/page.tsx" ]]; then
                description="Frontend app discovery page with search and filtering"
            elif [[ "$file" == *"/api/auth/login/route.ts" ]]; then
                description="Frontend app API route for login requests to user service"
            elif [[ "$file" == *"/api/auth/register/route.ts" ]]; then
                description="Frontend app API route for registration requests"
            elif [[ "$file" == *"/api/auth/me/route.ts" ]]; then
                description="Frontend app API route for current user profile"
            elif [[ "$file" == *"/api/content/create/route.ts" ]]; then
                description="Frontend app API route for content creation"
            elif [[ "$file" == *"/api/content/route.ts" ]]; then
                description="Frontend app API route for content listing"
            elif [[ "$file" == *"/api/content/[id]/route.ts" ]]; then
                description="Frontend app API route for content details"
            elif [[ "$file" == *"/api/search/route.ts" ]]; then
                description="Frontend app API route for search functionality"
            elif [[ "$file" == *"/api/search/categories/route.ts" ]]; then
                description="Frontend app API route for category filtering"
            elif [[ "$file" == *"/api/verify/"*"/vote/route.ts" ]]; then
                description="Frontend app API route for submitting verification votes"
            elif [[ "$file" == *"/api/verify/"*"/votes/route.ts" ]]; then
                description="Frontend app API route for retrieving vote statistics"
            elif [[ "$file" == *"/api/verify/"*"/comments/route.ts" ]]; then
                description="Frontend app API route for content comments"
            elif [[ "$file" == *"/src/components/Layout.tsx" ]]; then
                description="Frontend app reusable layout component with header and footer"
            elif [[ "$file" == *"/src/components/icons/index.tsx" ]]; then
                description="Frontend app SVG icon system with 30+ icons"
            elif [[ "$file" == *"/src/components/ui/Toast.tsx" ]]; then
                description="Frontend app toast notification component"
            elif [[ "$file" == *"/src/components/ui/Modal.tsx" ]]; then
                description="Frontend app modal dialog component"
            elif [[ "$file" == *"/src/components/ui/Badge.tsx" ]]; then
                description="Frontend app badge component for status indicators"
            elif [[ "$file" == *"/src/components/ui/Tooltip.tsx" ]]; then
                description="Frontend app tooltip component"
            elif [[ "$file" == *"/src/components/ui/EmptyState.tsx" ]]; then
                description="Frontend app empty state component with illustrations"
            elif [[ "$file" == *"/src/lib/api.ts" ]]; then
                description="Frontend app API utility functions for authenticated requests"
            elif [[ "$file" == *"/src/styles/theme.js" ]]; then
                description="Frontend app theme configuration with design tokens"
            elif [[ "$file" == *"/public/"*.svg ]]; then
                description="Frontend app SVG asset - $(basename "$file")"
            elif [[ "$file" == *"/src/app/favicon.ico" ]]; then
                description="Frontend app favicon icon"
            else
                description="Frontend app component - Next.js React application"
            fi
            ;;
            
        # Default for __init__.py files
        *"/__init__.py")
            description="Python package initialization file - makes directory a Python module"
            ;;
            
        *)
            description="Application file"
            ;;
    esac
    
    commit_msg="Delete: $file - $description. Removing to start rebuild from tutorials for learning purposes."
    echo "$commit_msg"
}

# Dry run first to show what will be deleted
echo "DRY RUN - Files to be deleted:"
echo "========================================"
git ls-files | grep -v "^tutorial/" | grep -v "^delete_and_commit.sh$" | while read -r file; do
    echo "  - $file"
done
echo ""
echo "Total files to delete: $(git ls-files | grep -v "^tutorial/" | grep -v "^delete_and_commit.sh$" | wc -l)"
echo ""

# Check for --dry-run flag
if [ "$1" = "--dry-run" ]; then
    echo "Dry run complete. Use './delete_and_commit.sh --execute' to proceed."
    exit 0
fi

if [ "$1" != "--execute" ]; then
    echo "To execute deletion, run: ./delete_and_commit.sh --execute"
    echo "To see this list again, run: ./delete_and_commit.sh --dry-run"
    exit 0
fi

echo "Proceeding with deletion..."

echo ""
echo "Starting deletion process..."
echo "========================================"
echo ""

# Process each file
file_count=0
git ls-files | grep -v "^tutorial/" | grep -v "^delete_and_commit.sh$" | while read -r file; do
    file_count=$((file_count + 1))
    
    # Get commit message
    commit_msg=$(get_commit_message "$file")
    
    echo "[$file_count] Processing: $file"
    
    # Git remove the file
    git rm "$file" 2>/dev/null || true
    
    # Commit with descriptive message
    git commit -m "$commit_msg" 2>/dev/null || true
    
done

echo ""
echo "========================================"
echo "Deletion process complete!"
echo "========================================"
echo ""
echo "Files remaining in repository:"
git ls-files
echo ""
echo "You can now start rebuilding step by step following the tutorial guides."
