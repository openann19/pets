---
applyTo: '**'
---
## 🎯 Project Overview
PawfectMatch Premium is an AI-powered pet matching platform featuring a studio-quality user experience. Built on a TypeScript monorepo, it includes advanced animations, real-time chat, intelligent matching algorithms, and a comprehensive moderation system.

### Core Features
🤖 AI-Powered Matching: Multi-factor compatibility scoring with machine learning.
💬 Real-Time Chat: Socket.io integration with typing indicators, read receipts, and media sharing.
🎨 Premium UX: Spring physics animations, shared layout transitions, and staggered visual effects.
📱 Cross-Platform: A Next.js web app and a React Native (Expo) mobile app.
🔐 Security First: JWT authentication, rate limiting, CSRF protection, and content moderation.
💳 Stripe Integration: Premium subscriptions with tiered features.
👮 Admin Console: User management, content moderation, and an analytics dashboard.
## 🚀 Quick Start
### Prerequisites
Node.js: v22.0.0 or later
pnpm: v9.0.0 or later
Python: v3.8 or later
MongoDB: v4.4 or later
Expo & EAS CLI (for mobile development)
### Installation & Setup
Clone the repository:
Bash
git clone https://github.com/your-org/pawfectmatch-premium.git
cd pawfectmatch-premium
Install dependencies:
Bash
# Install all workspace dependencies
pnpm install

# Install Python dependencies for the AI service
cd ai-service
python3 -m pip install -r requirements.txt
cd ..
Configure environment variables:
Copy the .env.example files in each service directory (server, apps/web, apps/mobile, ai-service) to a new .env file (e.g., server/.env).
Fill in the required values, such as database URIs, API keys, and JWT secrets.
Start services:
Bash
# Start all services concurrently (recommended)
pnpm dev
Or, run each service in a separate terminal:
Backend API: cd server && npm run dev
AI Service: cd ai-service && python3 deepseek_app.py
Web App: pnpm --filter pawfectmatch-web dev
Mobile App: pnpm --filter @pawfectmatch/mobile start
## 🏗️ Architecture
The project is a monorepo managed by Turborepo and pnpm workspaces. This structure allows for shared code, streamlined builds, and consistent development across all applications.

### Monorepo Structure
pawfectmatch-premium/
├── apps/
│   ├── web/           # Next.js web app
│   └── mobile/        # React Native mobile app
├── packages/
│   ├── core/          # Shared business logic, types, and schemas
│   ├── ui/            # Shared, headless UI components
│   └── ...            # Other shared packages (testing, analytics, etc.)
├── server/            # Node.js/Express backend API
└── ai-service/        # Python/FastAPI AI service
### Data Flow
Clients (web and mobile) communicate with the Node.js backend via a REST API for standard requests and a Socket.io connection for real-time events. The backend, in turn, queries the AI service for matching logic and other intelligent features. All persistent data is stored in a MongoDB database.

## 💻 Development Workflow
### Key Commands
Build all packages: pnpm build
Type-check all packages: pnpm type-check
Lint all packages: pnpm lint (fix with pnpm lint:fix)
Run all tests: pnpm test
Use the --filter flag to target a specific workspace, for example:

Bash
pnpm --filter pawfectmatch-web test
## 🐛 Known Issues & Solutions
This section documents the most critical issues blocking a fully clean build. Addressing these is the team's top priority.

### 1. Mobile App TypeScript Errors (301 errors)
Status: 🔴 CRITICAL
Problem: The mobile app fails to compile due to a high volume of TypeScript errors, primarily related to React Navigation types and component return values.
Immediate Workaround: Run the mobile development server with pnpm --filter @pawfectmatch/mobile start --skipLibCheck to bypass type checks.
Solution:
Add index signatures to all navigation ParamList types:
TypeScript
export type AuthStackParamList = {
  Login: undefined;
  [key: string]: undefined | object; // Add this to allow for flexibility
};
Ensure all screen components explicitly return JSX.Element:
TypeScript
const LoginScreen = (): JSX.Element => {
  return <View>...</View>;
};
### 2. Web App TypeScript Errors (387 errors)
Status: 🟡 IN PROGRESS
Problem: The web app has numerous TypeScript errors related to exactOptionalPropertyTypes, unsafe error handling, and nullish values.
Solution:
Use type guards for error handling:
TypeScript
catch (error) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  toast.error(message);
}
Safely access potentially undefined arrays:
TypeScript
const sum = weights?.reduce(...) ?? 0;
### 3. ESLint Configuration Issues
Status: 🟡 NEEDS ATTENTION
Problem: ESLint is not configured to recognize Jest globals in test files, leading to hundreds of false-positive errors.
Solution: Update eslint.config.js in the web and mobile apps to include a globals definition for test files:
JavaScript
{
  files: ['**/*.test.{ts,tsx}', '**/setupTests.js'],
  languageOptions: {
    globals: {
      jest: 'readonly',
      describe: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      // ... and other Jest globals
    },
  },
}
## 🧪 Testing
The project uses a multi-layered testing strategy to ensure quality and stability.
Unit Tests (Jest): For individual functions and components.
Integration Tests (Jest): For testing interactions between multiple components.
End-to-End Tests (Playwright for web, Detox for mobile): For simulating real user flows.
### Running Tests
Run all tests: pnpm test
Run tests in watch mode: pnpm test:watch
Generate a coverage report: pnpm test:coverage
### Quality Gates
A pre-commit hook runs a quality gate to ensure that all code meets our standards. You can run this manually:

Bash
pnpm quality:gate
## 🚀 Deployment
### Pre-Deployment Checklist
[ ] All critical tests are passing (pnpm test:critical).
[ ] There are no TypeScript errors in the production build.
[ ] All necessary environment variables are configured in the deployment environment.
[ ] A database backup has been created.
### Deployment Platforms
Web App: Vercel
Backend API: Render
Mobile App: EAS (Expo Application Services)
For detailed instructions, refer to the DEPLOYMENT_GUIDE.md file in the repository.

## 🔧 Troubleshooting
### "Cannot find module '@pawfectmatch/core'"
Cause: The shared core package has not been built.
Solution: Run pnpm --filter @pawfectmatch/core build.
### "Port 3000 is already in use"
Cause: Another process is running on the development port.
Solution:
Bash
npx kill-port 3000
### "Invalid hook call"
Cause: Mismatched or duplicate versions of React in the monorepo.
Solution:
Bash
pnpm dedupe
rm -rf node_modules
pnpm install
## 🎨 Code Quality Standards
### Key Principles
Strict TypeScript: No implicit any types or type suppressions (@ts-ignore).
Spring Physics for Animations: All animations should use type: 'spring' in Framer Motion for a natural and responsive feel.
Conventional Commits: Commit messages must follow the conventional commit format (e.g., feat: ..., fix: ..., docs: ...).
For a complete list of standards, see the CONTRIBUTING.md file.