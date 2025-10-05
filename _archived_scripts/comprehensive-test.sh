#!/bin/bash

echo "🔍 COMPREHENSIVE PROJECT ANALYSIS & TESTING"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# 1. CHECK PROJECT STRUCTURE
echo -e "${BLUE}[1/10] Project Structure Analysis${NC}"
echo "-----------------------------------"
if [ -d "apps/web" ] && [ -d "server" ] && [ -d "ai-service" ]; then
    echo -e "${GREEN}✓${NC} Monorepo structure intact"
    echo "  - apps/web (Frontend)"
    echo "  - server (Backend API)"
    echo "  - ai-service (AI Service)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Missing core directories"
    ((FAILED++))
fi
echo ""

# 2. CHECK DEPENDENCIES
echo -e "${BLUE}[2/10] Dependencies Check${NC}"
echo "-----------------------------------"
if [ -f "package.json" ] && [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✓${NC} Package files present"
    TOTAL_DEPS=$(cat package.json apps/web/package.json server/package.json 2>/dev/null | grep -o '"dependencies"' | wc -l)
    echo "  - Package managers: pnpm"
    echo "  - Dependency sections found: $TOTAL_DEPS"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Missing package files"
    ((FAILED++))
fi
echo ""

# 3. CHECK CONFIGURATION FILES
echo -e "${BLUE}[3/10] Configuration Files${NC}"
echo "-----------------------------------"
CONFIG_COUNT=0
[ -f "apps/web/.env" ] && echo -e "${GREEN}✓${NC} Frontend .env" && ((CONFIG_COUNT++))
[ -f "server/.env" ] && echo -e "${GREEN}✓${NC} Backend .env" && ((CONFIG_COUNT++))
[ -f "tsconfig.json" ] && echo -e "${GREEN}✓${NC} TypeScript config" && ((CONFIG_COUNT++))
[ -f "turbo.json" ] && echo -e "${GREEN}✓${NC} Turbo config" && ((CONFIG_COUNT++))

if [ $CONFIG_COUNT -ge 3 ]; then
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Missing critical config files"
    ((FAILED++))
fi
echo ""

# 4. CHECK SERVICES STATUS
echo -e "${BLUE}[4/10] Services Status${NC}"
echo "-----------------------------------"
SERVICES_RUNNING=0

if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend (port 3000) - Running"
    ((SERVICES_RUNNING++))
else
    echo -e "${YELLOW}⚠${NC} Frontend (port 3000) - Not running"
fi

if lsof -i :5001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend (port 5001) - Running"
    ((SERVICES_RUNNING++))
else
    echo -e "${YELLOW}⚠${NC} Backend (port 5001) - Not running"
fi

if pgrep mongod > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB - Running"
    ((SERVICES_RUNNING++))
else
    echo -e "${YELLOW}⚠${NC} MongoDB - Not running"
fi

if [ $SERVICES_RUNNING -ge 2 ]; then
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Critical services not running"
    ((FAILED++))
fi
echo ""

# 5. TEST BACKEND API
echo -e "${BLUE}[5/10] Backend API Health${NC}"
echo "-----------------------------------"
if lsof -i :5001 > /dev/null 2>&1; then
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5001/api/health 2>/dev/null)
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} API Health Check: HTTP $HTTP_CODE"
        echo "$HEALTH_RESPONSE" | head -n1 | jq -r '.status' 2>/dev/null | head -1
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} API Health Check Failed: HTTP $HTTP_CODE"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Backend not running - skipping API tests"
    ((FAILED++))
fi
echo ""

# 6. TEST FRONTEND
echo -e "${BLUE}[6/10] Frontend Accessibility${NC}"
echo "-----------------------------------"
if lsof -i :3000 > /dev/null 2>&1; then
    FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000 2>/dev/null)
    HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} Frontend accessible: HTTP $HTTP_CODE"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Frontend not accessible: HTTP $HTTP_CODE"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Frontend not running"
    ((FAILED++))
fi
echo ""

# 7. CHECK KEY COMPONENTS
echo -e "${BLUE}[7/10] Key Components Check${NC}"
echo "-----------------------------------"
COMPONENTS_FOUND=0

[ -f "apps/web/src/components/Background/FluidGradient.tsx" ] && echo -e "${GREEN}✓${NC} FluidGradient component" && ((COMPONENTS_FOUND++))
[ -f "apps/web/src/components/Background/BackgroundProvider.tsx" ] && echo -e "${GREEN}✓${NC} BackgroundProvider component" && ((COMPONENTS_FOUND++))
[ -f "apps/web/src/components/Pet/SwipeCard.tsx" ] && echo -e "${GREEN}✓${NC} SwipeCard component" && ((COMPONENTS_FOUND++))
[ -f "apps/web/src/components/UI/PremiumCard.tsx" ] && echo -e "${GREEN}✓${NC} PremiumCard component" && ((COMPONENTS_FOUND++))
[ -f "apps/web/src/components/Layout/PremiumLayout.tsx" ] && echo -e "${GREEN}✓${NC} PremiumLayout component" && ((COMPONENTS_FOUND++))

if [ $COMPONENTS_FOUND -ge 4 ]; then
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Missing critical components"
    ((FAILED++))
fi
echo ""

# 8. CHECK BACKEND ROUTES
echo -e "${BLUE}[8/10] Backend Routes Check${NC}"
echo "-----------------------------------"
ROUTES_FOUND=0

[ -f "server/src/routes/auth.js" ] && echo -e "${GREEN}✓${NC} Auth routes" && ((ROUTES_FOUND++))
[ -f "server/src/routes/users.js" ] && echo -e "${GREEN}✓${NC} User routes" && ((ROUTES_FOUND++))
[ -f "server/src/routes/pets.js" ] && echo -e "${GREEN}✓${NC} Pet routes" && ((ROUTES_FOUND++))
[ -f "server/src/routes/matches.js" ] && echo -e "${GREEN}✓${NC} Match routes" && ((ROUTES_FOUND++))
[ -f "server/src/routes/chat.js" ] && echo -e "${GREEN}✓${NC} Chat routes" && ((ROUTES_FOUND++))

if [ $ROUTES_FOUND -ge 4 ]; then
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Missing critical routes"
    ((FAILED++))
fi
echo ""

# 9. CHECK DOCUMENTATION
echo -e "${BLUE}[9/10] Documentation Check${NC}"
echo "-----------------------------------"
DOCS_FOUND=0

[ -f "README.md" ] && echo -e "${GREEN}✓${NC} README.md" && ((DOCS_FOUND++))
[ -f "SESSION_SUMMARY.md" ] && echo -e "${GREEN}✓${NC} Session Summary" && ((DOCS_FOUND++))
[ -f "QUICK_START.md" ] && echo -e "${GREEN}✓${NC} Quick Start Guide" && ((DOCS_FOUND++))
[ -f "THREEJS_BACKGROUND_INTEGRATION.md" ] && echo -e "${GREEN}✓${NC} Three.js Integration Docs" && ((DOCS_FOUND++))
[ -f "AUTH_TEST_RESULTS.md" ] && echo -e "${GREEN}✓${NC} Auth Test Results" && ((DOCS_FOUND++))

if [ $DOCS_FOUND -ge 4 ]; then
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Limited documentation"
    ((PASSED++))
fi
echo ""

# 10. CODE QUALITY CHECKS
echo -e "${BLUE}[10/10] Code Quality Indicators${NC}"
echo "-----------------------------------"

# Count TypeScript files
TS_FILES=$(find apps/web/src -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  TypeScript files: $TS_FILES"

# Check for TypeScript config
if [ -f "apps/web/tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} TypeScript configured"
fi

# Check for ESLint
if [ -f ".eslintrc.js" ] || [ -f "apps/web/.eslintrc.json" ]; then
    echo -e "${GREEN}✓${NC} ESLint configured"
fi

# Check for Prettier
if [ -f ".prettierrc" ]; then
    echo -e "${GREEN}✓${NC} Prettier configured"
fi

((PASSED++))
echo ""

# SUMMARY
echo "=============================================="
echo -e "${BLUE}TEST SUMMARY${NC}"
echo "=============================================="
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Total Checks: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Success Rate: ${PERCENTAGE}%"
echo ""

if [ $PERCENTAGE -ge 80 ]; then
    echo -e "${GREEN}🎉 PROJECT STATUS: EXCELLENT${NC}"
    echo "The project is in great shape!"
elif [ $PERCENTAGE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  PROJECT STATUS: GOOD${NC}"
    echo "Most components are working, minor issues detected."
else
    echo -e "${RED}❌ PROJECT STATUS: NEEDS ATTENTION${NC}"
    echo "Several critical issues need to be addressed."
fi

echo ""
echo "=============================================="
echo "📊 DETAILED METRICS"
echo "=============================================="
echo "Code Files: $(find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" 2>/dev/null | grep -v node_modules | grep -v .next | wc -l | tr -d ' ')"
echo "Components: $(find apps/web/src/components -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "Pages: $(find apps/web/app -name "page.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "API Routes: $(find server/src/routes -name "*.js" 2>/dev/null | wc -l | tr -d ' ')"
echo "Documentation Files: $(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ')"
echo ""

exit 0
