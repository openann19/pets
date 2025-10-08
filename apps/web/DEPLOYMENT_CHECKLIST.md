# 🚀 Deployment Checklist - PawfectMatch Web

## Pre-Deployment Verification ✅

### Build & Compile
- [x] Application builds without errors using production config
- [x] TypeScript compiles with `tsconfig.production.json`
- [x] ESLint passes with `.eslintrc.production.json`
- [x] No hardcoded API URLs or secrets
- [x] Environment variables documented in `.env.schema`

### Testing
- [x] Test suite runs (64% passing - minimum viable)
- [ ] E2E tests pass (pending)
- [ ] Lighthouse score ≥90 (pending)
- [ ] Accessibility audit passes (pending)

### Configuration Files
- [x] `tsconfig.production.json` - TypeScript production config
- [x] `.eslintrc.production.json` - ESLint production config
- [x] `next.config.production.js` - Next.js optimized config
- [x] `.env.schema` - Environment documentation
- [x] CI/CD pipeline configured

---

## Deployment Commands

### 1. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel --prod=false

# Deploy to production (after verification)
vercel --prod
```

### 2. Docker Deployment
```bash
# Build Docker image
docker build -t pawfectmatch-web:latest -f Dockerfile .

# Run container
docker run -p 3000:3000 --env-file .env.production pawfectmatch-web:latest
```

### 3. Manual Deployment
```bash
# Build for production
NODE_ENV=production pnpm build

# Start production server
NODE_ENV=production pnpm start
```

---

## Environment Variables Required

### Essential (Must Have)
```env
NEXT_PUBLIC_API_URL=https://api.pawfectmatch.com
NEXTAUTH_URL=https://pawfectmatch.com
NEXTAUTH_SECRET=[generate-with-openssl]
```

### External Services
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
DATABASE_URL=mongodb://production-db-url
```

### Feature Flags
```env
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Post-Deployment Verification

### Smoke Tests
- [ ] Homepage loads
- [ ] Login/Register works
- [ ] Dashboard accessible
- [ ] API connections work
- [ ] Images load properly

### Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] SSL certificate valid

### Performance Checks
- [ ] Time to First Byte < 200ms
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

---

## Rollback Plan

### If Issues Occur:
1. **Vercel**: Use instant rollback in dashboard
2. **Docker**: Switch to previous image tag
3. **Manual**: Restore previous build from backup

### Rollback Commands:
```bash
# Vercel rollback
vercel rollback

# Docker rollback
docker run -p 3000:3000 pawfectmatch-web:previous-version

# Manual rollback
git checkout previous-tag
pnpm build && pnpm start
```

---

## Sign-off

- [ ] Development Team Approval
- [ ] QA Testing Complete
- [ ] Product Owner Approval
- [ ] DevOps Ready
- [ ] Backup Created

**Deployment Authorized By:** _______________
**Date:** _______________
**Version:** v1.0.0-staging

---

*Use this checklist for every deployment to ensure consistency and reliability.*