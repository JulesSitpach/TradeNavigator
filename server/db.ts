import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL is properly handled
const DATABASE_URL = process.env.DATABASE_URL;

// Create connection pool
const pool = new Pool({ 
  connectionString: DATABASE_URL 
});

// Create drizzle database instance
const db = drizzle(pool, { schema });

// Export the variables
export { pool, db };
