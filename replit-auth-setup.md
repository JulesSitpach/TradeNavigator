# TradeNavigator Replit Setup Guide

This document will help you configure and run the TradeNavigator application in a Replit environment.

## Quick Fix for Authentication

You're experiencing 401 Unauthorized errors when trying to access authenticated endpoints. This is because the Replit authentication system requires specific environment variables to be configured.

### Fix Steps

1. Run the setup script to configure authentication:

```bash
bash setup-replit-auth.sh
```

2. Initialize the database schema:

```bash
npm run db:push
```

3. Restart the development server:

```bash
npm run dev
```

4. Test the authentication by visiting:
   - `/login-test.html` - A special test page to verify auth is working
   - `/api/login` - The login endpoint that will redirect to Replit's auth

## Authentication Flow

TradeNavigator uses Replit's built-in OIDC (OpenID Connect) authentication system:

1. User clicks "Login" and is redirected to `/api/login`
2. User authenticates with their Replit account
3. Replit redirects back to your application at `/api/callback`
4. The application creates a session and stores user information
5. Subsequent requests include this session, allowing access to authenticated endpoints

## Environment Variables

The authentication system requires these environment variables:

- `REPLIT_DOMAINS`: The domain(s) for your Replit application
- `SESSION_SECRET`: A secret key for encrypting session data
- `DATABASE_URL`: PostgreSQL connection string for session storage
- `REPL_ID`: Your Replit app's unique identifier

The setup script will create a `.env` file with these variables configured.

## Troubleshooting

If you're still experiencing issues:

1. **Check Environment Variables**: Visit `/api/environment-check` to verify all required variables are set.

2. **Database Connection**: Ensure PostgreSQL is running and accessible.

3. **Session Table**: The `sessions` table must exist in your database.

4. **Browser Issues**: Try clearing cookies and cache.

5. **Console Errors**: Check your browser's console for JavaScript errors.

## Advanced Configuration

For custom domains or additional authentication options, edit the `.env` file directly.

## For Production

When deploying to production:

1. Set `NODE_ENV=production` in your environment
2. Use a stronger SESSION_SECRET
3. Configure proper CORS headers
4. Set up a production-ready PostgreSQL database

## Resources

- [Replit Authentication Documentation](https://docs.replit.com/hosting/authenticating-users-replit-auth)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [PostgreSQL on Replit](https://docs.replit.com/hosting/databases/postgresql)
