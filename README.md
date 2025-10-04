# 🐾 PawfectMatch Premium

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)](BUILD_REPORT.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)

> AI-powered pet matching platform with premium features, real-time chat, and video calls.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm 8.15.0
- Docker and Docker Compose (for production)
- MongoDB 7.0+ and Redis 7.2+ (if running locally)

### Development Setup

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Start development servers
pnpm dev
```

**Services will start at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000 (if configured)

### Production Deployment

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.prod.yml up --build -d

# Manual build
pnpm --filter pawfectmatch-web build
```

📖 **For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

## 📦 Project Structure

```
pets-pr-1/
├── apps/
│   ├── web/              # Next.js frontend application
│   └── mobile/           # React Native mobile app (in development)
├── packages/
│   ├── core/             # Shared core utilities and types
│   └── ui/               # Shared UI components
├── server/               # Express.js backend API
├── ai-service/           # Python FastAPI AI service
├── nginx/                # Nginx reverse proxy configuration
├── scripts/              # Deployment and utility scripts
├── _project_history/     # Archived documentation
└── _archived_scripts/    # Archived test/demo scripts
```

---

## ✨ Features

### Core Features
- 🔍 **Smart Matching** - AI-powered pet compatibility analysis
- 💬 **Real-time Chat** - Socket.io powered messaging
- 📹 **Video Calls** - WebRTC video calling for Premium users
- 🗺️ **Location-based** - Find nearby pet matches
- 📊 **Analytics** - User behavior and match insights

### Premium Tiers

| Feature | Free | Premium+ | Ultimate | Global Elite |
|---------|------|----------|----------|--------------|
| Daily Swipes | 50 | ∞ | ∞ | ∞ |
| Video Calls | ❌ | ✅ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ | ✅ |
| AI Priority | ❌ | ❌ | ✅ | ✅ |
| Concierge | ❌ | ❌ | ❌ | ✅ |
| **Price** | Free | $9/mo | $19.99/mo | $49/mo |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 (React 18)
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query
- **Animation**: Framer Motion
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js 18 + Express 5
- **Database**: MongoDB 7.0
- **Cache**: Redis 7.2
- **Auth**: JWT + bcrypt
- **Payments**: Stripe
- **Real-time**: Socket.io

### AI Service
- **Framework**: FastAPI (Python)
- **ML Libraries**: scikit-learn, pandas, numpy
- **API**: DeepSeek AI integration

### Infrastructure
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **Package Manager**: pnpm 8.15.0
- **Monorepo**: TurboRepo

---

## 🔐 Security

- ✅ **HSTS** - Strict Transport Security enabled
- ✅ **CSP** - Content Security Policy configured
- ✅ **Rate Limiting** - API and auth endpoint protection
- ✅ **Helmet.js** - Security headers on backend
- ✅ **JWT** - Token-based authentication
- ✅ **CORS** - Properly configured cross-origin policies

---

## 📊 Build Status

Last Build: **October 2, 2025**

| Metric | Status | Details |
|--------|--------|---------|
| Production Build | ✅ Pass | Next.js build successful |
| TypeScript | ✅ Pass | Zero compilation errors |
| Bundle Size | ✅ Pass | 543 kB First Load JS |
| Routes | ✅ Pass | 23 routes optimized |
| Security | ✅ Pass | All headers configured |
| Docker | ✅ Pass | Multi-stage builds ready |

**For detailed build information, see [BUILD_REPORT.md](BUILD_REPORT.md)**

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter pawfectmatch-web test

# Run E2E tests (Cypress)
cd apps/web && npx cypress open
```

---

## 📝 Available Scripts

### Root Level
```bash
pnpm dev              # Start all services in development
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm clean            # Clean all build artifacts
```

### Web App (apps/web)
```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code
```

### Backend (server)
```bash
npm start             # Start production server
npm run dev           # Start with nodemon
npm test              # Run Jest tests
```

---

## 🌍 Environment Variables

### Required Variables

**Backend (server/.env.production):**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `REDIS_URL` - Redis connection URL

**Frontend (apps/web/.env.production):**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket endpoint
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete list**

---

## 🚢 Deployment

### Quick Deploy with Docker

```bash
# 1. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 2. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose -f docker-compose.prod.yml ps

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Health Checks

```bash
# Backend API
curl https://api.pawfectmatch.com/api/health

# Frontend
curl https://pawfectmatch.com

# AI Service
curl https://ai.pawfectmatch.com/health
```

---

## 📚 Documentation

- [BUILD_REPORT.md](BUILD_REPORT.md) - Complete build verification and status
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Comprehensive deployment instructions
- [API.md](_project_history/API.md) - API documentation (archived)
- [ARCHITECTURE.md](_project_history/ARCHITECTURE.md) - System architecture (archived)

---

## 🤝 Contributing

This is a production-ready application. For development:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Run linter: `pnpm lint`
6. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🆘 Support

- **Documentation**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Issues**: File a GitHub issue
- **Email**: support@pawfectmatch.com

---

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Express](https://expressjs.com/) - Backend framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Redis](https://redis.io/) - Cache
- [Stripe](https://stripe.com/) - Payment processing
- [Socket.io](https://socket.io/) - Real-time communication

---

## 📈 Roadmap

- ✅ Core matching features
- ✅ Premium tier system
- ✅ Real-time chat
- ✅ Video calling
- ✅ AI-powered recommendations
- 🔄 Mobile app (React Native)
- 📋 Admin dashboard
- 📋 Advanced analytics
- 📋 Social media integration

---

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** October 2, 2025

# 333
