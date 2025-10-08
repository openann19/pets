#!/bin/bash

echo "🚀 Starting Production Build Process..."

# Set production environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run production linting
echo "🔍 Running ESLint with production config..."
pnpm eslint . --config .eslintrc.production.json --ext .ts,.tsx --max-warnings 30

# Run TypeScript check
echo "✅ Checking TypeScript with production config..."
pnpm tsc -p tsconfig.production.json --noEmit

# Build the application
echo "🏗️ Building application..."
pnpm next build --config next.config.production.js

# Analyze bundle size
echo "📊 Analyzing bundle size..."
if [ -d ".next" ]; then
  echo "JavaScript bundles:"
  find .next/static/chunks -name "*.js" -exec du -h {} \; | sort -hr | head -10
  
  echo -e "\nCSS bundles:"
  find .next/static/css -name "*.css" -exec du -h {} \; | sort -hr | head -5
  
  # Calculate total sizes
  JS_SIZE=$(find .next/static/chunks -name "*.js" -exec stat -f%z {} \; | awk '{s+=$1} END {print s}')
  CSS_SIZE=$(find .next/static/css -name "*.css" -exec stat -f%z {} \; 2>/dev/null | awk '{s+=$1} END {print s}')
  
  echo -e "\nTotal JS size: $((JS_SIZE / 1024))KB"
  echo "Total CSS size: $((CSS_SIZE / 1024))KB"
fi

echo "✅ Production build complete!"