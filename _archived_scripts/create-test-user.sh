#!/bin/bash
# Create or verify a test user account for PawfectMatch
API="http://localhost:5001/api"
EMAIL="testuser@example.com"
PASS="Test123!"
FIRST="Test"
LAST="User"
DOB="1990-01-01"

printf "Creating test user...\n"
REG=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"firstName\":\"$FIRST\",\"lastName\":\"$LAST\",\"dateOfBirth\":\"$DOB\"}")
CODE=$(echo "$REG" | tail -n1)
if [[ "$CODE" == "201" || "$CODE" == "200" ]]; then
  echo "✅ Registered new test user $EMAIL"
else
  echo "User may already exist (HTTP $CODE). Proceeding to login."
fi
printf "Logging in...\n"
LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
LCODE=$(echo "$LOGIN" | tail -n1)
BODY=$(echo "$LOGIN" | head -n -1)
if [[ "$LCODE" == "200" ]]; then
  TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d '"' -f4)
  echo "✅ Login success. JWT token: ${TOKEN:0:40}..."
  echo "You can now use these credentials in the web app:\nEmail: $EMAIL\nPassword: $PASS"
else
  echo "❌ Login failed (HTTP $LCODE). Check backend logs."
fi
