#!/bin/bash

# 🚀 PawfectMatch Production-Ready Startup Script
# Simple script to start all services with proper configuration

set -e

echo "🚀 Starting PawfectMatch Production-Ready Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Kill any existing processes
print_status "Cleaning up existing processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true
sleep 3

# Check MongoDB
print_status "Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB not running. Please start MongoDB manually:"
    echo "  mongod --config /opt/homebrew/etc/mongod.conf --fork"
    echo "  Or: brew services start mongodb/brew/mongodb-community"
else
    print_success "MongoDB is running"
fi

# Start backend server
print_status "Starting backend server..."
cd server
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 8

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    print_success "Backend server is running on port 5001"
else
    print_warning "Backend server may not be fully ready yet"
fi

# Start frontend server
print_status "Starting frontend server..."
cd apps/web
pnpm dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to start
print_status "Waiting for frontend to start..."
sleep 10

# Check what port frontend is running on
FRONTEND_PORT=""
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_PORT="3000"
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    FRONTEND_PORT="3001"
else
    print_warning "Frontend may still be starting up"
fi

echo ""
echo "🎉 PawfectMatch Production-Ready Environment Started!"
echo ""
echo "📱 Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "🔧 Backend API: http://localhost:5001/api"
echo "💾 MongoDB: mongodb://127.0.0.1:27017/pawfectmatch"
echo ""
echo "📊 Health Checks:"
echo "  - Backend: http://localhost:5001/api/health"
echo "  - Frontend: http://localhost:${FRONTEND_PORT:-3000}/en"
echo ""
echo "📝 Logs:"
echo "  - Backend: tail -f logs/backend.log"
echo "  - Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services: Press Ctrl+C"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    print_success "All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Keep script running
print_status "Services are running. Press Ctrl+C to stop..."
wait
