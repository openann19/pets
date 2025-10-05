#!/bin/bash

echo "🚀 Starting PawfectMatch Premium - Full Stack Application"
echo "=========================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check MongoDB
echo -e "${BLUE}[1/4]${NC} Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB is running"
else
    echo -e "${YELLOW}⚠${NC} Starting MongoDB..."
    mongod --dbpath /opt/homebrew/var/mongodb --logpath /opt/homebrew/var/log/mongodb/mongo.log --fork
    sleep 2
    echo -e "${GREEN}✓${NC} MongoDB started"
fi

# Start Backend API
echo -e "${BLUE}[2/4]${NC} Starting Backend API (port 5001)..."
cd /Users/elvira/Downloads/pets-pr-1/server
node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend API started (PID: $BACKEND_PID)"
sleep 3

# Start AI Service
echo -e "${BLUE}[3/4]${NC} Starting AI Service (port 8000)..."
cd /Users/elvira/Downloads/pets-pr-1/ai-service
python3 simple_app.py > ../logs/ai-service.log 2>&1 &
AI_PID=$!
echo -e "${GREEN}✓${NC} AI Service started (PID: $AI_PID)"
sleep 2

# Start Frontend
echo -e "${BLUE}[4/4]${NC} Starting Frontend Web App (port 3000)..."
cd /Users/elvira/Downloads/pets-pr-1/apps/web
npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "=========================================================="
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo ""
echo "📱 Access the application:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:5001"
echo "   AI Service:  http://localhost:8000"
echo ""
echo "📝 View logs:"
echo "   Backend:     tail -f logs/backend.log"
echo "   AI Service:  tail -f logs/ai-service.log"
echo "   Frontend:    tail -f logs/frontend.log"
echo ""
echo "⏹️  To stop all services:"
echo "   pkill -f 'node server.js'"
echo "   pkill -f 'python3 simple_app.py'"
echo "   pkill -f 'next dev'"
echo ""
echo "⏳ Wait 30-60 seconds for all services to fully initialize..."
echo ""
