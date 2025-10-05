# Quick Debug Setup Guide

**Purpose:** Get you logged in quickly to find and fix bugs

---

## 🚀 Super Quick Start (2 Minutes)

### Option 1: Without Database (Client-Side Only)

The app has **built-in demo mode** for the browse page!

```bash
# 1. Start only the frontend
cd /Users/elvira/Downloads/pets-pr-1/apps/web
pnpm dev

# 2. Open browser
# Go to: http://localhost:3000/browse

# 3. Browse works without login!
# Click buttons to test UI
```

✅ **What works without backend:**
- `/browse` - Browse pets (demo data)
- `/` - Landing page
- All button visibility and interactions

### Option 2: With Full Backend (Complete Features)

```bash
# Terminal 1: Start MongoDB
mongosh  # Test if running, if not:
# brew services start mongodb-community  # Mac
# sudo systemctl start mongod  # Linux

# Terminal 2: Create test users
cd /Users/elvira/Downloads/pets-pr-1
node scripts/create-test-users.js

# Terminal 3: Start backend
cd server
npm start

# Terminal 4: Start frontend
cd apps/web
pnpm dev

# Browser: http://localhost:3000/login
# Login: demo@pawfectmatch.com / demo123
```

---

## 🔑 Test Credentials (Copy & Paste Ready)

### For Login Testing
```
Email: demo@pawfectmatch.com
Password: demo123
```

### For Premium Feature Testing
```
Email: premium@pawfectmatch.com
Password: premium123
```

---

## 🐛 Debug Checklist

### Visual Issues to Check

#### 1. Browse Page (`/browse`)
- [ ] Pass button (red) is visible and clear
- [ ] Like button (pink) is visible and clear
- [ ] Chat button (blue) is visible and clear
- [ ] Icons and text are aligned
- [ ] Hover effects work (glow shadows)
- [ ] Modal buttons are visible when you click Like

#### 2. Landing Page (`/`)
- [ ] "Create Your Profile" button has gradient
- [ ] "Start Browsing" button has white border
- [ ] Navigation links are readable
- [ ] "Get Started" button in header visible

#### 3. Login Page (`/login`)
- [ ] "Sign in" button is visible
- [ ] Form inputs have good contrast
- [ ] Error messages show properly
- [ ] Link to register is visible

#### 4. Register Page (`/register`)
- [ ] "Create account" button visible
- [ ] All form fields clear
- [ ] Link to login visible

#### 5. Swipe Page (`/swipe`) - Requires Login
- [ ] Pass button (circular, red X) visible
- [ ] Like button (circular, heart) visible
- [ ] Super Like (star - premium only) visible
- [ ] Labels below buttons readable
- [ ] Pet card displays properly

---

## 📍 URL Quick Links

```
Landing:     http://localhost:3000/
Browse:      http://localhost:3000/browse
Login:       http://localhost:3000/login
Register:    http://localhost:3000/register
Dashboard:   http://localhost:3000/dashboard
Swipe:       http://localhost:3000/swipe
Premium:     http://localhost:3000/premium
Map:         http://localhost:3000/map
```

---

## 🔧 Common Issues & Fixes

### Issue: "Can't connect to MongoDB"
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
brew services start mongodb-community  # Mac
sudo systemctl start mongod  # Linux
```

### Issue: "Users not found" / Login fails
```bash
# Re-create test users
cd /Users/elvira/Downloads/pets-pr-1
node scripts/create-test-users.js

# Verify users exist
mongosh
use pawfectmatch
db.users.find({ email: "demo@pawfectmatch.com" })
```

### Issue: Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
cd apps/web
PORT=3001 pnpm dev
```

### Issue: Port 5000 already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: Buttons still not visible
```bash
# Hard refresh browser
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# Or clear cache
# Chrome DevTools (F12) > Network tab > Disable cache
```

---

## 🎨 Visual Testing Workflow

### 1. Test Without Login (Quick)
```
1. Open: http://localhost:3000/browse
2. Check all 3 buttons (Pass, Like, Chat)
3. Click Like -> Modal appears
4. Check modal buttons are visible
5. Close modal, continue browsing
```

### 2. Test With Login (Full)
```
1. Open: http://localhost:3000/login
2. Login: demo@pawfectmatch.com / demo123
3. Should redirect to /dashboard
4. Navigate to /swipe
5. Check circular buttons
6. Try swiping or clicking buttons
7. Navigate to /premium
8. Check upgrade buttons
```

### 3. Test Premium Features
```
1. Login: premium@pawfectmatch.com / premium123
2. Go to /swipe
3. You should see "Super Like" star button
4. Check all premium UI elements
5. Go to /premium
6. Should show "Premium+" active plan
```

---

## 🖼️ Screenshot Locations for Bug Reports

If you find issues, take screenshots of:

1. **Button visibility issues**
   - Screenshot: Full page showing unclear buttons
   - Browser console (F12) open showing any errors

2. **Alignment issues**
   - Screenshot: Zoomed in on misaligned elements
   - Include browser zoom level (100%)

3. **Color/contrast issues**
   - Screenshot: Problem area
   - Note: Device display settings (dark mode, color profile)

4. **Hover state issues**
   - Screenshot or screen recording of hover behavior

---

## 🚦 Service Status Check

### Quick Health Check
```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:5000/api/health

# MongoDB
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Logs to Check
```bash
# Frontend logs
# Check browser console (F12)

# Backend logs  
cd server
tail -f logs/combined.log

# MongoDB logs
# Check MongoDB compass or:
tail -f /usr/local/var/log/mongodb/mongo.log  # Mac
```

---

## 📝 Report Issues Found

When you find issues, note:

1. **Page/URL** where issue occurs
2. **What you expected** to see
3. **What actually happened**
4. **Browser** (Chrome, Safari, Firefox)
5. **Viewport size** (desktop, mobile view)
6. **Steps to reproduce**

Example:
```
Page: /browse
Expected: Like button clearly visible with pink color
Actual: Button barely visible, very faint
Browser: Chrome 120, Desktop
Steps: Go to /browse, look at bottom buttons
```

---

## ⚡ Speed Tips

### Skip Backend (Test UI Only)
- Browse page works without backend
- Perfect for testing button visibility
- Fast iteration on UI fixes

### Use Browser DevTools
```
F12 -> Elements tab
- Inspect button elements
- Check computed styles
- Test hover states manually
- Modify CSS live
```

### Hot Reload Active
- Frontend auto-refreshes on file changes
- No need to restart after CSS fixes
- Just save file and check browser

---

## 🎯 Priority Testing Order

1. **First**: `/browse` (no login needed)
   - Test all button visibility
   - Test modal buttons
   
2. **Second**: `/login` page
   - Test login form buttons
   - Try logging in with test account
   
3. **Third**: `/swipe` (after login)
   - Test circular action buttons
   - Test swipe interactions
   
4. **Fourth**: All other pages
   - Dashboard, Premium, Map, etc.

---

**Ready to Debug!** 🚀

Start with: `cd apps/web && pnpm dev`  
Then open: http://localhost:3000/browse

