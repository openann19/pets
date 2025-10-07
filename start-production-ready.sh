#!/bin/bash

# 🚀 PAWFECTMATCH PRODUCTION READY STARTUP SCRIPT
# This script starts all services in the correct order for production readiness

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Kill processes on specific ports
kill_port() {
    local port=$1
    if port_in_use $port; then
        log_warning "Port $port is in use, killing existing process..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Main startup function
main() {
    log_header "PAWFECTMATCH PRODUCTION READY STARTUP"
    log_info "Starting all services in production-ready configuration..."
    
    # Check prerequisites
    log_header "CHECKING PREREQUISITES"
    
    if ! command_exists node; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command_exists pnpm; then
        log_error "pnpm is not installed"
        exit 1
    fi
    
    if ! command_exists mongod; then
        log_warning "MongoDB is not installed or not in PATH"
        log_warning "Please install MongoDB or use MongoDB Atlas"
    fi
    
    log_success "Prerequisites checked"
    
    # Clean up existing processes
    log_header "CLEANING UP EXISTING PROCESSES"
    kill_port 5001  # Backend
    kill_port 3000  # Web
    kill_port 8081  # Metro
    kill_port 8082  # Metro alternative
    
    # Install dependencies
    log_header "INSTALLING DEPENDENCIES"
    log_info "Installing root dependencies..."
    pnpm install --frozen-lockfile
    
    log_success "Dependencies installed"
    
    # Start MongoDB (if available)
    log_header "STARTING DATABASE"
    if command_exists mongod; then
        log_info "Starting MongoDB..."
        if ! port_in_use 27017; then
            # Try to start MongoDB
            if brew services start mongodb-community 2>/dev/null; then
                log_success "MongoDB started via Homebrew"
            elif mongod --config /opt/homebrew/etc/mongod.conf --fork 2>/dev/null; then
                log_success "MongoDB started manually"
            else
                log_warning "Could not start MongoDB locally"
                log_warning "Please ensure MongoDB is running or use MongoDB Atlas"
            fi
        else
            log_success "MongoDB is already running"
        fi
    else
        log_warning "MongoDB not found locally"
        log_warning "Please ensure MongoDB Atlas is configured or MongoDB is installed"
    fi
    
    # Start backend server
    log_header "STARTING BACKEND SERVER"
    log_info "Starting Express.js server on port 5001..."
    cd server
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    log_info "Waiting for backend server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5001/healthz >/dev/null 2>&1; then
            log_success "Backend server is running"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Backend server failed to start"
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
        sleep 1
    done
    
    # Start web application
    log_header "STARTING WEB APPLICATION"
    log_info "Starting Next.js application on port 3000..."
    cd apps/web
    pnpm dev &
    WEB_PID=$!
    cd ../..
    
    # Wait for web app to start
    log_info "Waiting for web application to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            log_success "Web application is running"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Web application failed to start"
            kill $WEB_PID 2>/dev/null || true
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
        sleep 1
    done
    
    # Start mobile Metro bundler
    log_header "STARTING MOBILE METRO BUNDLER"
    log_info "Starting Metro bundler for React Native..."
    cd apps/mobile
    npx expo start --dev-client --clear &
    METRO_PID=$!
    cd ../..
    
    # Wait for Metro to start
    log_info "Waiting for Metro bundler to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8081 >/dev/null 2>&1; then
            log_success "Metro bundler is running"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "Metro bundler may not be ready yet"
            break
        fi
        sleep 1
    done
    
    # Final status
    log_header "STARTUP COMPLETE"
    log_success "All services are starting up!"
    echo ""
    log_info "🌐 Web Application: http://localhost:3000"
    log_info "🔧 Backend API: http://localhost:5001"
    log_info "📱 Mobile Metro: http://localhost:8081"
    echo ""
    log_info "To stop all services, press Ctrl+C"
    echo ""
    
    # Keep script running
    trap 'log_info "Shutting down services..."; kill $BACKEND_PID $WEB_PID $METRO_PID 2>/dev/null || true; exit 0' INT
    
    # Wait for user to stop
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"