# Getting Started with VeridiaApp

## Quick Start (5 Minutes)

### 1. Clone and Setup
```bash
git clone https://github.com/MachariaP/VeridiaApp.git
cd VeridiaApp
```

### 2. Create Frontend Environment File
```bash
cd frontend_app
cp .env.example .env.local
cd ..
```

The `.env.local` file should contain:
```bash
API_URL=http://localhost:8000
CONTENT_API_URL=http://localhost:8001
VERIFICATION_API_URL=http://localhost:8002
SEARCH_API_URL=http://localhost:8003
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Verify Setup
```bash
./verify-setup.sh
```

### 4. Start Services

Open **4 separate terminals** and run:

**Terminal 1 - User Service:**
```bash
cd user_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Content Service:**
```bash
cd content_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**Terminal 3 - Verification Service:**
```bash
cd verification_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

**Terminal 4 - Search Service:**
```bash
cd search_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

### 5. Start Frontend

In a **5th terminal**:
```bash
cd frontend_app
npm install
npm run dev
```

### 6. Access the Application

Open your browser to: **http://localhost:3000**

You should see the VeridiaApp homepage with no CORS errors! 🎉

## What's Running?

Once all services are started, you should see:

- **Frontend**: http://localhost:3000 (Next.js)
- **User Service API**: http://localhost:8000/docs (FastAPI)
- **Content Service API**: http://localhost:8001/docs (FastAPI)
- **Verification Service API**: http://localhost:8002/docs (FastAPI)
- **Search Service API**: http://localhost:8003/docs (FastAPI)

## Testing

### Test Authentication
1. Go to http://localhost:3000/register
2. Create a new account
3. Login at http://localhost:3000/login
4. You should be redirected to the dashboard with NO CORS errors!

### Check Browser Console
Open Developer Tools (F12) and check the Console tab:
- ✅ You should see successful API calls (200 status)
- ❌ You should NOT see CORS errors

## Common Issues

### "Port already in use"
Kill the process using the port:
```bash
# Find process on port (e.g., 8000)
lsof -i :8000

# Kill it
kill -9 <PID>
```

### CORS errors persist
1. Make sure ALL backend services are running on correct ports
2. Restart frontend:
   ```bash
   cd frontend_app
   rm -rf .next
   npm run dev
   ```

### Module not found errors
Install dependencies:
```bash
# For backend services
cd <service_directory>
pip install -r requirements.txt

# For frontend
cd frontend_app
npm install
```

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup information
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review [ENV_SETUP.md](./ENV_SETUP.md) for environment configuration
- Explore [README.md](./README.md) for architecture and features

## What Was Fixed?

This repository recently underwent fixes for:
1. ✅ CORS errors blocking frontend-backend communication
2. ✅ Documentation cleanup (reduced from 21 to 10 MD files)
3. ✅ Environment configuration improvements

For details, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         Frontend (Port 3000)                     │
│         Next.js + React + TypeScript             │
└────────┬──────────────────────────────────┬─────┘
         │                                   │
         │                                   │
    ┌────▼────┐  ┌──────────┐  ┌───────────▼────┐
    │  User   │  │ Content  │  │ Verification    │
    │ Service │  │ Service  │  │   Service       │
    │ :8000   │  │ :8001    │  │   :8002         │
    └─────────┘  └──────────┘  └─────────────────┘
                                         │
                                    ┌────▼────┐
                                    │ Search  │
                                    │ Service │
                                    │ :8003   │
                                    └─────────┘
```

## Support

If you encounter any issues:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Run `./verify-setup.sh` to diagnose setup issues
3. Check that all services are running on correct ports
4. Ensure no CORS-blocking browser extensions are active

Happy coding! 🚀
