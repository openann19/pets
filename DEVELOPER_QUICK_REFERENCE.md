# 🚀 Developer Quick Reference Card

## 🛠️ Common Fixes Applied

### Fix TypeScript Error
```typescript
// Before: Parameter 'acc' implicitly has an 'any' type
reduce((acc, item) => ...)

// After: Add explicit types
reduce((acc: number, item: any) => ...)
```

### Fix Missing Closing Tag
```jsx
// Before: Unclosed div
<div className="container">
  <Component />
</PremiumLayout>

// After: Add closing div
<div className="container">
  <Component />
</div>
</PremiumLayout>
```

### Fix Import Issues
```typescript
// Before: Missing import
const Icon = tierIcons[tierPlan.tier]; // Error: Cannot find name

// After: Add type assertion or proper import
const tierIcons: Record<string, any> = { ... }
```

### Fix API Response Type
```typescript
// Before: 'response' is of type 'unknown'
const response = await api.someMethod();
if (response.success) { }

// After: Add type assertion
const response: any = await api.someMethod();
if (response?.success) { }
```

### Fix React.memo Syntax
```typescript
// Before: Missing closing parenthesis
const Component = React.memo(({ props }) => {
  return <div>...</div>
}

// After: Close React.memo properly
const Component = React.memo(({ props }) => {
  return <div>...</div>
});
```

---

## 📁 Project Structure

```
/workspace/
├── apps/
│   ├── web/              # Next.js web application
│   │   ├── app/          # App router pages
│   │   ├── src/          # Components, hooks, services
│   │   └── public/       # Static assets
│   └── mobile/           # React Native app
│       ├── src/          # Screens, components, services
│       ├── ios/          # iOS specific code
│       └── android/      # Android specific code
├── packages/
│   ├── core/             # Shared business logic
│   │   └── src/          # Stores, types, utils
│   └── ui/               # Shared UI components
│       └── src/          # Premium components
├── server/               # Express.js backend
│   └── src/
│       ├── routes/       # API endpoints
│       ├── models/       # Database schemas
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth, validation
│       └── services/     # Business logic
└── scripts/              # Build and deployment scripts
```

---

## 🔧 Common Commands

### Development
```bash
# Start everything
pnpm dev

# Start specific service
pnpm dev --filter @pawfectmatch/web
pnpm dev --filter server

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint --fix

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage
```

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter @pawfectmatch/web

# Clean build
pnpm clean && pnpm build
```

### Database
```bash
# Start MongoDB locally
mongod --dbpath ./data/db

# Run migrations
cd server && npm run migrate

# Create indexes
node server/src/scripts/ensure-indexes.js

# Seed database
cd server && npm run seed
```

### Mobile Development
```bash
# iOS
cd apps/mobile
npx pod-install
npx react-native run-ios

# Android
npx react-native run-android

# Metro bundler
npx react-native start --reset-cache
```

---

## 🔍 Debugging Tips

### TypeScript Errors
1. Check `tsconfig.json` paths
2. Verify all imports have extensions
3. Run `pnpm type-check` to see all errors
4. Check for `any` types that need annotation

### Build Errors
1. Clear cache: `rm -rf .next node_modules/.cache`
2. Reinstall: `pnpm install --force`
3. Check environment variables
4. Verify all dependencies installed

### Runtime Errors
1. Check browser console
2. Check server logs: `tail -f server/logs/error.log`
3. Verify API endpoints returning data
4. Check WebSocket connections

### Database Issues
1. Verify MongoDB is running: `ps aux | grep mongod`
2. Check connection string in `.env`
3. Verify indexes: `db.pets.getIndexes()`
4. Check for schema validation errors

---

## 🌍 Environment Variables

### Essential Variables
```env
# Server
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/pawfectmatch
JWT_SECRET=your-secret-key

# Client
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_WS_URL=ws://localhost:5001

# Services
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
SMTP_HOST=smtp.gmail.com
```

### Check Missing Variables
```bash
# In server
node -e "require('./src/utils/validateEnv')"

# Check all .env files
grep -r "process.env" . | grep -o "process.env.[A-Z_]*" | sort -u
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module"
```bash
# Solution 1: Install missing dependency
pnpm add [package-name]

# Solution 2: Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: "Type error in production build"
```bash
# Solution: Add type assertion or fix type
// Add 'as any' temporarily
const value = someFunction() as any;

// Or fix properly with correct type
interface MyType { ... }
const value: MyType = someFunction();
```

### Issue: "WebSocket connection failed"
```javascript
// Check server is running
curl http://localhost:5001/health

// Verify CORS settings
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});
```

### Issue: "Database connection timeout"
```javascript
// Increase timeout in connection options
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});
```

---

## 📚 API Endpoints Reference

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Pets
```
GET    /api/pets/discover
GET    /api/pets/my-pets
POST   /api/pets
GET    /api/pets/:id
PUT    /api/pets/:id
DELETE /api/pets/:id
POST   /api/pets/:petId/swipe
```

### Matches
```
GET    /api/matches
GET    /api/matches/stats
GET    /api/matches/:matchId
POST   /api/matches/:matchId/messages
PATCH  /api/matches/:matchId/archive
```

### Premium
```
POST   /api/premium/subscribe
POST   /api/premium/cancel
GET    /api/premium/features
POST   /api/premium/boost/:petId
```

---

## 🔐 Security Checklist

- [x] Input validation on all endpoints
- [x] Rate limiting configured
- [x] CORS properly set
- [x] JWT with refresh tokens
- [x] Password hashing with bcrypt
- [x] SQL injection prevention (using ORM)
- [x] XSS protection (React escaping)
- [ ] HTTPS in production
- [ ] Security headers (Helmet.js)
- [ ] API key rotation
- [ ] 2FA implementation
- [ ] CAPTCHA on public forms

---

## 📈 Performance Checklist

- [x] Database indexes created
- [x] Code splitting implemented
- [x] Image lazy loading
- [x] API response caching
- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Gzip compression
- [ ] Service worker caching
- [ ] Database query optimization
- [ ] Load balancing setup

---

## 🚢 Deployment Checklist

Before deploying:
1. [ ] All tests passing
2. [ ] Environment variables set
3. [ ] Database migrations run
4. [ ] Build successful
5. [ ] Security audit complete
6. [ ] Monitoring configured
7. [ ] Backups scheduled
8. [ ] SSL certificates ready
9. [ ] DNS configured
10. [ ] Health checks passing

---

## 📞 Quick Support

### Common Log Locations
```bash
# Server logs
tail -f server/logs/error.log
tail -f server/logs/combined.log

# PM2 logs (if using)
pm2 logs

# Docker logs (if using)
docker-compose logs -f

# Nginx logs (if using)
tail -f /var/log/nginx/error.log
```

### Health Check
```bash
# Check all services
curl http://localhost:5001/health
curl http://localhost:3000/api/health

# Check database
mongo --eval "db.adminCommand('ping')"

# Check Redis (if running)
redis-cli ping
```

---

*Keep this reference handy during development and debugging!*