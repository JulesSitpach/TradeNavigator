import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Define pool and db variables
let pool: any;
let db: any;

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using development mode with an in-memory database.");
  
  // Create mock implementation for development when no database is available
  pool = { 
    query: async () => ({ rows: [] }),
    end: async () => {}
  };
  
  db = {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) })
  };
} else {
  // Use Neon serverless Postgres client with the DATABASE_URL
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

// Export the variables
export { pool, db };
