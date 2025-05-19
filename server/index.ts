// server/index.ts
import { createServer } from "http";
import { pool } from "./db";
import { setupVite, serveStatic } from "./vite";
import { logger } from "./utils/logger";
import { config } from "./config";
import { setupMetricsEndpoint, updateApplicationMetrics } from "./middleware/performance";
import { closeRedisConnection } from "./utils/redis";
import { closeSubscriber } from "./utils/redis/cacheEvents";
import { createExpressApp } from "./firebase";

// Create the Express app using our shared implementation
const app = createExpressApp();

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