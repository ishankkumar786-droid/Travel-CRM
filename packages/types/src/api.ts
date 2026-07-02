/**
 * Standard API response types used across all services.
 */

/** Standard successful API response */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  requestId?: string;
  timestamp: string;
}

/** Union of success and error responses */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiErrorResponse;

/** Common HTTP error codes */
export type HttpErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'VALIDATION_ERROR';

/** Health check response */
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected' | 'connecting';
    [key: string]: string;
  };
}
