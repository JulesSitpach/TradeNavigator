#!/bin/bash
# TradeNavigator pre-commit hook

echo "Running pre-commit checks..."

# Check for lint errors
echo "Running linting..."
npm run lint:changed
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Please fix the errors before committing."
  exit 1
fi

# Run TypeScript type checking
echo "Running type checking..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed. Please fix the type errors before committing."
  exit 1
fi

# Format code
echo "Formatting code..."
npm run format:changed
if [ $? -ne 0 ]; then
  echo "❌ Code formatting failed."
  exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0
