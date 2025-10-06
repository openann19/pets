#!/bin/bash
# Development environment setup

echo "🔧 Setting up development environment..."

# Start MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --config /opt/homebrew/etc/mongod.conf --fork
fi

# Start Redis (if installed)
if command -v redis-server &> /dev/null && ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis..."
    redis-server --daemonize yes
fi

echo "✅ Development environment ready!"
echo "Run 'pnpm dev' to start the development servers"
