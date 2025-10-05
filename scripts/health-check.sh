#!/bin/bash

# PawfectMatch Premium - Production Health Check Script
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
AI_SERVICE_URL="${AI_SERVICE_URL:-http://localhost:8000}"
TIMEOUT=5

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}PawfectMatch Health Check${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
    
    if [ "$response" -eq "$expected_status" ] || [ "$response" -eq 200 ] || [ "$response" -eq 301 ] || [ "$response" -eq 302 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
        return 1
    fi
}

# Check Docker containers if running in Docker
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Checking Docker containers...${NC}"
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "pawfectmatch"; then
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep "pawfectmatch"
        echo ""
    else
        echo -e "${YELLOW}No PawfectMatch containers found (may be running directly)${NC}"
        echo ""
    fi
fi

# Initialize counters
total=0
passed=0

# Check Backend API
total=$((total + 1))
if check_endpoint "Backend API Health" "$BACKEND_URL/api/health"; then
    passed=$((passed + 1))
fi

# Check Frontend
total=$((total + 1))
if check_endpoint "Frontend Homepage" "$FRONTEND_URL"; then
    passed=$((passed + 1))
fi

# Check AI Service (if configured)
if [ "$AI_SERVICE_URL" != "http://localhost:8000" ] || nc -z localhost 8000 2>/dev/null; then
    total=$((total + 1))
    if check_endpoint "AI Service Health" "$AI_SERVICE_URL/health"; then
        passed=$((passed + 1))
    fi
fi

echo ""
echo -e "${BLUE}================================${NC}"

# Calculate percentage
percentage=$((passed * 100 / total))

# Display summary
if [ $passed -eq $total ]; then
    echo -e "${GREEN}✓ All checks passed ($passed/$total)${NC}"
    echo -e "${GREEN}System Status: HEALTHY${NC}"
    exit 0
elif [ $percentage -ge 50 ]; then
    echo -e "${YELLOW}⚠ Some checks failed ($passed/$total)${NC}"
    echo -e "${YELLOW}System Status: DEGRADED${NC}"
    exit 1
else
    echo -e "${RED}✗ Most checks failed ($passed/$total)${NC}"
    echo -e "${RED}System Status: UNHEALTHY${NC}"
    exit 2
fi
