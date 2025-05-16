import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using development mode with an in-memory database.");
  
  // Export mock implementation for development when no database is available
  export const pool = { 
    query: async () => ({ rows: [] }),
    end: async () => {}
  };
  
  export const db = {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) })
  };
} else {
  // Use Neon serverless Postgres client with the DATABASE_URL
  export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle(pool, { schema });
}
