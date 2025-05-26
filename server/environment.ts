import { Request, Response } from "express";

// Route handler to check environment variables and database connection
export async function checkEnvironment(req: Request, res: Response) {
  try {
    // Get important environment variables (masking sensitive ones)
    const envStatus = {
      REPLIT_DOMAINS: process.env.REPLIT_DOMAINS || null,
      SESSION_SECRET: process.env.SESSION_SECRET ? true : null,
      DATABASE_URL: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/\/\/(.+?):.+?@/, '//****:****@') : null,
      REPL_ID: process.env.REPL_ID || null,
      NODE_ENV: process.env.NODE_ENV || null,
      databaseConnected: false,
      sessionsTableExists: false
    };
    
    // Check database connection
    if (process.env.DATABASE_URL) {
      try {
        const { db } = await import('./db');
        // Execute a simple query to test the connection
        await db.execute('SELECT 1');
        envStatus.databaseConnected = true;
        
        // Check if sessions table exists
        try {
          await db.execute('SELECT 1 FROM sessions LIMIT 1');
          envStatus.sessionsTableExists = true;
        } catch (e) {
          // Table doesn't exist, which is fine
        }
      } catch (dbError) {
        console.error('Database connection error:', dbError);
      }
    }
    
    res.json(envStatus);
  } catch (error) {
    console.error('Error in environment check:', error);
    res.status(500).json({ 
      error: 'Failed to check environment',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
