import { HTTP_STATUS } from '@travel/config';

/**
 * Base application error.
 * All custom errors extend this class.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown> | undefined;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — malformed request */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', message, details);
  }
}

/** 401 — unauthenticated */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(HTTP_STATUS.UNAUTHORIZED, 'AUTHENTICATION_ERROR', message);
  }
}

/** 403 — authenticated but not authorized */
export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(HTTP_STATUS.FORBIDDEN, 'AUTHORIZATION_ERROR', message);
  }
}

/** 404 — resource not found */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', `${resource} not found`);
  }
}

/** 409 — state conflict (duplicate, etc.) */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(HTTP_STATUS.CONFLICT, 'CONFLICT_ERROR', message, details);
  }
}

/** 422 — unprocessable entity */
export class UnprocessableError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'UNPROCESSABLE_ERROR', message, details);
  }
}

/** 429 — too many requests */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(429, 'RATE_LIMIT_ERROR', message);
  }
}

/** 500 — internal server error (non-operational) */
export class InternalServerError extends AppError {
  constructor(message = 'An internal server error occurred') {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', message, undefined, false);
  }
}

/** 503 — service unavailable */
export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      'SERVICE_UNAVAILABLE',
      `${service} is currently unavailable`,
    );
  }
}
