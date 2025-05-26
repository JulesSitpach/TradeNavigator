#!/bin/bash

# This script creates a development environment with authentication bypassed for testing
echo "Creating TradeNavigator development environment with auth bypass..."

# Set development environment variables
export NODE_ENV="development"
export DEV_BYPASS_AUTH="true"

# Make sure we have a DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  # Check if we're in Replit and have a postgres database
  if [ -n "$REPL_ID" ] && [ -d "/home/runner/$REPL_SLUG/data/postgres" ]; then
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tradenavigator"
    echo "Using Replit PostgreSQL database: $DATABASE_URL"
  else
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tradenavigator"
    echo "Using default DATABASE_URL: $DATABASE_URL"
  fi
fi

# Create an .env file for development
cat > .env << EOL
# Development Environment for TradeNavigator
NODE_ENV=development
DEV_BYPASS_AUTH=true
DATABASE_URL=$DATABASE_URL
SESSION_SECRET=dev_session_secret_123
REPLIT_DOMAINS=localhost:5000
EOL

echo "Environment variables written to .env file"

# Create sessions table if it doesn't exist
echo "Setting up database session table..."
cat > create_session_table.sql << EOL
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_sessions_expire ON sessions (expire);
EOL

# Try to execute the SQL if we have psql
if command -v psql &> /dev/null; then
  psql $DATABASE_URL -f create_session_table.sql || echo "Could not create sessions table - will fall back to memory session storage"
else
  echo "psql not found - sessions table will be created automatically if using PostgreSQL"
fi
rm create_session_table.sql

# Run database migrations if db:push command exists
echo "Running database migrations..."
npm run db:push || echo "Failed to run database migrations"

echo "Starting development server with auth bypass..."
echo "======================================================"
echo "⚠️  WARNING: Authentication is bypassed for development"
echo "======================================================"
echo "All API requests will be treated as authenticated"
echo "This mode is for development purposes only"
echo ""

# Start the development server
npm run dev
