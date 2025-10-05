#!/bin/bash

echo "🧪 Testing PawfectMatch Authentication System"
echo "=============================================="
echo ""

API_URL="http://localhost:5001/api"
ORIGIN="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Generate random email for testing
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@pawfect.test"
TEST_PASSWORD="TestPass123!"
TEST_NAME="Test User ${TIMESTAMP}"

echo -e "${BLUE}[TEST 1]${NC} Health Check"
echo "Testing: GET ${API_URL}/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Server is healthy (HTTP $HTTP_CODE)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Server health check failed (HTTP $HTTP_CODE)"
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}[TEST 2]${NC} CORS Preflight Check"
echo "Testing: OPTIONS ${API_URL}/auth/register with Origin: ${ORIGIN}"
CORS_RESPONSE=$(curl -s -i -X OPTIONS "${API_URL}/auth/register" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" 2>&1)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin: ${ORIGIN}"; then
    echo -e "${GREEN}✓ PASSED${NC} - CORS headers present"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - CORS headers missing"
    echo "$CORS_RESPONSE" | grep -i "access-control"
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}[TEST 3]${NC} User Registration"
echo "Testing: POST ${API_URL}/auth/register"
echo "Email: ${TEST_EMAIL}"
echo "Name: ${TEST_NAME}"

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/register" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"User${TIMESTAMP}\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - User registered successfully (HTTP $HTTP_CODE)"
    
    # Extract token
    TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}  → Token received: ${TOKEN:0:20}...${NC}"
    fi
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Registration failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}[TEST 4]${NC} Duplicate Registration (Should Fail)"
echo "Testing: POST ${API_URL}/auth/register with same email"

DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/register" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"User${TIMESTAMP}\"
  }")

HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$DUPLICATE_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "409" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Duplicate registration correctly rejected (HTTP $HTTP_CODE)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Duplicate registration should fail (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}[TEST 5]${NC} User Login with Correct Credentials"
echo "Testing: POST ${API_URL}/auth/login"
echo "Email: ${TEST_EMAIL}"

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/login" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Login successful (HTTP $HTTP_CODE)"
    
    # Extract token
    TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}  → Token received: ${TOKEN:0:20}...${NC}"
        VALID_TOKEN="$TOKEN"
    fi
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Login failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}[TEST 6]${NC} Login with Wrong Password (Should Fail)"
echo "Testing: POST ${API_URL}/auth/login with wrong password"

WRONG_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/login" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"WrongPassword123!\"
  }")

HTTP_CODE=$(echo "$WRONG_LOGIN_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Wrong password correctly rejected (HTTP $HTTP_CODE)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Wrong password should return 401 (HTTP $HTTP_CODE)"
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}[TEST 7]${NC} Login with Non-existent User (Should Fail)"
echo "Testing: POST ${API_URL}/auth/login with fake email"

FAKE_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/login" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"nonexistent${TIMESTAMP}@fake.test\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

HTTP_CODE=$(echo "$FAKE_LOGIN_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Non-existent user correctly rejected (HTTP $HTTP_CODE)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Non-existent user should return 401/404 (HTTP $HTTP_CODE)"
    ((FAILED++))
fi
echo ""

if [ -n "$VALID_TOKEN" ]; then
    echo -e "${BLUE}[TEST 8]${NC} Protected Route Access with Valid Token"
    echo "Testing: GET ${API_URL}/users/me with Authorization header"
    
    ME_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/users/me" \
      -H "Origin: ${ORIGIN}" \
      -H "Authorization: Bearer ${VALID_TOKEN}")
    
    HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$ME_RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Protected route accessible with valid token (HTTP $HTTP_CODE)"
        echo "User data: $(echo "$RESPONSE_BODY" | head -c 100)..."
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} - Protected route should be accessible (HTTP $HTTP_CODE)"
        echo "Response: $RESPONSE_BODY"
        ((FAILED++))
    fi
    echo ""
    
    echo -e "${BLUE}[TEST 9]${NC} Protected Route Access without Token (Should Fail)"
    echo "Testing: GET ${API_URL}/users/me without Authorization header"
    
    NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/users/me" \
      -H "Origin: ${ORIGIN}")
    
    HTTP_CODE=$(echo "$NO_TOKEN_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Protected route correctly rejects request without token (HTTP $HTTP_CODE)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} - Protected route should return 401 without token (HTTP $HTTP_CODE)"
        ((FAILED++))
    fi
    echo ""
fi

echo "=============================================="
echo -e "${BLUE}TEST SUMMARY${NC}"
echo "=============================================="
TOTAL=$((PASSED + FAILED))
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "✅ Sign up is working correctly"
    echo "✅ Login is working correctly"
    echo "✅ CORS is configured properly"
    echo "✅ Authentication tokens are being issued"
    echo "✅ Protected routes are secured"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please check the failed tests above for details."
    exit 1
fi
