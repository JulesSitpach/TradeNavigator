// server/middleware/pagination.ts
import type { Request, Response, NextFunction } from "express";

/**
 * Default pagination settings
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Middleware to parse pagination parameters
 */
export function parsePagination(req: Request, res: Response, next: NextFunction) {
  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;
  
  // Parse page parameter
  if (req.query.page) {
    const parsedPage = parseInt(req.query.page as string);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }
  
  // Parse limit parameter
  if (req.query.limit) {
    const parsedLimit = parseInt(req.query.limit as string);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      // Enforce maximum limit
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }
  }
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  // Attach pagination options to the request object
  req.pagination = {
    page,
    limit,
    offset
  };
  
  next();
}

/**
 * Create pagination result object
 */
export function createPaginationResult(
  data: any[],
  totalItems: number,
  options: PaginationOptions
) {
  const totalPages = Math.ceil(totalItems / options.limit);
  
  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      totalItems,
      totalPages,
      hasNextPage: options.page < totalPages,
      hasPrevPage: options.page > 1
    }
  };
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      pagination: PaginationOptions;
    }
  }
}
