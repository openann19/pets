# Development Authentication Bypass Guide

## Overview
This guide explains how authentication is bypassed in development mode to allow easy access to all pages and screens without requiring login.

## Configuration

### Web App (Next.js)
- **File**: `apps/web/src/config/dev.ts`
- **Condition**: `NODE_ENV === 'development'`
- **Middleware**: `apps/web/middleware.ts` - Skips auth checks in dev mode
- **Layouts**: Protected layouts bypass auth checks in dev mode

### Mobile App (React Native/Expo)
- **File**: `apps/mobile/src/config/dev.ts`
- **Condition**: `__DEV__ === true`
- **App Component**: `apps/mobile/App.tsx` - Shows main app directly in dev mode

## How It Works

### Web App Flow
1. **Middleware Check**: `isAuthDisabled()` returns `true` in development
2. **Route Protection**: Protected routes are accessible without tokens
3. **Layout Bypass**: Protected layouts render children directly
4. **No Redirects**: Users can access any route without authentication

### Mobile App Flow
1. **App Component**: `isAuthDisabled()` returns `true` in development
2. **Navigation**: Shows main app navigator directly
3. **Screen Access**: All screens are accessible without authentication
4. **No Auth Flow**: Skips login/register screens entirely

## Accessible Routes/Screens

### Web Routes (All Accessible in Dev Mode)
- `/dashboard` - Main dashboard
- `/swipe` - Pet swiping interface
- `/matches` - Matches list
- `/chat` - Chat interface
- `/profile` - User profile
- `/pets` - Pet management
- `/my-pets` - User's pets
- `/premium` - Premium features
- `/map` - Map view
- `/system-status` - System status
- `/ai` - AI features

### Mobile Screens (All Accessible in Dev Mode)
- `HomeScreen` - Main home screen
- `SwipeScreen` - Pet swiping
- `MatchesScreen` - Matches list
- `ChatScreen` - Chat interface
- `MapScreen` - Map view
- `LoginScreen` - Login (still accessible)
- `RegisterScreen` - Registration (still accessible)

## Testing

Run the authentication bypass test:
```bash
node test-auth-bypass.js
```

This will verify that:
- ✅ Middleware is configured correctly
- ✅ Protected layouts bypass auth
- ✅ Mobile app bypasses auth
- ✅ Configuration files are present
- ✅ All routes/screens are accessible

## Development vs Production

### Development Mode
- **Web**: `NODE_ENV=development` → Auth bypassed
- **Mobile**: `__DEV__=true` → Auth bypassed
- **Behavior**: All pages/screens accessible without login

### Production Mode
- **Web**: `NODE_ENV=production` → Auth required
- **Mobile**: `__DEV__=false` → Auth required
- **Behavior**: Protected routes require authentication

## Environment Variables

### Web App
```bash
NODE_ENV=development
NEXT_PUBLIC_DISABLE_AUTH=true  # Optional override
```

### Mobile App
```bash
EXPO_PUBLIC_DISABLE_AUTH=true  # Optional override
```

## Quick Start

1. **Start Web App**:
   ```bash
   cd apps/web
   pnpm dev
   ```
   - Visit any route directly (e.g., `http://localhost:3000/dashboard`)
   - No login required in development

2. **Start Mobile App**:
   ```bash
   cd apps/mobile
   npx expo start
   ```
   - All screens accessible without authentication
   - Navigate freely between screens

## Troubleshooting

### Web App Issues
- **Routes still redirecting**: Check `NODE_ENV` is set to `development`
- **Middleware not working**: Verify `isAuthDisabled()` import in middleware
- **Layout blocking**: Check protected layout imports dev config

### Mobile App Issues
- **Still showing login**: Verify `__DEV__` is `true` in development
- **Navigation not working**: Check `isAuthDisabled()` import in App.tsx
- **Screens not accessible**: Verify dev config is properly imported

## Security Note

⚠️ **Important**: This bypass only works in development mode. Production builds will still require proper authentication. Never deploy with authentication disabled.

## Files Modified

- `apps/web/middleware.ts` - Added auth bypass logic
- `apps/web/app/[locale]/(protected)/layout.tsx` - Bypass auth checks
- `apps/web/app/(protected)/layout.tsx` - Bypass auth checks
- `apps/web/src/config/dev.ts` - Development configuration
- `apps/mobile/App.tsx` - Bypass auth in navigation
- `apps/mobile/src/config/dev.ts` - Development configuration
