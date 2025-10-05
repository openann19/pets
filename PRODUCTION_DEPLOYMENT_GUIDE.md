# 🚀 Production Deployment Guide - PawfectMatch

## Quick Start (5 Steps to Production)

### Step 1: Prepare Environment Variables

```bash
# Navigate to server directory
cd server

# Copy template
cp env.production.template .env.production

# Generate strong JWT secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Edit .env.production with your favorite editor
nano .env.production
```

**Required values to update in `.env.production`:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Generated secret from above
- `JWT_REFRESH_SECRET` - Different generated secret from above
- `CLIENT_URL` - Your production frontend URL (https://...)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed domains
- `CLOUDINARY_*` - Your Cloudinary credentials
- `STRIPE_*` - Your Stripe live keys

---

### Step 2: Run Production Readiness Check

```bash
# From project root
NODE_ENV=production node scripts/production-check.js
```

This will verify:
- ✅ All required environment variables are set
- ✅ JWT secrets are strong (32+ characters)
- ✅ Admin routes are protected
- ✅ User model has role field
- ✅ All files are in place

**Expected output:**
```
🎉 All checks passed! Your application is production-ready.
```

---

### Step 3: Initialize Database

```bash
# Create indexes for optimal performance
node scripts/create-indexes.js

# Run migrations to add user roles
node scripts/migrations/001-add-user-roles.js

# Create admin user
node scripts/create-admin-user.js admin@yourcompany.com StrongPassword123!
```

**What this does:**
- Creates 20+ database indexes for fast queries
- Adds role field to existing users
- Creates your first admin account

---

### Step 4: Test Locally in Production Mode

```bash
# Start server in production mode
cd server
NODE_ENV=production node server.js
```

**Verify:**
```bash
# 1. Health check
curl http://localhost:5001/health

# 2. Login as admin
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourcompany.com","password":"StrongPassword123!"}'

# 3. Test admin endpoint (use token from step 2)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/admin/metrics
```

---

### Step 5: Deploy to Production

#### Option A: Docker Deployment

```bash
# Build image
docker build -t pawfectmatch-backend:latest ./server

# Run container
docker run -d \
  --name pawfectmatch-backend \
  -p 5001:5001 \
  --env-file ./server/.env.production \
  pawfectmatch-backend:latest
```

#### Option B: PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd server
pm2 start server.js --name pawfectmatch --env production

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

#### Option C: Manual Deployment

```bash
cd server
NODE_ENV=production node server.js
```

---

## 🔒 Security Checklist

Before going live, verify:

- [ ] JWT secrets are strong (64+ characters, randomly generated)
- [ ] MongoDB URI uses production database (not localhost)
- [ ] CLIENT_URL uses HTTPS
- [ ] Admin user password is strong
- [ ] Cloudinary credentials are for production account
- [ ] Stripe keys are LIVE keys (sk_live_*)
- [ ] CORS only allows your production domains
- [ ] Environment variables are not committed to git

---

## 📊 Performance Optimization

### Verify Indexes Are Active

```javascript
// In MongoDB shell or Compass
db.pets.find({ species: 'dog', intent: 'adoption', isActive: true }).explain('executionStats')

// Should show:
// - "stage": "IXSCAN" (using index)
// - Low execution time (<50ms)
```

### Monitor Performance

```bash
# Check metrics (requires admin token)
curl -H "Authorization: Bearer ADMIN_TOKEN" http://your-api.com/api/admin/metrics

# Check system info
curl -H "Authorization: Bearer ADMIN_TOKEN" http://your-api.com/api/admin/system/info
```

---

## 🔥 Rate Limiting in Production

**Authentication endpoints:** 5 requests per 15 minutes  
**API endpoints:** 100 requests per 15 minutes  

If users exceed limits, they receive:
```json
{
  "success": false,
  "message": "Too many requests, please try again later.",
  "retryAfter": 900
}
```

---

## 🛡️ Admin Access

### Admin Routes Protected

All `/api/admin/*` routes now require:
1. Valid JWT token
2. User role = 'admin'

### Create Additional Admins

```bash
# Method 1: Using script
node scripts/create-admin-user.js newadmin@company.com SecurePass123!

# Method 2: Promote existing user
# In MongoDB:
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🔄 Maintenance Scripts

### Create Database Indexes
```bash
node scripts/create-indexes.js          # Create
node scripts/create-indexes.js list     # List all
node scripts/create-indexes.js drop     # Drop all (caution!)
```

### User Migrations
```bash
node scripts/migrations/001-add-user-roles.js      # Add roles
node scripts/migrations/001-add-user-roles.js down # Rollback
```

### Admin Management
```bash
node scripts/create-admin-user.js <email> <password>
```

### Production Check
```bash
NODE_ENV=production node scripts/production-check.js
```

---

## 📈 Monitoring

### Health Check Endpoint

```bash
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "checks": {
    "mongodb": "healthy",
    "redis": "healthy",
    "cloudinary": "healthy",
    "aiService": "healthy"
  },
  "timestamp": "2025-10-03T..."
}
```

### Metrics (Admin Only)

```bash
GET /api/admin/metrics
Authorization: Bearer <admin-token>
```

### Cache Management (Admin Only)

```bash
# View cache stats
GET /api/admin/cache/stats

# Clear all cache
POST /api/admin/cache/clear

# Clear specific pattern
POST /api/admin/cache/invalidate
{ "pattern": "pets:*" }
```

---

## 🐛 Troubleshooting

### Server Won't Start

**Check environment validation:**
```bash
# Run in debug mode
DEBUG=* NODE_ENV=production node server/server.js
```

Common issues:
- Missing environment variables
- Weak JWT secrets
- MongoDB connection failure

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "YOUR_MONGODB_URI"

# Check server can connect
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌', err))"
```

### Admin Routes Return 401/403

- 401 Unauthorized = No/invalid token
- 403 Forbidden = User is not admin

```bash
# Check user role in database
mongosh
use pawfectmatch
db.users.findOne({ email: "admin@example.com" }, { email: 1, role: 1 })
```

### Rate Limiting Too Strict

Edit `server/src/config/production.js`:
```javascript
rateLimiting: {
  api: {
    max: 200  // Increase from 100
  }
}
```

---

## 🔄 Rollback Plan

If you need to rollback:

```bash
# 1. Stop the server
pm2 stop pawfectmatch

# 2. Restore previous code version
git checkout previous-version

# 3. Rollback migrations (if needed)
node scripts/migrations/001-add-user-roles.js down

# 4. Restart
pm2 start pawfectmatch
```

---

## 📞 Support & Documentation

- **Implementation Summary:** `PRODUCTION_READINESS_IMPLEMENTED.md`
- **Full Plan:** `PRODUCTION_READINESS_PLAN.bg.md`
- **Environment Template:** `server/env.production.template`

---

## ✅ Pre-Launch Checklist

Use this before going live:

```bash
# Run automated check
NODE_ENV=production node scripts/production-check.js
```

**Manual verification:**
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Admin user created
- [ ] Health endpoint responds
- [ ] Admin routes protected
- [ ] Rate limiting active
- [ ] Logs are writable
- [ ] MongoDB backup configured
- [ ] SSL/HTTPS configured
- [ ] Domain DNS configured

---

## 🎉 You're Ready!

Your PawfectMatch backend is now **production-ready** with:

✅ Enterprise-grade security  
✅ Optimized database performance  
✅ Comprehensive error handling  
✅ Admin access control  
✅ Rate limiting protection  
✅ Environment validation  

**Deploy with confidence!** 🚀

---

*Last updated: October 3, 2025*  
*Version: 1.0.0*

