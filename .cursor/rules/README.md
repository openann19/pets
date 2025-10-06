# Cursor Rules for PawfectMatch

This directory contains Cursor Rules that help prevent common issues and enforce best practices.

## Rules Overview

### 1. `project-architecture.mdc` (Always Applied)
- Core project structure
- Port configurations (Backend: 5001, Frontend: 3000)
- MongoDB IPv4 requirement
- Service startup order
- Common pitfalls and solutions

### 2. `react-nextjs-patterns.mdc` (TypeScript/TSX files)
- Next.js 15 breaking changes (readonly params)
- React hooks best practices
- Map/Leaflet patterns
- Error handling patterns
- Performance optimization

### 3. `ui-button-standards.mdc` (Component files)
- Button visibility requirements
- Styling standards (gradients, shadows, borders)
- Accessibility guidelines
- Error message patterns
- Testing checklist

### 4. `backend-api-patterns.mdc` (Backend/API files)
- Environment variable requirements
- MongoDB connection patterns
- Port handling
- CORS configuration
- API client patterns
- Process management

### 5. `debugging-guide.mdc` (Manual reference)
- Quick diagnostic commands
- Common error patterns and solutions
- Service health checks
- Complete reset procedures

## How to Use

These rules are automatically loaded by Cursor AI to:
1. Provide context about the codebase
2. Suggest fixes for common issues
3. Enforce best practices
4. Prevent recurring problems

## Key Takeaways

**Always remember**:
- Backend runs on port **5001** (not 5000)
- MongoDB uses **IPv4** (`127.0.0.1`, not `localhost`)
- Next.js 15 params need **null-safe** access: `(params?.id as string) || ''`
- Kill old processes before starting new ones
- Add **stable keys** to prevent Map re-initialization
- Make buttons **bold** and **visible** with gradients
