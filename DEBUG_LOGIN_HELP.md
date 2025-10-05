# 🔍 Login Debug Guide

**Issue:** Login redirects back to sign in page with fast errors

---

## 🚨 Common Causes

### 1. Backend Not Running
The backend server must be running for authentication to work.

**Check if running:**
```bash
# Check if port 5000 is in use
lsof -i :5000

# Or check port 3001
lsof -i :3001
```

**Start backend:**
```bash
cd server
npm start
```

### 2. Test Users Don't Exist
Test users must be created in MongoDB.

**Create test users:**
```bash
cd /Users/elvira/Downloads/pets-pr-1
node scripts/create-test-users.js
```

### 3. MongoDB Not Running
MongoDB must be running for the backend to work.

**Check MongoDB:**
```bash
mongosh

# If it connects, MongoDB is running
# If not, start it:
brew services start mongodb-community  # Mac
sudo systemctl start mongod  # Linux
```

### 4. Environment Variables Missing
The frontend needs to know where the backend is.

**Check `.env.local`:**
```bash
cd apps/web
cat .env.local

# Should have:
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔧 Quick Fix Steps

### Step 1: Check What's Running
```bash
# Check frontend (should be on 3000)
lsof -i :3000

# Check backend (should be on 5000 or 3001)
lsof -i :5000
lsof -i :3001

# Check MongoDB (should be on 27017)
lsof -i :27017
```

### Step 2: Start Everything
```bash
# Terminal 1: MongoDB (if not running)
brew services start mongodb-community

# Terminal 2: Backend
cd /Users/elvira/Downloads/pets-pr-1/server
npm start

# Terminal 3: Frontend  
cd /Users/elvira/Downloads/pets-pr-1
./START_DEBUG.sh

# Terminal 4: Create test users
cd /Users/elvira/Downloads/pets-pr-1
node scripts/create-test-users.js
```

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for error messages (they'll show now with 🔐 and ❌ icons)

### Step 4: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Look for the `/api/auth/login` request
5. Check the response

---

## 📊 Error Messages Explained

### "Network Error" or "Failed to fetch"
- Backend is not running
- Wrong API URL in environment variables
- CORS issue

**Fix:** Start backend server

### "Invalid credentials" or "User not found"
- Test users don't exist in database
- Wrong email/password

**Fix:** Run `node scripts/create-test-users.js`

### "Cannot connect to database"
- MongoDB is not running
- Wrong MongoDB connection string

**Fix:** Start MongoDB

### Error disappears too fast
- **FIXED!** I've improved error display
- Errors now stay visible with bold text
- Check console for detailed logs (look for 🔐 and ❌)

---

## 🎯 Test Login Flow

**With Backend Running:**
```
1. Open: http://localhost:3000/login
2. Enter: demo@pawfectmatch.com / demo123
3. Click "Sign in"
4. Should redirect to: http://localhost:3000/dashboard
```

**Without Backend (Demo Mode):**
```
1. Open: http://localhost:3000/browse
2. Browse works without login!
3. Click Like → Shows login modal
4. Can't actually login without backend
```

---

## 🔍 Debug Checklist

- [ ] MongoDB is running (port 27017)
- [ ] Backend is running (port 5000 or 3001)
- [ ] Frontend is running (port 3000)
- [ ] Test users created in database
- [ ] `.env.local` has correct API URL
- [ ] Browser console shows login attempt (🔐)
- [ ] Network tab shows `/api/auth/login` request

---

## 📝 Check Logs

### Backend Logs
```bash
cd server
tail -f logs/combined.log
# Or check console output where npm start is running
```

### Frontend Logs
- Open browser console (F12)
- Look for:
  - 🔐 Attempting login with: [email]
  - 📊 Login result: [true/false]
  - ❌ Login error: [error details]

---

## 🚀 Full Reset (If Nothing Works)

```bash
# 1. Stop everything
# Press Ctrl+C in all terminals

# 2. Kill any stuck processes
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# 3. Restart MongoDB
brew services restart mongodb-community

# 4. Clear MongoDB (optional - removes all data!)
# mongosh
# use pawfectmatch
# db.dropDatabase()

# 5. Recreate test users
cd /Users/elvira/Downloads/pets-pr-1
node scripts/create-test-users.js

# 6. Start backend
cd server
npm start

# 7. Start frontend (new terminal)
cd /Users/elvira/Downloads/pets-pr-1
./START_DEBUG.sh

# 8. Try logging in
# http://localhost:3000/login
# demo@pawfectmatch.com / demo123
```

---

## ✅ Expected Behavior

### Successful Login:
1. Enter credentials
2. Click "Sign in"  
3. Button shows loading spinner
4. Success sound plays (if audio enabled)
5. Redirects to /dashboard after 500ms
6. Welcome message on dashboard

### Failed Login:
1. Enter credentials
2. Click "Sign in"
3. **RED ERROR BOX appears** (now more visible!)
4. Error message stays visible
5. Can try again
6. Check console for detailed error (🔐 ❌)

---

**Current Improvements:**
- ✅ Error messages now **bold and persistent**
- ✅ Better visual feedback (red border, bigger icon)
- ✅ Console logging with emojis (🔐 📊 ❌)
- ✅ Detailed error information displayed

**Try logging in again and check the console!**
