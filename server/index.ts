// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import pgSimple from "connect-pg-simple";
import compression from "compression";
import { pool } from "./db";
import { setupVite, serveStatic } from "./vite";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { getStandardRateLimiter, getAuthRateLimiter } from "./middleware/redisRateLimit";
import { logger } from "./utils/logger";
import { config } from "./config";
import { performanceMonitoring, setupMetricsEndpoint, updateApplicationMetrics } from "./middleware/performance";
import { RedisSessionStore } from "./utils/redis/sessionStore";
import { getRedisClient, closeRedisConnection } from "./utils/redis";
import { setupCacheInvalidationEvents, closeSubscriber } from "./utils/redis/cacheEvents";

// Import routes
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import healthRoutes from "./routes/health";
// Import other routes as needed

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
const PgSession = pgSimple(session);
app.use(
  session({
    store: useRedisCache 
      ? new RedisSessionStore()
      : new PgSession({
          pool,
          tableName: "sessions",
        }),
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

// Apply rate limiting to auth endpoints
app.use("/api/auth", getAuthRateLimiter());

// Apply standard rate limiting to all other API routes
app.use("/api", getStandardRateLimiter());

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/health", healthRoutes);
// Mount other routes as needed

// Setup metrics endpoint for Prometheus
setupMetricsEndpoint(app);

// Global error handler
app.use(errorHandler);

// Start the server
(async () => {
  try {
    const server = createServer(app);
    
    // Setup Vite in development, or serve static files in production
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Listen on port 5000
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      logger.info(`Server started on http://0.0.0.0:${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Start periodic application metrics collection
      if (config.getServerConfig().ENABLE_METRICS) {
        // Update metrics every 15 seconds
        setInterval(() => {
          // Track connection count (replace with actual connection counting if available)
          const activeConnectionCount = server.getConnections ? 
            server.getConnections((err, count) => count) : 0;
          
          updateApplicationMetrics(activeConnectionCount);
        }, 15000);
        
        logger.info('Performance monitoring enabled');
        
        // If metrics port is different from the main port, start a separate server
        const metricsPort = config.getServerConfig().METRICS_PORT;
        if (metricsPort && metricsPort !== port) {
          const metricsApp = express();
          metricsApp.get('/metrics', async (req: Request, res: Response) => {
            res.set('Content-Type', 'text/plain');
            res.end(await import('./monitoring/metrics').then(m => m.metrics.getMetrics()));
          });
          
          metricsApp.listen(metricsPort, () => {
            logger.info(`Metrics server started on http://0.0.0.0:${metricsPort}/metrics`);
          });
        }
      }
    });
    
    // Handle graceful shutdown
const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server...');
    
    server.close(() => {
    logger.info('Server closed');
    
    // Close Redis connection and subscriber first
    Promise.all([
      closeRedisConnection(),
        closeSubscriber()
      ]).then(() => {
        // Then close database connections
        pool.end(() => {
        logger.info('All connections closed');
        process.exit(0);
        });
    }).catch(err => {
      logger.error('Error during graceful shutdown:', err);
      process.exit(1);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
};
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
})();