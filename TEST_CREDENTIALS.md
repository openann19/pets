# Test User Credentials

**Last Updated:** October 2, 2025

---

## Quick Access Test Accounts

### 🆓 Free User (Basic Testing)
```
Email:    demo@pawfectmatch.com
Password: demo123
Plan:     Free
Features: Basic swipe, limited likes (50/day)
```

### 🧪 Test User (General Testing)
```
Email:    test@pawfectmatch.com
Password: test123
Plan:     Free
Features: Basic swipe, limited likes (50/day)
```

### 💎 Premium User (Premium Features)
```
Email:    premium@pawfectmatch.com
Password: premium123
Plan:     Premium+
Features: Unlimited swipes, video calls, analytics, Super Like
```

### 👑 Admin User (Full Access)
```
Email:    admin@pawfectmatch.com
Password: admin123
Plan:     Global Elite
Features: All premium features, concierge support, custom AI
```

---

## How to Create Test Users

### Method 1: Using the Script (Recommended)

```bash
# From project root
cd /Users/elvira/Downloads/pets-pr-1

# Set MongoDB connection (if not using default)
export MONGODB_URI="mongodb://localhost:27017/pawfectmatch"

# Run the script
node scripts/create-test-users.js
```

### Method 2: Using MongoDB Directly

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/pawfectmatch

# Create a test user
db.users.insertOne({
  email: "demo@pawfectmatch.com",
  password: "$2a$10$encrypted_password_hash",
  firstName: "Demo",
  lastName: "User",
  dateOfBirth: new Date("1990-01-01"),
  premium: {
    isActive: false,
    plan: "free"
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Method 3: Via Register Page

1. Go to http://localhost:3000/register
2. Fill in the form with your test credentials
3. Submit to create account

---

## Testing Workflows

### Login Flow Test
```
1. Go to http://localhost:3000/login
2. Enter: demo@pawfectmatch.com / demo123
3. Click "Sign in"
4. Should redirect to /dashboard
```

### Browse Flow Test
```
1. Go to http://localhost:3000/browse
2. Browse pets (works without login)
3. Click "Like" - should prompt for login
4. Login and verify like is saved
```

### Premium Feature Test
```
1. Login as: premium@pawfectmatch.com / premium123
2. Go to /swipe
3. Should see "Super Like" button (star icon)
4. Swipe up or click star to Super Like
5. Go to /premium - should show current plan
```

### Video Call Test
```
1. Login as premium user
2. Go to /matches (create a match first)
3. Click video call icon
4. Should open video call interface
```

---

## Password Hashing Reference

For bcrypt hashes (rounds=10):
```javascript
const bcrypt = require('bcryptjs');
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash('demo123', salt);
console.log(hash);
```

---

## Troubleshooting

### "Invalid credentials" error
- Check MongoDB is running: `mongosh`
- Verify users exist: `db.users.find({ email: "demo@pawfectmatch.com" })`
- Re-run setup script: `node scripts/create-test-users.js`

### "User already exists" during registration
- Use one of the test accounts above
- Or use a different email address

### Premium features not showing
- Login as premium@pawfectmatch.com or admin@pawfectmatch.com
- Check user.premium.isActive is true in database
- Verify JWT token includes premium status

### Session expires immediately
- Check JWT_SECRET in .env matches between restarts
- Verify JWT_EXPIRE is not set too short
- Clear cookies and login again

---

## Security Notes

⚠️ **IMPORTANT:**
- These are **TEST CREDENTIALS ONLY**
- Never use these passwords in production
- Change all passwords before going live
- Use environment-specific secrets

---

## Database Cleanup

To remove all test users:
```bash
mongosh mongodb://localhost:27017/pawfectmatch

db.users.deleteMany({
  email: { $in: [
    "demo@pawfectmatch.com",
    "test@pawfectmatch.com", 
    "premium@pawfectmatch.com",
    "admin@pawfectmatch.com"
  ]}
})
```

---

## Quick Start for Developers

```bash
# 1. Start MongoDB
brew services start mongodb-community

# 2. Start Redis (optional)
brew services start redis

# 3. Create test users
node scripts/create-test-users.js

# 4. Start backend
cd server && npm start

# 5. Start frontend (new terminal)
cd apps/web && pnpm dev

# 6. Login at http://localhost:3000/login
# Use: demo@pawfectmatch.com / demo123
```

---

**Need Help?**
- Check logs: `docker-compose logs -f` (if using Docker)
- Backend logs: `server/logs/`
- Frontend: Browser console (F12)

