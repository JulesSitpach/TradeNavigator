#!/bin/bash

# Script to set up authentication for TradeNavigator in Replit
echo "Setting up TradeNavigator Authentication in Replit..."

# Generate a secure SESSION_SECRET if not already set
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET=$(openssl rand -hex 32)
  echo "Generated new SESSION_SECRET"
fi

# Configure Replit domains
REPLIT_DOMAIN=$(echo $REPL_SLUG.$REPL_OWNER.repl.co)
export REPLIT_DOMAINS="$REPLIT_DOMAIN"
echo "REPLIT_DOMAINS set to: $REPLIT_DOMAINS"

# Set default database URL if not already set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tradenavigator"
  echo "Using default DATABASE_URL"
fi

# Create database session table if not exists
echo "Setting up database session table..."
cat > create_session_table.sql << EOL
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_sessions_expire ON sessions (expire);
EOL

# Execute the SQL
psql $DATABASE_URL -f create_session_table.sql
rm create_session_table.sql

# Create .env file with required variables
cat > .env << EOL
# Environment Variables for TradeNavigator
REPLIT_DOMAINS=$REPLIT_DOMAINS
SESSION_SECRET=$SESSION_SECRET
DATABASE_URL=$DATABASE_URL
REPL_ID=$REPL_ID
ISSUER_URL=https://replit.com/oidc
NODE_ENV=development
EOL

echo "Environment variables written to .env file"

# Create a simple test login page for development
mkdir -p public
cat > public/login-test.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TradeNavigator Login Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    .login-button {
      background-color: #0055ff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .login-button:hover {
      background-color: #0044cc;
    }
    .status {
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
    }
    .status-authenticated {
      background-color: #d4edda;
      color: #155724;
    }
    .status-unauthenticated {
      background-color: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <h1>TradeNavigator Authentication Test</h1>
  <p>Use this page to test if authentication is working correctly</p>
  
  <div id="login-status" class="status">Checking authentication status...</div>
  
  <div style="margin-top: 20px;">
    <button id="login-button" class="login-button">Login with Replit</button>
    <button id="logout-button" class="login-button" style="background-color: #6c757d; display: none;">Logout</button>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const loginStatus = document.getElementById('login-status');
      const loginButton = document.getElementById('login-button');
      const logoutButton = document.getElementById('logout-button');
      
      // Check auth status
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const user = await response.json();
          loginStatus.textContent = 'Authenticated as: ' + user.email;
          loginStatus.className = 'status status-authenticated';
          loginButton.style.display = 'none';
          logoutButton.style.display = 'inline-block';
        } else {
          loginStatus.textContent = 'Not authenticated';
          loginStatus.className = 'status status-unauthenticated';
          loginButton.style.display = 'inline-block';
          logoutButton.style.display = 'none';
        }
      } catch (error) {
        loginStatus.textContent = 'Error checking authentication: ' + error.message;
        loginStatus.className = 'status status-unauthenticated';
      }
      
      // Login button
      loginButton.addEventListener('click', () => {
        window.location.href = '/api/login';
      });
      
      // Logout button
      logoutButton.addEventListener('click', () => {
        window.location.href = '/api/logout';
      });
    });
  </script>
</body>
</html>
EOL

echo "Created login test page at /login-test.html"

# Create a script to run each time before starting the server
cat > start-with-auth.sh << EOL
#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Execute the original command
exec \$@
EOL

chmod +x start-with-auth.sh

# Update package.json scripts to use start-with-auth
sed -i 's/"dev": "NODE_ENV=development tsx server\/index.ts"/"dev": ".\/start-with-auth.sh NODE_ENV=development tsx server\/index.ts"/' package.json
sed -i 's/"start": "NODE_ENV=production node dist\/index.js"/"start": ".\/start-with-auth.sh NODE_ENV=production node dist\/index.js"/' package.json

echo "Updated package.json scripts to load environment variables"

echo "Setup complete! Run the following commands to start the application:"
echo "  npm run db:push      # Set up the database schema"
echo "  npm run dev          # Start the development server"
echo ""
echo "Then navigate to your Replit URL with /login-test.html to test authentication"
