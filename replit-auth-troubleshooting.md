# TradeNavigator Replit Authentication Troubleshooting Guide

## The Problem: 401 Unauthorized Errors

You're experiencing authentication failures in your Replit deployment of TradeNavigator. The logs show numerous 401 Unauthorized responses when the client tries to fetch the authenticated user:

```
GET /api/auth/user 401 in 1ms :: {"message":"Unauthorized"}
```

## Root Cause Analysis

The TradeNavigator application uses Replit's OpenID Connect (OIDC) authentication system, which requires specific environment variables and configuration to work properly. These environment variables are not being set in your Replit environment, causing authentication to fail.

Required environment variables include:
- `REPLIT_DOMAINS` - The domain for your Replit app
- `SESSION_SECRET` - A secret for encrypting session data
- `DATABASE_URL` - PostgreSQL connection string for session storage
- `REPL_ID` - Your Replit app's ID

## Solution

I've created a setup script called `setup-replit-auth.sh` that will configure all the necessary environment variables and update your project to work with Replit's authentication system.

### Step 1: Run the Setup Script

```bash
bash setup-replit-auth.sh
```

This script will:
1. Generate a secure SESSION_SECRET
2. Configure REPLIT_DOMAINS using your Replit environment
3. Set up the DATABASE_URL if not already defined
4. Create the required PostgreSQL sessions table
5. Create a .env file with the necessary environment variables
6. Create a test login page to verify authentication
7. Update your package.json scripts to load the environment variables

### Step 2: Initialize the Database

```bash
npm run db:push
```

This will create the necessary database tables for the application.

### Step 3: Start the Development Server

```bash
npm run dev
```

### Step 4: Test Authentication

Navigate to your Replit URL with `/login-test.html` appended (e.g., `https://yourapp.username.repl.co/login-test.html`). This page will:
- Show your current authentication status
- Provide a login button that redirects to Replit's authentication
- Provide a logout button when authenticated

## Troubleshooting

If you're still experiencing issues after following these steps, check:

1. **PostgreSQL Connection**: Ensure the PostgreSQL database is running and accessible.
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Environment Variables**: Verify that all environment variables are correctly set.
   ```bash
   printenv | grep REPLIT
   printenv | grep SESSION_SECRET
   printenv | grep DATABASE_URL
   ```

3. **Server Logs**: Check for any authentication-related errors in the server logs.

4. **Sessions Table**: Make sure the sessions table was created correctly.
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM sessions LIMIT 1"
   ```

## Replit-Specific Considerations

- **Persistence**: Replit environments may reset, causing environment variables to be lost. The .env file we created will help with this.
- **Domains**: If you're using a custom domain with Replit, update the REPLIT_DOMAINS variable in the .env file.
- **Database**: Replit provides a PostgreSQL database, but ensure it's enabled in your Replit configuration.

## Next Steps

Once authentication is working, you can:
1. Remove the test login page if desired
2. Implement proper error handling in the client for authentication failures
3. Add redirection to the login page when unauthenticated

This solution maintains your existing architecture while fixing the authentication issues in the Replit environment.
