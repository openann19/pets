#!/bin/bash

# Production Deployment Script for PawfectMatch Premium
# This script deploys the application with all production-ready features

set -e

echo "🚀 Starting PawfectMatch Premium Production Deployment..."

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

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "DEEPSEEK_API_KEY"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "MONGODB_URI"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please set these variables in your .env.production file or environment."
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Generate secure secrets if not provided
generate_secrets() {
    print_status "Generating secure secrets..."
    
    if [ -z "$JWT_SECRET" ]; then
        export JWT_SECRET=$(openssl rand -base64 64)
        print_warning "Generated new JWT_SECRET"
    fi
    
    if [ -z "$JWT_REFRESH_SECRET" ]; then
        export JWT_REFRESH_SECRET=$(openssl rand -base64 64)
        print_warning "Generated new JWT_REFRESH_SECRET"
    fi
    
    if [ -z "$REDIS_PASSWORD" ]; then
        export REDIS_PASSWORD=$(openssl rand -base64 32)
        print_warning "Generated new REDIS_PASSWORD"
    fi
    
    print_success "Secrets generated successfully"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build API image
    docker build -f server/Dockerfile.production -t pawfectmatch-api:latest ./server
    
    print_success "Docker images built successfully"
}

# Deploy with Docker Compose
deploy_services() {
    print_status "Deploying services with Docker Compose..."
    
    # Stop existing services
    docker-compose -f docker-compose.production.yml down --remove-orphans
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    print_success "Services deployed successfully"
}

# Wait for services to be healthy
wait_for_health() {
    print_status "Waiting for services to be healthy..."
    
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:5001/api/ai/health/detailed > /dev/null 2>&1; then
            print_success "API is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "API failed to become healthy after $max_attempts attempts"
            exit 1
        fi
        
        print_status "Waiting for API to be healthy... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
}

# Run health checks
run_health_checks() {
    print_status "Running comprehensive health checks..."
    
    # Check API health
    echo "🔍 Checking API health..."
    curl -s http://localhost:5001/api/ai/health/detailed | jq '.'
    
    # Check DeepSeek integration
    echo "🔍 Checking DeepSeek integration..."
    curl -s http://localhost:5001/api/ai/health/detailed | jq '.deepseek_api'
    
    # Check database connection
    echo "🔍 Checking database connection..."
    docker-compose -f docker-compose.production.yml exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null
    
    # Check Redis connection
    echo "🔍 Checking Redis connection..."
    docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping > /dev/null
    
    print_success "All health checks passed"
}

# Display deployment information
show_deployment_info() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "  - API: http://localhost:5001"
    echo "  - Health Check: http://localhost:5001/api/ai/health/detailed"
    echo "  - Metrics: http://localhost:5001/api/ai/metrics (admin only)"
    echo "  - Grafana: http://localhost:3000 (admin/admin)"
    echo "  - Prometheus: http://localhost:9090"
    echo ""
    echo "🔧 Management Commands:"
    echo "  - View logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "  - Stop services: docker-compose -f docker-compose.production.yml down"
    echo "  - Restart API: docker-compose -f docker-compose.production.yml restart api"
    echo ""
    echo "📈 Monitoring:"
    echo "  - Check metrics: curl http://localhost:5001/api/ai/metrics"
    echo "  - View Grafana dashboards: http://localhost:3000"
    echo ""
    echo "🔒 Security Notes:"
    echo "  - Change default passwords in production"
    echo "  - Use HTTPS in production"
    echo "  - Configure firewall rules"
    echo "  - Enable log rotation"
}

# Main deployment flow
main() {
    print_status "Starting production deployment..."
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed - some health checks may not work properly"
    fi
    
    # Run deployment steps
    check_env_vars
    generate_secrets
    build_images
    deploy_services
    wait_for_health
    run_health_checks
    show_deployment_info
}

# Run main function
main "$@"