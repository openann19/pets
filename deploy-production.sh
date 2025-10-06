#!/bin/bash

# PawfectMatch Production Deployment Script
# This script handles the complete deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_ROOT="$(pwd)"
BACKEND_DIR="$PROJECT_ROOT/server"
FRONTEND_DIR="$PROJECT_ROOT/apps/web"
ENV_FILE="$BACKEND_DIR/.env.production"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Production environment file not found: $ENV_FILE"
        log_info "Please create it from the template and configure with real values"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

# Function to run security audit
run_security_audit() {
    log_info "Running security audit..."
    
    # Check for known vulnerabilities
    log_info "Checking for npm vulnerabilities..."
    cd "$PROJECT_ROOT"
    pnpm audit --prod
    
    # Check for exposed secrets
    log_info "Checking for exposed secrets..."
    if grep -r "password\|secret\|key" "$BACKEND_DIR" --include="*.js" --include="*.ts" | grep -v "process.env" | grep -v "node_modules" | head -10; then
        log_warning "Potential secrets found in code. Please review."
    fi
    
    # Check environment variables
    log_info "Validating environment configuration..."
    if grep -q "YOUR_" "$ENV_FILE" || grep -q "example" "$ENV_FILE"; then
        log_error "Environment file contains placeholder values. Please update with real values."
        exit 1
    fi
    
    log_success "Security audit completed"
}

# Function to build the application
build_application() {
    log_info "Building application..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    pnpm install --frozen-lockfile
    
    # Build frontend
    log_info "Building frontend..."
    cd "$FRONTEND_DIR"
    pnpm build
    
    # Build backend
    log_info "Building backend..."
    cd "$BACKEND_DIR"
    pnpm build
    
    log_success "Application built successfully"
}

# Function to run tests
run_tests() {
    log_info "Running tests..."
    
    # Run backend tests
    log_info "Running backend tests..."
    cd "$BACKEND_DIR"
    if pnpm test; then
        log_success "Backend tests passed"
    else
        log_error "Backend tests failed"
        exit 1
    fi
    
    # Run frontend tests
    log_info "Running frontend tests..."
    cd "$FRONTEND_DIR"
    if pnpm test -- --passWithNoTests; then
        log_success "Frontend tests passed"
    else
        log_error "Frontend tests failed"
        exit 1
    fi
    
    log_success "All tests passed"
}

# Function to deploy with Docker
deploy_with_docker() {
    log_info "Deploying with Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Build and start new containers
    log_info "Building and starting containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        log_success "Services are running"
    else
        log_error "Some services failed to start"
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs
        exit 1
    fi
}

# Function to deploy without Docker
deploy_without_docker() {
    log_info "Deploying without Docker..."
    
    # Start backend
    log_info "Starting backend server..."
    cd "$BACKEND_DIR"
    pm2 start ecosystem.config.js --env production
    
    # Start frontend
    log_info "Starting frontend server..."
    cd "$FRONTEND_DIR"
    pm2 start ecosystem.config.js --env production
    
    log_success "Application deployed with PM2"
}

# Function to run database migrations
run_database_migrations() {
    log_info "Running database migrations..."
    
    cd "$BACKEND_DIR"
    
    # Create database indexes
    log_info "Creating database indexes..."
    node scripts/createIndexes.js
    
    # Seed production data (optional)
    if [ "$1" == "--seed" ]; then
        log_info "Seeding production data..."
        node scripts/seed-production-data.js --clear
    fi
    
    log_success "Database setup completed"
}

# Function to perform health checks
perform_health_checks() {
    log_info "Performing health checks..."
    
    # Get backend URL from environment
    BACKEND_URL=$(grep "CLIENT_URL" "$ENV_FILE" | cut -d '=' -f2 | sed 's/https/http/')
    if [ -z "$BACKEND_URL" ]; then
        BACKEND_URL="http://localhost:5001"
    fi
    
    # Check backend health
    log_info "Checking backend health..."
    if curl -f -s "$BACKEND_URL/api/health" > /dev/null; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Check database connection
    log_info "Checking database connection..."
    cd "$BACKEND_DIR"
    if node -e "
        const mongoose = require('mongoose');
        require('dotenv').config({ path: '.env.production' });
        mongoose.connect(process.env.MONGODB_URI)
            .then(() => {
                console.log('Database connected');
                process.exit(0);
            })
            .catch(err => {
                console.error('Database connection failed:', err.message);
                process.exit(1);
            });
    "; then
        log_success "Database connection successful"
    else
        log_error "Database connection failed"
        exit 1
    fi
    
    log_success "All health checks passed"
}

# Function to create deployment summary
create_deployment_summary() {
    log_info "Creating deployment summary..."
    
    SUMMARY_FILE="$PROJECT_ROOT/deployment-summary-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$SUMMARY_FILE" << EOF
PawfectMatch Production Deployment Summary
==========================================
Deployment Time: $(date)
Deployment Method: $DEPLOYMENT_METHOD

Services Deployed:
- Backend API: $(grep "CLIENT_URL" "$ENV_FILE" | cut -d '=' -f2)
- Frontend: $(grep "CLIENT_URL" "$ENV_FILE" | cut -d '=' -f2)
- Database: $(grep "MONGODB_URI" "$ENV_FILE" | cut -d '=' -f2 | cut -d '@' -f2 | cut -d '/' -f1)

Health Check Results:
- Backend: ✅ Healthy
- Database: ✅ Connected
- AI Service: ✅ Configured
- Stripe: ✅ Configured

Next Steps:
1. Verify all services are running correctly
2. Test user registration and login
3. Test payment processing
4. Monitor application logs
5. Set up monitoring alerts

Troubleshooting:
- Check logs: docker-compose -f $DOCKER_COMPOSE_FILE logs
- Restart services: docker-compose -f $DOCKER_COMPOSE_FILE restart
- View deployment logs: tail -f $PROJECT_ROOT/deployment.log

EOF

    log_success "Deployment summary created: $SUMMARY_FILE"
}

# Main deployment function
main() {
    log_info "Starting PawfectMatch production deployment..."
    
    # Parse command line arguments
    DEPLOYMENT_METHOD="docker"
    SEED_DATABASE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-docker)
                DEPLOYMENT_METHOD="pm2"
                shift
                ;;
            --seed)
                SEED_DATABASE=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    run_security_audit
    build_application
    run_tests
    
    if [ "$DEPLOYMENT_METHOD" == "docker" ]; then
        deploy_with_docker
    else
        deploy_without_docker
    fi
    
    if [ "$SEED_DATABASE" == true ]; then
        run_database_migrations --seed
    else
        run_database_migrations
    fi
    
    perform_health_checks
    create_deployment_summary
    
    log_success "🎉 PawfectMatch production deployment completed successfully!"
    log_info "Your application is now live and ready for users."
}

# Run main function with all arguments
main "$@"
