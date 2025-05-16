import { neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// For development only: Create a temporary mock database implementation
console.warn("Using a temporary development database setup");

// Mock database implementation for development
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
