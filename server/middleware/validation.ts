// server/middleware/validation.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

/**
 * Middleware factory to validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Transform Zod errors to a more user-friendly format
        const errors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        throw new ValidationError('Validation error', errors);
      }
      
      // Attach the validated data to the request
      req.validatedBody = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Middleware factory to validate request params against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        // Transform Zod errors to a more user-friendly format
        const errors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        throw new ValidationError('Validation error', errors);
      }
      
      // Attach the validated data to the request
      req.validatedParams = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Middleware factory to validate request query against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        // Transform Zod errors to a more user-friendly format
        const errors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        throw new ValidationError('Validation error', errors);
      }
      
      // Attach the validated data to the request
      req.validatedQuery = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedParams?: any;
      validatedQuery?: any;
    }
  }
}
