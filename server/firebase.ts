// server/firebase.ts
import { https } from 'firebase-functions';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import compression from "compression";
import { pool } from "./db";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { getStandardRateLimiter } from "./middleware/redisRateLimit";
import { logger } from "./utils/logger";
import { config } from "./config";
import { performanceMonitoring } from "./middleware/performance";
import { RedisSessionStore } from "./utils/redis/sessionStore";
import { getRedisClient } from "./utils/redis";
import { setupCacheInvalidationEvents } from "./utils/redis/cacheEvents";

// Import routes
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import healthRoutes from "./routes/health";
// Import other routes as needed

export const createExpressApp = () => {
  const app = express();

  // Add compression middleware
  app.use(compression());

  // Request logging
  app.use(requestLogger);

  // Performance monitoring
  app.use(performanceMonitoring());

  // Parse JSON and URL-encoded bodies
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  // Get Redis configuration
  const useRedisCache = config.getServerConfig().USE_REDIS_CACHE;

  // Setup cache invalidation events if Redis is enabled
  if (useRedisCache) {
    setupCacheInvalidationEvents();
  }

  // Setup session middleware
  app.use(
    session({
      store: useRedisCache 
        ? new RedisSessionStore()
        : undefined,
      secret: config.getServerConfig().COOKIE_SECRET || "trade-navigator-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      name: 'tn_sid',
    })
  );

  // Apply standard rate limiting to all API routes
  app.use("/api", getStandardRateLimiter());

  // Mount API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/health", healthRoutes);
  // Mount other routes as needed

  // Global error handler
  app.use(errorHandler);

  return app;
};

// Function to create Firebase-compatible API handler
export const createFirebaseApi = () => {
  const app = createExpressApp();
  return https.onRequest(app);
};
