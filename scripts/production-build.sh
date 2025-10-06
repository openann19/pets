#!/bin/bash
# Production build script

echo "🏗️ Building for production..."

# Clean previous builds
pnpm clean

# Install dependencies
pnpm install --frozen-lockfile

# Run quality checks
pnpm quality-gate

# Build all packages
pnpm build

# Run tests
pnpm test:all

echo "✅ Production build complete!"
