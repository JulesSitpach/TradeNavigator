import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import fs from 'fs';
import path from 'path';

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check for required environment variables and set defaults for development
if (!process.env.REPLIT_DOMAINS) {
  // For development, try to detect Replit domain from environment
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    process.env.REPLIT_DOMAINS = `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    console.log(`Detected REPLIT_DOMAINS: ${process.env.REPLIT_DOMAINS}`);
  } else {
    // Fallback for local development
    process.env.REPLIT_DOMAINS = 'localhost:5000';
    console.log(`Using fallback REPLIT_DOMAINS: ${process.env.REPLIT_DOMAINS}`);
  }
}

if (!process.env.SESSION_SECRET) {
  // In development, use a static secret
  if (process.env.NODE_ENV === 'development') {
    process.env.SESSION_SECRET = 'devSessionSecret123';
    console.log('Using development SESSION_SECRET');
  } else {
    throw new Error('Environment variable SESSION_SECRET not provided');
  }
}

// Environment variables are now loaded by start-with-auth.sh
// Just verify we have the required ones
const requiredEnvVars = ['REPLIT_DOMAINS', 'DATABASE_URL', 'REPL_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('Missing environment variables:', missingVars);
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Check if we have a DATABASE_URL for PostgreSQL session storage
  if (process.env.DATABASE_URL) {
    console.log('Using PostgreSQL session storage');
    const pgStore = connectPg(session);
    try {
      const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true, // Auto-create the sessions table if needed
        ttl: sessionTtl,
        tableName: "sessions",
      });
      return session({
        secret: process.env.SESSION_SECRET!,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: sessionTtl,
        },
      });
    } catch (error) {
      console.error('Error setting up PostgreSQL session store:', error);
      console.warn('Falling back to memory session store');
      // Fall back to memory store
    }
  }
  
  // Fallback to memory store for development or if PostgreSQL fails
  console.log('Using memory session storage');
  const MemoryStore = session.MemoryStore;
  const sessionStore = new MemoryStore();
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

// Utility function to create a mock user for development
function createMockUser() {
  return {
    claims: {
      sub: 'mock-user-1234',
      email: 'dev@example.com',
      first_name: 'Development',
      last_name: 'User',
      profile_image_url: 'https://avatars.githubusercontent.com/u/0',
      exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
    },
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Setup session middleware
  try {
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());
    console.log('Authentication middleware initialized successfully');
  } catch (error) {
    console.error('Failed to initialize authentication middleware:', error);
    throw error;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // In development mode, allow bypassing authentication if there's a DEV_BYPASS_AUTH env var
  if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true') {
    console.log('⚠️ Warning: Bypassing authentication in development mode!');
    return next();
  }

  if (!req.isAuthenticated() || !user?.expires_at) {
    console.log('Unauthorized access attempt:', req.path);
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    console.log('User authenticated successfully:', user.claims?.sub);
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    console.log('Attempting to refresh token for user:', user.claims?.sub);
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    console.log('Token refreshed successfully');
    return next();
  } catch (error) {
    console.error('Token refresh failed:', error);
    return res.redirect("/api/login");
  }
};
