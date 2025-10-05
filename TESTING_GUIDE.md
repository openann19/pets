# 🧪 PawfectMatch Testing Guide

## Overview

This document provides instructions for running the comprehensive test suite that guarantees the "wiring" between frontend and backend is perfect. These tests focus on **functionality, data flow, and state changes** — NOT visual styling.

---

## 📋 Test Suite Structure

### Phase 1: API Contract (✅ COMPLETE)
**File**: [`API_CONTRACT.md`](./API_CONTRACT.md)

Comprehensive documentation of all 60+ API endpoints including:
- Request/response structures
- Data types and validation rules
- Error scenarios (400, 401, 403, 404, 429, 500, 503)
- Authentication requirements
- Rate limiting rules

### Phase 2: Backend Integration Tests (✅ COMPLETE)
**Location**: `server/tests/`

#### Test Files:
1. **Unit Tests**:
   - `user.model.test.js` - User model validation
   - `pet.model.test.js` - Pet model validation
   - `match.model.test.js` - Match model validation

2. **Route Tests**:
   - `auth.routes.test.js` - Authentication endpoints
   - `user.routes.test.js` - User management endpoints
   - `pet.routes.test.js` - Pet CRUD endpoints
   - `match.routes.test.js` - Match and messaging endpoints
   - `premium.routes.test.js` - Premium subscription endpoints

3. **E2E Tests**:
   - `e2e/auth.e2e.test.js` - Full authentication flows
   - `e2e/pet-swipe.e2e.test.js` - Pet creation and swiping workflows

4. **Integration Tests**:
   - `integration/api-contract.test.js` - **Complete API contract verification** (all endpoints, happy + unhappy paths)

#### Running Backend Tests:

```bash
# Navigate to server directory
cd server

# Run all tests
npm test

# Run specific test suite
npm test -- auth.routes.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

#### Expected Results:
- ✅ **101 tests passing**
- ✅ **11 test suites passing**
- ⏭️ **1 test skipped** (coordinate validation - needs backend enhancement)

### Phase 3: Frontend E2E Tests (✅ COMPLETE)
**Location**: `apps/web/cypress/e2e/`

#### Test Files:
1. **`01-auth-flow.cy.ts`** - Authentication workflows
   - User registration (happy + error paths)
   - User login (success + failures)
   - User logout
   - Protected route access
   - Duplicate email handling
   - Password validation
   - Token management

2. **`02-pet-management.cy.ts`** - Pet CRUD operations
   - Pet creation with validation
   - Pet listing and filtering
   - Pet details viewing
   - Pet profile editing
   - Pet deletion with confirmation
   - Species validation

3. **`03-swipe-and-match.cy.ts`** - Matching system
   - Pet discovery feed
   - Like/Pass swipe actions
   - Match creation (mutual likes)
   - Match list display
   - Match statistics
   - Species filtering

4. **`04-chat-messaging.cy.ts`** - Messaging system
   - Message sending
   - Message history loading
   - Chronological message ordering
   - Read status tracking
   - Online user status
   - Match actions (archive, favorite, block)

#### Running Cypress Tests:

```bash
# Navigate to web app directory
cd apps/web

# Install dependencies (first time only)
pnpm install

# Open Cypress Test Runner (interactive)
pnpm cypress

# Or with full command
pnpm cypress open

# Run headless (CI mode)
pnpm cypress:headless

# Run E2E tests with server auto-start
pnpm e2e
```

#### Prerequisites for E2E Tests:
1. **MongoDB** must be running:
   ```bash
   mongod --config /opt/homebrew/etc/mongod.conf --fork
   ```

2. **Backend server** must be running on port 5001:
   ```bash
   cd server
   npm start
   ```

3. **Frontend dev server** must be running on port 3000:
   ```bash
   cd apps/web
   pnpm dev
   ```

---

## 🎯 Test Philosophy

### What We Test:
✅ **API request/response data structures**
✅ **HTTP status codes (200, 201, 400, 401, 404, 500)**
✅ **Data persistence (database state changes)**
✅ **Authentication token flows**
✅ **Error handling and validation**
✅ **Business logic (match creation, swipe recording)**
✅ **UI state changes** (loading → success, loading → error)

### What We DON'T Test:
❌ **CSS styling** (colors, fonts, spacing)
❌ **Visual design** (layout, animations)
❌ **Pixel-perfect positioning**
❌ **Responsive breakpoints** (unless they affect functionality)

---

## 🔍 Test Verification Checklist

### Backend Tests Must Verify:
- [ ] Correct HTTP status codes
- [ ] Exact JSON response structure
- [ ] Required vs optional fields
- [ ] Data type validation
- [ ] Authentication/authorization checks
- [ ] Database state changes
- [ ] Error message content

### Frontend E2E Tests Must Verify:
- [ ] API request sent with correct data
- [ ] API response matches contract
- [ ] Data rendered somewhere on page (not WHERE)
- [ ] Loading state shown during request
- [ ] Error state shown on failure
- [ ] Success state shown on completion
- [ ] Navigation to correct route

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Start MongoDB
        uses: supercharge/mongodb-github-action@1.10.0
      - run: cd server && npm install
      - run: cd server && npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Start MongoDB
        uses: supercharge/mongodb-github-action@1.10.0
      - run: cd server && npm install && npm start &
      - run: cd apps/web && pnpm install
      - run: cd apps/web && pnpm e2e
```

---

## 🐛 Debugging Failed Tests

### Backend Test Failures:

1. **Check environment variables**:
   ```bash
   cat server/.env
   # Ensure JWT_SECRET, MONGODB_URI, etc. are set
   ```

2. **Check MongoDB connection**:
   ```bash
   mongosh --eval "db.runCommand({ ping: 1 })"
   ```

3. **Run tests with verbose output**:
   ```bash
   cd server
   npm test -- --verbose
   ```

4. **Check for port conflicts**:
   ```bash
   lsof -i :5001
   pkill -9 -f "node.*server"
   ```

### Cypress Test Failures:

1. **Check server is running**:
   ```bash
   curl http://localhost:5001/health
   curl http://localhost:3000
   ```

2. **View Cypress screenshots**:
   - Located in `apps/web/cypress/screenshots/`

3. **Watch Cypress videos** (if enabled):
   - Located in `apps/web/cypress/videos/`

4. **Run specific test**:
   ```bash
   cd apps/web
   pnpm cypress run --spec "cypress/e2e/01-auth-flow.cy.ts"
   ```

5. **Open Cypress in browser** (for debugging):
   ```bash
   pnpm cypress open
   ```

---

## 📊 Test Coverage Goals

### Backend:
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All critical user workflows covered

### Frontend:
- **E2E Tests**: All critical user journeys covered
- Focus on data flow, not component unit tests

---

## 🔐 Test Data Management

### Backend Tests:
- Use **MongoDB Memory Server** (isolated, fast)
- Each test creates its own users/pets/matches
- Cleanup in `afterEach` hooks

### Cypress Tests:
- Use custom commands for setup (`cy.register()`, `cy.login()`)
- Generate unique emails with timestamps
- Clean state between tests

---

## ✅ Success Criteria

The testing suite is considered successful when:

1. ✅ **100% of backend integration tests pass**
2. ✅ **All critical E2E workflows pass**
3. ✅ **API contract documentation is accurate**
4. ✅ **Tests can run in CI/CD without human intervention**
5. ✅ **Tests are fast** (< 5 minutes total)
6. ✅ **Tests are reliable** (no flaky tests)

---

## 🎉 The Guarantee

With this testing suite:

### You CAN:
✅ **Refactor UI components** without fear
✅ **Change styling** completely
✅ **Redesign the entire frontend**
✅ **Update dependencies** confidently
✅ **Onboard new developers** quickly

### Because Tests Verify:
✅ **All API endpoints work correctly**
✅ **Data flows from backend → frontend**
✅ **User workflows complete successfully**
✅ **Authentication/authorization is secure**
✅ **Errors are handled gracefully**

---

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Library](https://testing-library.com/)

---

## 🤝 Contributing

When adding new features:

1. **Update API_CONTRACT.md** with new endpoints
2. **Add backend integration tests** for new endpoints
3. **Add E2E tests** if feature has UI workflow
4. **Ensure all tests pass** before committing
5. **Update this guide** if test patterns change

---

**Last Updated**: October 2, 2025  
**Test Suite Version**: 1.0.0  
**Status**: ✅ All Phases Complete

