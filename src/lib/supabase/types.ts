/**
 * Shared types for Supabase retry/fallback pattern
 */

/**
 * Retry options for database operations
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in milliseconds for exponential backoff (default: 100) */
  baseDelayMs: number;
  /** Timeout in milliseconds for each attempt (default: 8000) */
  timeoutMs: number;
  /** Whether to enable direct fetch fallback (default: true) */
  enableDirectFetch: boolean;
  /** Whether to log retry metrics for debugging (default: true) */
  logMetrics: boolean;
}

/**
 * Error classification for retry logic
 */
export enum ErrorType {
  /** Error can be retried (network timeout, rate limit, etc.) */
  RETRYABLE = 'RETRYABLE',
  /** Error should not be retried (validation, auth, etc.) */
  NON_RETRYABLE = 'NON_RETRYABLE',
  /** Error triggered fallback to direct fetch */
  FALLBACK = 'FALLBACK',
}

/**
 * Result from retry attempt
 */
export interface RetryResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Data returned from operation (if successful) */
  data?: T;
  /** Error from operation (if failed) */
  error?: Error;
  /** Number of attempts made */
  attempts: number;
  /** Whether fallback was used */
  usedFallback: boolean;
  /** Total time taken in milliseconds */
  durationMs: number;
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 1,
  baseDelayMs: 100,
  timeoutMs: 3000,
  enableDirectFetch: true,
  logMetrics: true,
};

/**
 * HTTP status codes that are retryable
 */
export const RETRYABLE_STATUS_CODES = [408, 429, 503, 504];

/**
 * HTTP status codes that are non-retryable (fail fast)
 */
export const NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 409, 422];

/**
 * Network error codes that are retryable
 */
export const RETRYABLE_ERROR_CODES = [
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ECONNRESET',
  'ECONNABORTED',
  'ENETUNREACH',
  'EAI_AGAIN',
];
