# 🚀 PawfectMatch Premium - Quick Start Guide

## Start Everything (One Command)
```bash
cd /Users/elvira/Downloads/pets-pr-1
bash start-all-services.sh
```

## Access URLs
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:5001
- 💚 **Health Check**: http://localhost:5001/api/health
- 🤖 **AI Service**: http://localhost:8000

## Test Authentication
```bash
bash test-auth.sh
```

## View Logs
```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log

# AI Service
tail -f logs/ai-service.log
```

## Stop All Services
```bash
pkill -f 'node server.js'
pkill -f 'python3 simple_app.py'
pkill -f 'next dev'
```

## Key Features Implemented ✅
- ✨ Three.js animated background on all pages
- 💎 Premium glassmorphism design
- 🔐 Authentication (sign up/login)
- 🎯 Smart background interaction (doesn't interfere with forms)
- 📱 Mobile-friendly touch interactions
- 🎨 Color-coded UI elements

## Test User Flow
1. Go to http://localhost:3000/register
2. Create account (email, password, first name, last name)
3. Login at http://localhost:3000/login
4. Browse pets at http://localhost:3000/browse
5. Swipe at http://localhost:3000/swipe

## Troubleshooting

### Port Already in Use?
```bash
# Find and kill process
lsof -i :3000  # or :5001 or :8000
kill -9 <PID>
```

### CORS Error?
- Backend must be running on port 5001
- Check: `curl http://localhost:5001/api/health`

### Background Not Interactive?
- Click on empty areas (not on buttons/forms)
- Mouse movements should create smooth gradients
- Clicks on empty space create ripple effects

## Documentation
- 📖 **Full Summary**: SESSION_SUMMARY.md
- 🎨 **Background Integration**: THREEJS_BACKGROUND_INTEGRATION.md
- 🔐 **Auth Tests**: AUTH_TEST_RESULTS.md
- 🖱️ **Interaction Fix**: BACKGROUND_INTERACTION_FIX.md

## Need Help?
All services should start automatically with `start-all-services.sh`

If issues persist:
1. Check MongoDB is running: `pgrep mongod`
2. Check logs in `/logs/` directory
3. Verify .env files are configured correctly

---
**Status**: ✅ Ready to Use  
**Last Updated**: 2025-10-02
