#!/bin/bash

# 🚀 PawfectMatch Production Setup Script
# This script sets up the complete production-ready environment

set -e

echo "🚀 Starting PawfectMatch Production Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/web" ] || [ ! -d "server" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking system requirements..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is required but not installed"
    exit 1
fi
print_success "pnpm version: $(pnpm --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB not found. Please install MongoDB or ensure it's running"
else
    print_success "MongoDB found"
fi

print_status "Installing dependencies..."

# Install root dependencies
pnpm install --frozen-lockfile

# Install web dependencies
print_status "Installing web app dependencies..."
cd apps/web
pnpm install --frozen-lockfile
cd ../..

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm install
cd ..

print_status "Setting up environment variables..."

# Create production environment files
if [ ! -f "apps/web/.env.production" ]; then
    cat > apps/web/.env.production << EOF
# Production Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=PawfectMatch
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Performance optimizations
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
EOF
    print_success "Created apps/web/.env.production"
fi

if [ ! -f "server/.env.production" ]; then
    cat > server/.env.production << EOF
# Production Server Configuration
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/pawfectmatch
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-too-67890
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000

# Email configuration (update with your SMTP settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@pawfectmatch.com
EMAIL_PASS=your-email-password

# Cloudinary for image uploads (update with your credentials)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI for AI features (update with your API key)
OPENAI_API_KEY=your-openai-api-key

# Monitoring (optional)
SENTRY_DSN=

# Payment processing (update with your Stripe credentials)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
EOF
    print_success "Created server/.env.production"
fi

print_status "Building applications..."

# Build web application
print_status "Building web application..."
cd apps/web
pnpm build
cd ../..

# Build server (if needed)
print_status "Checking server build..."
cd server
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    npm run build
    print_success "Server built successfully"
else
    print_status "Server doesn't require build step"
fi
cd ..

print_status "Setting up production scripts..."

# Create production start script
cat > start-production.sh << 'EOF'
#!/bin/bash

# 🚀 PawfectMatch Production Start Script

set -e

echo "🚀 Starting PawfectMatch in Production Mode..."

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
sleep 2

# Start MongoDB (if not running)
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --config /opt/homebrew/etc/mongod.conf --fork 2>/dev/null || true
    sleep 3
fi

# Start backend server
echo "Starting backend server..."
cd server
NODE_ENV=production npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend server
echo "Starting frontend server..."
cd apps/web
NODE_ENV=production pnpm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server is running"
else
    echo "❌ Frontend server failed to start"
    exit 1
fi

echo ""
echo "🎉 PawfectMatch is now running in production mode!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001/api"
echo "💾 MongoDB: mongodb://127.0.0.1:27017/pawfectmatch"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait
EOF

chmod +x start-production.sh
print_success "Created start-production.sh"

# Create development start script
cat > start-development.sh << 'EOF'
#!/bin/bash

# 🚀 PawfectMatch Development Start Script

set -e

echo "🚀 Starting PawfectMatch in Development Mode..."

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start MongoDB (if not running)
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --config /opt/homebrew/etc/mongod.conf --fork 2>/dev/null || true
    sleep 3
fi

# Start backend server
echo "Starting backend server..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend server
echo "Starting frontend server..."
cd apps/web
pnpm dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 10

echo ""
echo "🎉 PawfectMatch is now running in development mode!"
echo ""
echo "📱 Frontend: http://localhost:3000 (or next available port)"
echo "🔧 Backend API: http://localhost:5001/api"
echo "💾 MongoDB: mongodb://127.0.0.1:27017/pawfectmatch"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait
EOF

chmod +x start-development.sh
print_success "Created start-development.sh"

print_status "Running final checks..."

# Test API connection
if curl -s http://localhost:5001/api/health > /dev/null; then
    print_success "Backend API is responding"
else
    print_warning "Backend API is not responding (this is normal if not started yet)"
fi

# Check if web app builds successfully
if [ -d "apps/web/.next" ]; then
    print_success "Web application built successfully"
else
    print_warning "Web application build directory not found"
fi

echo ""
print_success "🎉 Production setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update environment variables in:"
echo "   - apps/web/.env.production"
echo "   - server/.env.production"
echo ""
echo "2. Start the application:"
echo "   - Development: ./start-development.sh"
echo "   - Production: ./start-production.sh"
echo ""
echo "3. Access your application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5001/api"
echo ""
echo "🔧 Configuration files created:"
echo "   - apps/web/.env.production"
echo "   - server/.env.production"
echo "   - start-production.sh"
echo "   - start-development.sh"
echo ""
print_success "PawfectMatch is ready for production deployment! 🚀"
