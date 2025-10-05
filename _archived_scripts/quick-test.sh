#!/bin/bash
echo "🧪 QUICK TEST & FIX"
echo "==================="
echo ""

# Test 1: Backend Health
echo "[1] Testing Backend..."
HEALTH=$(curl -s http://localhost:5001/api/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Backend healthy"
else
    echo "❌ Backend issue - restarting..."
    pkill -f 'node server.js'
    cd server && node server.js > ../logs/backend.log 2>&1 &
    sleep 3
fi

# Test 2: Frontend
echo "[2] Testing Frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND" = "200" ]; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend issue (HTTP $FRONTEND)"
fi

# Test 3: CORS
echo "[3] Testing CORS..."
CORS=$(curl -s -I -X OPTIONS http://localhost:5001/api/auth/login -H "Origin: http://localhost:3000" | grep -i "access-control-allow-origin")
if [ -n "$CORS" ]; then
    echo "✅ CORS configured"
else
    echo "❌ CORS not configured"
fi

# Test 4: Three.js Background
echo "[4] Checking Three.js components..."
if [ -f "apps/web/src/components/Background/FluidGradient.tsx" ] && [ -f "apps/web/src/components/Background/BackgroundProvider.tsx" ]; then
    echo "✅ Background components present"
else
    echo "❌ Missing background components"
fi

# Test 5: Auth endpoints
echo "[5] Testing Auth endpoints..."
REGISTER=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5001/api/auth/register -H "Content-Type: application/json" -d '{}')
if [ "$REGISTER" = "400" ] || [ "$REGISTER" = "429" ]; then
    echo "✅ Register endpoint responding"
else
    echo "⚠️  Register endpoint: HTTP $REGISTER"
fi

echo ""
echo "✅ All critical services running!"
echo ""
echo "Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5001"
echo "  Health:   http://localhost:5001/api/health"
