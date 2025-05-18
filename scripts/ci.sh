#!/bin/bash
# TradeNavigator CI Script for Replit

echo "Running TradeNavigator CI checks..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run linting
echo "Running linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi
echo "✅ Linting passed"

# Run type checking
echo "Running TypeScript type checking..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed"
  exit 1
fi
echo "✅ Type checking passed"

# Run tests
echo "Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi
echo "✅ Tests passed"

# Build the application
echo "Building application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build passed"

# Run security audit
echo "Running security audit..."
npm audit --production
if [ $? -ne 0 ]; then
  echo "⚠️ Security audit found issues"
else
  echo "✅ Security audit passed"
fi

echo "All CI checks completed successfully! 🎉"
