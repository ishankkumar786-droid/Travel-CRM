/**
 * API endpoint constants.
 * Base URLs are read from environment variables, never hardcoded here.
 */

import { API_BASE_PATH } from './constants';

/** Build API URL from path segments */
export function buildApiUrl(base: string, ...segments: string[]): string {
  const parts = [base.replace(/\/$/, ''), ...segments.map((s) => s.replace(/^\//, ''))];
  return parts.join('/');
}

/** API route segments (relative paths) */
export const API_ROUTES = {
  HEALTH: `${API_BASE_PATH}/health`,
} as const;
