// server/db/index.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for WebSockets
neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL is properly handled
const DATABASE_URL = process.env.DATABASE_URL;

// Connection pool options
const poolConfig = {
  connectionString: DATABASE_URL,
  max: 20, // Maximum connection pool size
  idleTimeoutMillis: 30000, // How long a connection can be idle before being terminated
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
};

// Create connection pool
export const pool = new Pool(poolConfig);

// Monitor the pool for events
pool.on('connect', (client) => {
  console.debug('New database connection established');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
});

// Create drizzle database instance
export const db = drizzle(pool, { schema });

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.info('Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed', error);
    return false;
  }
}

/**
 * Get current pool status
 */
export function getPoolStatus() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Close all database connections
 */
export async function closeConnections() {
  try {
    await pool.end();
    console.info('All database connections closed');
    return true;
  } catch (error) {
    console.error('Error closing database connections', error);
    return false;
  }
}
