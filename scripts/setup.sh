#!/bin/bash
# TradeNavigator Replit Setup Script

echo "Setting up TradeNavigator on Replit..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create database tables if they don't exist
echo "Setting up database..."
npm run db:migrate

# Set up environment variables
if [ ! -f .env ]; then
  echo "Creating .env file from template..."
  cp .env.example .env
fi

# Run linting
echo "Running linting..."
npm run lint

# Run type checking
echo "Running TypeScript type checking..."
npm run typecheck

# Run tests
echo "Running tests..."
npm test

echo "Setup complete! Run 'npm run dev' to start the development server."
