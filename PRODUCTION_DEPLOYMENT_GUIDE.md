# 🚀 Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying PawfectMatch Premium with DeepSeek AI integration to production environments.

## 🏗️ Architecture

### Production Stack
- **Backend API**: Node.js 18 with Express.js
- **Database**: MongoDB 7.0 with authentication
- **Cache**: Redis 7.2 with persistence
- **Reverse Proxy**: Nginx with SSL termination
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker + Docker Compose
- **AI Integration**: DeepSeek API with fallback systems

### Service Dependencies
```
Nginx → API → MongoDB
       ↓
      Redis
       ↓
   DeepSeek API
```

## 🔧 Prerequisites

### System Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 20GB+ SSD
- **Network**: Stable internet connection
- **OS**: Linux (Ubuntu 20.04+ recommended)

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- OpenSSL (for secret generation)
- curl (for health checks)
- jq (for JSON processing)

## 🚀 Quick Deployment

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/pawfectmatch-premium.git
cd pawfectmatch-premium
```

### 2. Configure Environment
```bash
# Copy production template
cp server/.env.production.template server/.env.production

# Edit with your values
nano server/.env.production
```

### 3. Deploy
```bash
# Make deployment script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

## ⚙️ Configuration

### Required Environment Variables

#### Core Configuration
```bash
# Server
NODE_ENV=production
PORT=5001
CLIENT_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb://username:password@mongo:27017/pawfectmatch

# JWT Secrets (Generate with: openssl rand -base64 64)
JWT_SECRET=your-64-character-secret
JWT_REFRESH_SECRET=your-64-character-refresh-secret
```

#### DeepSeek AI Configuration
```bash
# DeepSeek API (REQUIRED)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# AI Cache Configuration
AI_CACHE_TTL=3600000
AI_MAX_CACHE_SIZE=1000
```

#### Infrastructure
```bash
# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
GRAFANA_PASSWORD=your-grafana-password
```

### Optional Configuration
```bash
# AI Service (leave unset to use DeepSeek directly)
AI_SERVICE_URL=https://your-ai-service.com

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
```

## 🔒 Security Configuration

### SSL/TLS Setup
1. **Obtain SSL Certificate**
   ```bash
   # Using Let's Encrypt (recommended)
   certbot certonly --standalone -d your-domain.com
   ```

2. **Configure Nginx SSL**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
       ssl_prefer_server_ciphers off;
   }
   ```

### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Database Security
```bash
# MongoDB Authentication
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["root"]
})
```

## 📊 Monitoring Setup

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'pawfectmatch-api'
    static_configs:
      - targets: ['api:5001']
    metrics_path: '/api/ai/metrics'
```

### Grafana Dashboards
- **API Metrics**: Request rates, response times, error rates
- **DeepSeek Integration**: API calls, fallback usage, costs
- **System Metrics**: CPU, memory, disk usage
- **Database Metrics**: Connection counts, query performance

### Alerting Rules
```yaml
# Example Prometheus alerting rules
groups:
  - name: pawfectmatch
    rules:
      - alert: HighErrorRate
        expr: rate(ai_requests_failed[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
```

## 🧪 Testing

### Production Readiness Tests
```bash
# Run comprehensive tests
cd server
npm test -- tests/production/production-ready.test.js

# Load testing
npm test -- tests/production/production-ready.test.js --grep "Load Tests"
```

### Health Checks
```bash
# Basic health check
curl http://localhost:5001/api/ai/health

# Detailed health check
curl http://localhost:5001/api/ai/health/detailed

# Metrics (admin only)
curl -H "Authorization: Bearer admin-token" \
  http://localhost:5001/api/ai/metrics
```

## 🔄 Deployment Process

### 1. Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Database backups created
- [ ] DNS records updated
- [ ] Firewall rules configured
- [ ] Monitoring alerts configured

### 2. Deployment Steps
```bash
# 1. Stop existing services
docker-compose -f docker-compose.production.yml down

# 2. Pull latest code
git pull origin main

# 3. Build new images
docker-compose -f docker-compose.production.yml build

# 4. Start services
docker-compose -f docker-compose.production.yml up -d

# 5. Wait for health checks
./deploy-production.sh
```

### 3. Post-deployment Verification
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Verify health
curl http://localhost:5001/api/ai/health/detailed

# Check logs
docker-compose -f docker-compose.production.yml logs -f api
```

## 📈 Performance Optimization

### Caching Strategy
- **Response Cache**: 1-hour TTL for AI responses
- **Redis Cache**: Distributed rate limiting
- **CDN**: Static asset caching (if applicable)

### Database Optimization
```javascript
// MongoDB indexes
db.pets.createIndex({ "location": "2dsphere" })
db.users.createIndex({ "email": 1 }, { unique: true })
db.matches.createIndex({ "users": 1, "createdAt": -1 })
```

### API Optimization
- **Connection Pooling**: MongoDB and Redis
- **Request Compression**: Gzip compression
- **Rate Limiting**: Prevent abuse
- **Caching**: Reduce API calls

## 🚨 Troubleshooting

### Common Issues

#### 1. DeepSeek API Errors
```bash
# Check API key
curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  https://api.deepseek.com/v1/models

# Check health status
curl http://localhost:5001/api/ai/health/detailed | jq '.deepseek_api'
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
docker-compose -f docker-compose.production.yml exec mongo \
  mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI
```

#### 3. High Memory Usage
```bash
# Check memory usage
docker stats

# Restart API service
docker-compose -f docker-compose.production.yml restart api
```

#### 4. Rate Limiting Issues
```bash
# Check rate limit status
curl -H "Authorization: Bearer token" \
  http://localhost:5001/api/ai/rate-limit-status

# Clear rate limits (admin only)
curl -X POST -H "Authorization: Bearer admin-token" \
  http://localhost:5001/api/ai/rate-limits/reset
```

### Log Analysis
```bash
# View API logs
docker-compose -f docker-compose.production.yml logs -f api

# Search for errors
docker-compose -f docker-compose.production.yml logs api | grep ERROR

# Monitor real-time logs
docker-compose -f docker-compose.production.yml logs -f --tail=100 api
```

## 🔄 Maintenance

### Regular Tasks
- **Daily**: Check health status and error rates
- **Weekly**: Review metrics and performance
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize costs

### Backup Strategy
```bash
# MongoDB backup
docker-compose -f docker-compose.production.yml exec mongo \
  mongodump --out /backup/$(date +%Y%m%d)

# Redis backup
docker-compose -f docker-compose.production.yml exec redis \
  redis-cli BGSAVE
```

### Updates and Patches
```bash
# Update application
git pull origin main
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## 📞 Support

### Monitoring Dashboards
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **API Health**: http://localhost:5001/api/ai/health/detailed

### Emergency Contacts
- **System Admin**: admin@your-domain.com
- **DevOps Team**: devops@your-domain.com
- **DeepSeek Support**: support@deepseek.com

### Escalation Procedures
1. **Level 1**: Check health endpoints and logs
2. **Level 2**: Restart services and check configuration
3. **Level 3**: Contact system administrator
4. **Level 4**: Contact DeepSeek support for API issues

---

## 🎉 Success Metrics

### Deployment Success Criteria
- ✅ All services healthy and responding
- ✅ DeepSeek API integration working
- ✅ Database connections stable
- ✅ Monitoring and alerting active
- ✅ SSL certificates valid
- ✅ Performance benchmarks met
- ✅ Security checks passed

### Performance Targets
- **Response Time**: < 2 seconds for AI endpoints
- **Uptime**: > 99.9%
- **Error Rate**: < 1%
- **Cache Hit Rate**: > 80%
- **API Success Rate**: > 95%

**🚀 Your PawfectMatch Premium production deployment is ready!**