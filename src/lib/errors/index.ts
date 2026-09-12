/**
 * Standard Application & Database Error Hierarchy for DSA OS
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = "INTERNAL_ERROR", statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, code, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict or constraint violation", code = "CONFLICT") {
    super(message, code, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized: Authentication required", code = "UNAUTHORIZED") {
    super(message, code, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: Insufficient permissions", code = "FORBIDDEN") {
    super(message, code, 403);
  }
}

export class ValidationError extends AppError {
  public readonly details?: unknown;

  constructor(message = "Validation failed", details?: unknown, code = "VALIDATION_ERROR") {
    super(message, code, 400);
    this.details = details;
  }
}

export class DatabaseError extends AppError {
  public readonly originalError?: unknown;

  constructor(message = "Database operation failed", originalError?: unknown, code = "DATABASE_ERROR") {
    super(message, code, 500);
    this.originalError = originalError;
  }
}

/**
 * Translates PostgreSQL and Drizzle errors into domain-specific AppErrors.
 */
export function handleDatabaseError(error: unknown, context = "Database operation"): never {
  if (error instanceof AppError) {
    throw error;
  }

  const err = error as Record<string, unknown> | null;
  const pgCode = err?.code as string | undefined;
  const message = (err?.message as string) || "Unknown database error";

  // PostgreSQL Error Codes
  // 23505 = unique_violation
  if (pgCode === "23505") {
    throw new ConflictError(`${context}: Unique constraint violation (${message})`);
  }

  // 23503 = foreign_key_violation
  if (pgCode === "23503") {
    throw new NotFoundError(`${context}: Referenced entity not found or invalid foreign key (${message})`);
  }

  // 23514 = check_violation
  if (pgCode === "23514") {
    throw new ValidationError(`${context}: Check constraint violation (${message})`);
  }

  // 23502 = not_null_violation
  if (pgCode === "23502") {
    throw new ValidationError(`${context}: Required field missing (${message})`);
  }

  throw new DatabaseError(`${context}: ${message}`, error);
}
