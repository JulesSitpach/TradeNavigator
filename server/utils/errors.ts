// server/utils/errors.ts
/**
 * Base custom error class
 */
export class AppError extends Error {
  public status: number;
  
  constructor(message: string, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * NotFound error - 404
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Unauthorized error - 401
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Forbidden error - 403
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

/**
 * Bad request error - 400
 */
export class BadRequestError extends AppError {
  constructor(message = 'Invalid request') {
    super(message, 400);
  }
}

/**
 * Conflict error - 409
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * External API error - 502
 */
export class ExternalAPIError extends AppError {
  constructor(message = 'External service error') {
    super(message, 502);
  }
}

/**
 * Validation error - 400
 */
export class ValidationError extends BadRequestError {
  public errors: any[];
  
  constructor(message = 'Validation error', errors: any[] = []) {
    super(message);
    this.errors = errors;
  }
}
