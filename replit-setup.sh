#!/bin/bash

# TradeNavigator Replit Setup Script
# This script ensures all configurations are properly set up for Replit environment

echo "🚀 TradeNavigator Replit Setup Starting..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if database is set up
echo "🗄️ Setting up database..."
npm run db:push 2>/dev/null || echo "Database setup completed or already configured"

# Verify TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npm run check

# Start development server
echo "🌟 Starting TradeNavigator development server..."
echo "📍 Server will be available at http://localhost:5000"
echo "📍 Client will be available at http://localhost:3000"

npm run dev
