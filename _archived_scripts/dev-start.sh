#!/bin/bash
# Development startup script - starts all services with proper configuration

echo "🚀 Starting PawfectMatch Development Environment"
echo "================================================"

# Kill any existing processes
echo "Stopping existing services..."
pkill -f "node server.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "python.*simple_app" 2>/dev/null

sleep 2

# Create logs directory
mkdir -p logs

# Start MongoDB if not running
if ! pgrep mongod > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath logs/mongodb.log --dbpath /usr/local/var/mongodb 2>/dev/null || echo "MongoDB already running or start manually"
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start Backend API
echo "Starting Backend API (port 5001)..."
cd "$SCRIPT_DIR/server" && NODE_ENV=development node server.js > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!

sleep 3

# Check backend health
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend API running on http://localhost:5001"
else
    echo "❌ Backend failed to start - check logs/backend.log"
fi

# Start Frontend
echo "Starting Frontend (port 3000/3002)..."
cd "$SCRIPT_DIR/apps/web" && npm run dev > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!

sleep 3

# Start AI Service (optional)
if [ -f "$SCRIPT_DIR/ai-service/simple_app.py" ]; then
    echo "Starting AI Service (port 8000)..."
    cd "$SCRIPT_DIR/ai-service" && python3 simple_app.py > "$SCRIPT_DIR/logs/ai-service.log" 2>&1 &
    AI_PID=$!
fi

echo ""
echo "================================================"
echo "✅ Services Started!"
echo "================================================"
echo ""
echo "📍 Access URLs:"
echo "   Frontend:  http://localhost:3002"
echo "   Backend:   http://localhost:5001"
echo "   API Docs:  http://localhost:5001/api/health"
echo "   AI Service: http://localhost:8000"
echo ""
echo "📝 Test Credentials:"
echo "   Email:    testuser@example.com"
echo "   Password: Test123!"
echo ""
echo "📊 View Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 Stop All Services:"
echo "   pkill -f 'node server.js'"
echo "   pkill -f 'next dev'"
echo "   pkill -f 'python.*simple_app'"
echo ""
