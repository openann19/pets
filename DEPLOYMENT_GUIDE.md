# PawfectMatch Premium - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** October 2, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development Deployment](#local-development-deployment)
4. [Production Deployment with Docker](#production-deployment-with-docker)
5. [Manual Deployment](#manual-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software:
- **Node.js**: v18.x or higher
- **pnpm**: v8.15.0 or higher
- **Docker**: v24.x or higher
- **Docker Compose**: v2.x or higher
- **MongoDB**: v7.0 or higher (if not using Docker)
- **Redis**: v7.2 or higher (if not using Docker)
- **Python**: v3.9+ (for AI service)

### Required Accounts/Services:
- MongoDB Atlas account (or local MongoDB)
- Redis instance (or local Redis)
- Stripe account (for payment processing)
- DeepSeek API key (for AI features)
- (Optional) Sentry account (for error tracking)
- (Optional) Cloudinary account (for image hosting)
- Domain name with SSL certificate

---

## Environment Setup

### 1. Clone the Repository

```bash
cd /path/to/deployment
git clone <repository-url> pawfectmatch-premium
cd pawfectmatch-premium
```

### 2. Install pnpm (if not installed)

```bash
npm install -g pnpm@8.15.0
```

### 3. Create Environment Files

Create the following environment files with your production credentials:

#### Root `.env` (optional, for monorepo-level config):
```bash
# Not required, but can be used for shared configs
```

#### `server/.env.production`:
```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawfectmatch_production?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=<generate-strong-random-string-64-chars>
JWT_REFRESH_SECRET=<generate-different-strong-random-string-64-chars>
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=30d

# API Configuration
NODE_ENV=production
PORT=5000
CLIENT_URL=https://pawfectmatch.com

# AI Service
AI_SERVICE_URL=https://ai.pawfectmatch.com

# DeepSeek AI
DEEPSEEK_API_KEY=<your-deepseek-api-key>

# Security
CORS_ORIGIN=https://pawfectmatch.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/pawfectmatch/server.log

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@pawfectmatch.com
EMAIL_PASS=<your-app-password>
EMAIL_FROM=noreply@pawfectmatch.com

# Redis
REDIS_URL=rediss://username:password@your-redis-host:port

# Stripe
STRIPE_SECRET_KEY=sk_live_<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-publishable-key>

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=<your-google-maps-key>

# Sentry (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### `apps/web/.env.production`:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.pawfectmatch.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.pawfectmatch.com
NEXT_PUBLIC_AI_API_URL=https://ai.pawfectmatch.com

# App Configuration
NEXT_PUBLIC_APP_NAME="PawfectMatch Premium"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_DESCRIPTION="Find your pet's perfect match with AI-powered matching"

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=<your-analytics-id>

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# CDN (Optional)
NEXT_PUBLIC_CDN_URL=https://cdn.pawfectmatch.com

# Social Media
NEXT_PUBLIC_SOCIAL_TWITTER=https://twitter.com/pawfectmatch
NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/pawfectmatch
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/pawfectmatch

# Contact
NEXT_PUBLIC_SUPPORT_EMAIL=support@pawfectmatch.com
NEXT_PUBLIC_CONTACT_PHONE=+1-555-PETFIND

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your-stripe-publishable-key>
```

#### `ai-service/.env`:
```bash
DEEPSEEK_API_KEY=<your-deepseek-api-key>
REDIS_URL=redis://redis:6379
```

---

## Local Development Deployment

### 1. Install Dependencies

```bash
pnpm install --frozen-lockfile
```

### 2. Start Development Services

```bash
# Start all services in development mode
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: (if configured) http://localhost:8000

### 3. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:5000/api/health

---

## Production Deployment with Docker

**Recommended for production environments.**

### 1. Prepare Environment Variables

Create a `.env` file in the root directory for Docker Compose:

```bash
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=<strong-password>

# JWT Secrets
JWT_SECRET=<64-char-random-string>

# DeepSeek API
DEEPSEEK_API_KEY=<your-api-key>

# Stripe
STRIPE_SECRET_KEY=sk_live_<key>
STRIPE_WEBHOOK_SECRET=whsec_<secret>
```

### 2. Build and Start Containers

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d
```

This will start:
- **MongoDB** on port 27017
- **Redis** on port 6379
- **Backend API** on port 5000
- **AI Service** on port 8000
- **Web App** on port 3000
- **Nginx** on ports 80 (HTTP) and 443 (HTTPS)

### 3. Verify Containers

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 4. Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

---

## Manual Deployment

### Backend Deployment

```bash
cd server

# Install dependencies
npm ci --only=production

# Start the server
NODE_ENV=production npm start
```

### Frontend Deployment

```bash
cd apps/web

# Install dependencies
pnpm install --frozen-lockfile --prod

# Build the application
pnpm build

# Start the production server
pnpm start
```

### AI Service Deployment

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app:app --host 0.0.0.0 --port 8000
```

---

## Nginx Configuration

### SSL/TLS Setup

Place your SSL certificates in `nginx/ssl/`:
- `nginx/ssl/certificate.crt`
- `nginx/ssl/private.key`

### Nginx Config (`nginx/nginx.conf`)

The provided configuration includes:
- HTTP to HTTPS redirect
- WebSocket support
- Gzip compression
- Security headers
- Rate limiting
- Static asset caching

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check Backend
curl https://api.pawfectmatch.com/api/health

# Check Frontend
curl https://pawfectmatch.com

# Check AI Service
curl https://ai.pawfectmatch.com/health
```

Expected response for backend:
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T...",
  "uptime": 12345,
  "database": "connected"
}
```

### 2. Verify Database Connection

```bash
# Connect to MongoDB container
docker exec -it pawfectmatch-mongodb mongosh -u admin -p <password>

# List databases
show dbs

# Use the application database
use pawfectmatch

# Check collections
show collections
```

### 3. Verify Redis Connection

```bash
# Connect to Redis container
docker exec -it pawfectmatch-redis redis-cli

# Test connection
PING
# Expected: PONG

# Check keys (should be empty initially)
KEYS *
```

### 4. Test Critical Flows

1. **Registration Flow**:
   - Navigate to https://pawfectmatch.com/register
   - Create a test account
   - Verify email confirmation (if enabled)

2. **Login Flow**:
   - Navigate to https://pawfectmatch.com/login
   - Login with test credentials
   - Verify redirect to dashboard

3. **Premium Features**:
   - Navigate to https://pawfectmatch.com/premium
   - Verify premium tiers are displayed
   - Test subscription flow (use Stripe test mode)

4. **Real-time Features**:
   - Test chat functionality
   - Verify Socket.io connection in browser console

---

## Monitoring & Maintenance

### Logging

**Backend Logs:**
```bash
# View backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Log file location (in container)
/var/log/pawfectmatch/server.log
```

**Frontend Logs:**
```bash
# View frontend logs
docker-compose -f docker-compose.prod.yml logs -f web
```

### Database Backups

```bash
# Backup MongoDB
docker exec pawfectmatch-mongodb mongodump --out /backup --authenticationDatabase admin -u admin -p <password>

# Copy backup to host
docker cp pawfectmatch-mongodb:/backup ./backup-$(date +%Y%m%d)
```

### Redis Persistence

Redis is configured with RDB snapshots. Data persists in the `redis_data` volume.

### Update Deployment

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml up --build -d

# OR for rolling update (zero downtime)
docker-compose -f docker-compose.prod.yml up -d --no-deps --build web
```

---

## Troubleshooting

### Issue: Containers won't start

**Solution:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Verify environment variables
docker-compose -f docker-compose.prod.yml config

# Remove and recreate
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up --build
```

### Issue: Database connection fails

**Solution:**
```bash
# Check MongoDB container
docker exec -it pawfectmatch-mongodb mongosh

# Verify connection string in backend logs
docker-compose -f docker-compose.prod.yml logs backend | grep MONGODB

# Ensure MongoDB is fully started before backend
# Add depends_on with health check
```

### Issue: Frontend can't reach backend

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` in `.env.production`
2. Check CORS settings in backend
3. Verify Nginx proxy configuration
4. Check browser console for errors

### Issue: SSL certificate errors

**Solution:**
1. Verify certificate files in `nginx/ssl/`
2. Check certificate expiration: `openssl x509 -in certificate.crt -noout -dates`
3. Ensure certificate matches domain
4. Restart Nginx: `docker-compose -f docker-compose.prod.yml restart nginx`

### Issue: High memory usage

**Solution:**
```bash
# Check container stats
docker stats

# Limit container resources in docker-compose.prod.yml:
services:
  web:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Issue: WebSocket connection fails

**Solution:**
1. Check Socket.io connection in browser console
2. Verify WebSocket upgrade in Nginx config
3. Ensure firewall allows WebSocket connections
4. Check `NEXT_PUBLIC_SOCKET_URL` configuration

---

## Scaling

### Horizontal Scaling

To scale the web application:

```bash
# Scale web instances
docker-compose -f docker-compose.prod.yml up -d --scale web=3

# Update Nginx for load balancing
# Edit nginx/nginx.conf to add upstream servers
```

### Database Scaling

For production, consider:
- MongoDB Atlas (managed, auto-scaling)
- MongoDB Replica Sets
- Read replicas for analytics queries

### Caching Strategy

- Redis for session storage
- Redis for API response caching
- CDN for static assets (Cloudinary, Cloudflare)

---

## Security Best Practices

1. **Secrets Management**:
   - Never commit `.env` files
   - Use secret management service (AWS Secrets Manager, HashiCorp Vault)
   - Rotate secrets regularly

2. **Firewall Configuration**:
   - Only expose ports 80 and 443 publicly
   - Restrict database ports to internal network
   - Use VPC for cloud deployments

3. **SSL/TLS**:
   - Use Let's Encrypt for free SSL certificates
   - Enable HSTS (already configured)
   - Use TLS 1.3 minimum

4. **Regular Updates**:
   - Keep Docker images updated
   - Update Node.js dependencies monthly
   - Monitor security advisories

5. **Backup Strategy**:
   - Daily automated database backups
   - Weekly full system backups
   - Test restore procedures regularly

---

## Performance Optimization

1. **CDN Configuration**:
   - Serve static assets via CDN
   - Configure `NEXT_PUBLIC_CDN_URL`

2. **Caching Headers**:
   - Already configured in Nginx
   - Verify with: `curl -I https://pawfectmatch.com/image.jpg`

3. **Database Indexing**:
   - Ensure indexes on frequently queried fields
   - Monitor slow queries

4. **Connection Pooling**:
   - MongoDB connection pooling configured
   - Redis connection pooling enabled

---

## Support & Maintenance

### Monitoring Tools (Recommended):
- **Uptime**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry (already integrated)
- **Performance**: New Relic, DataDog
- **Logs**: ELK Stack, Papertrail

### Maintenance Schedule:
- **Daily**: Check logs, monitor uptime
- **Weekly**: Review performance metrics, check disk space
- **Monthly**: Update dependencies, security audit
- **Quarterly**: Database optimization, backup testing

---

## Quick Commands Reference

```bash
# Start production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart web

# Execute command in container
docker exec -it pawfectmatch-web sh

# Check container health
docker-compose -f docker-compose.prod.yml ps

# Update and redeploy
git pull && docker-compose -f docker-compose.prod.yml up -d --build

# Database backup
docker exec pawfectmatch-mongodb mongodump --out /backup

# View resource usage
docker stats
```

---

## Contact & Support

For deployment issues or questions:
- **Email**: devops@pawfectmatch.com
- **Documentation**: https://docs.pawfectmatch.com
- **Issues**: https://github.com/pawfectmatch/issues

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** October 2, 2025  
**Maintained By:** PawfectMatch DevOps Team

