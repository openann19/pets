#!/bin/bash

echo "🚀 PawfectMatch Quick Debug Setup"
echo "=================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔑 Test Credentials:"
echo "   Email: demo@pawfectmatch.com"
echo "   Password: demo123"
echo ""
echo "🌐 Starting frontend on http://localhost:3000"
echo ""
echo "💡 Quick test: Go to http://localhost:3000/browse"
echo "   (Works without backend - test buttons immediately!)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd apps/web && pnpm dev
