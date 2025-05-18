// server/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

/**
 * Middleware to validate user authentication
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For development, bypass authentication
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

/**
 * Middleware to check subscription tier access
 */
export function checkSubscriptionAccess(allowedTiers: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (allowedTiers.includes(user.subscriptionTier)) {
      return next();
    }

    return res.status(403).json({ message: "Subscription tier does not allow this feature" });
  };
}
