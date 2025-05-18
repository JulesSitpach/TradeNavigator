// server/routes/health.ts
import express from "express";
import { getPoolStatus, testConnection } from "../db";
import { logger } from "../utils/logger";
import { isRedisHealthy } from "../utils/redis";
import { config } from "../config";

const router = express.Router();

/**
 * Simple health check endpoint
 * GET /api/health
 */
router.get("/", async (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * Detailed health check endpoint
 * GET /api/health/detailed
 */
router.get("/detailed", async (req, res) => {
  try {
    // Check database connection
    const dbConnected = await testConnection();
    
    // Get database pool status
    const dbPoolStatus = getPoolStatus();
    
    // Check Redis health if enabled
    const useRedisCache = config.getServerConfig().USE_REDIS_CACHE;
    const redisHealthy = useRedisCache ? await isRedisHealthy() : null;
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    // Determine overall status
    const status = dbConnected && (!useRedisCache || redisHealthy) ? "healthy" : "unhealthy";
    
    // Return health information
    res.json({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "unknown",
      database: {
        connected: dbConnected,
        poolStatus: dbPoolStatus
      },
      cache: {
        type: useRedisCache ? "redis" : "memory",
        status: useRedisCache 
          ? (redisHealthy ? "healthy" : "unhealthy") 
          : "healthy",
        enabled: true
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + "MB",
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + "MB",
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + "MB",
        external: Math.round(memoryUsage.external / 1024 / 1024) + "MB"
      }
    });
  } catch (error) {
    logger.error("Health check failed", error);
    
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;