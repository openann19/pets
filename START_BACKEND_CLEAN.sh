#!/bin/bash

echo "🧹 Cleaning up old backend processes..."

# Kill all node server processes
pkill -9 -f "node.*server" 2>/dev/null
pkill -9 -f "nodemon" 2>/dev/null

# Wait for processes to die
sleep 3

echo "✅ Cleanup complete!"
echo ""
echo "🚀 Starting fresh backend..."
echo ""

cd server
npm start
