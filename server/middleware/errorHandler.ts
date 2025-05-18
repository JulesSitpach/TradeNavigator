// server/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../utils/errors";

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  // Log error for debugging (but not in test environment)
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  
  // Handle our custom AppError types
  if (err instanceof AppError) {
    const response: Record<string, any> = {
      message: err.message
    };
    
    // Add validation errors if present
    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }
    
    return res.status(err.status).json(response);
  }
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors
    });
  }
  
  // Handle database unique constraint violations
  if (err.code === 'P2002') {
    return res.status(409).json({
      message: "Resource already exists"
    });
  }
  
  // Include error stack in development mode only
  const response: Record<string, any> = {
    message: err.message || "Internal server error"
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  // Default internal server error
  res.status(err.status || 500).json(response);
}
