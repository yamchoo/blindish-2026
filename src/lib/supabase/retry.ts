/**
 * Retry wrapper for Supabase operations with exponential backoff and timeout
 */

import {
  RetryOptions,
  DEFAULT_RETRY_OPTIONS,
  ErrorType,
  RETRYABLE_STATUS_CODES,
  NON_RETRYABLE_STATUS_CODES,
  RETRYABLE_ERROR_CODES,
} from './types';

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Classify error to determine if it should be retried
 */
function classifyError(error: any): ErrorType {
  // Check for HTTP status codes
  if (error.status || error.code) {
    const statusCode = error.status || parseInt(error.code, 10);

    if (NON_RETRYABLE_STATUS_CODES.includes(statusCode)) {
      return ErrorType.NON_RETRYABLE;
    }

    if (RETRYABLE_STATUS_CODES.includes(statusCode)) {
      return ErrorType.RETRYABLE;
    }
  }

  // Check for network error codes
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    return ErrorType.RETRYABLE;
  }

  // Check for timeout errors
  if (
    error.message &&
    (error.message.includes('timeout') ||
      error.message.includes('timed out') ||
      error.message.includes('ETIMEDOUT'))
  ) {
    return ErrorType.RETRYABLE;
  }

  // Check for network/connection errors
  if (
    error.message &&
    (error.message.includes('network') ||
      error.message.includes('connection') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET'))
  ) {
    return ErrorType.RETRYABLE;
  }

  // Check for Supabase-specific errors
  if (error.message && error.message.includes('FetchError')) {
    return ErrorType.RETRYABLE;
  }

  // Default to non-retryable for safety
  return ErrorType.NON_RETRYABLE;
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wrap an async operation with retry logic and timeout
 *
 * @example
 * ```typescript
 * const { data, error } = await withRetry(() =>
 *   supabase.from('profiles').update({ age: 25 }).eq('id', userId)
 * );
 * ```
 *
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns The result from the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = Date.now();

  let lastError: any;
  let attempt = 0;

  if (opts.logMetrics) {
    console.log('[retry] Starting operation with options:', {
      maxRetries: opts.maxRetries,
      timeoutMs: opts.timeoutMs,
      enableDirectFetch: opts.enableDirectFetch,
    });
  }

  for (attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      if (opts.logMetrics && attempt > 1) {
        console.log(`[retry] Attempt ${attempt}/${opts.maxRetries + 1}`);
      }

      // Wrap operation with timeout
      const result = await Promise.race([
        operation(),
        createTimeoutPromise(opts.timeoutMs),
      ]);

      // Success!
      if (opts.logMetrics) {
        const duration = Date.now() - startTime;
        console.log(`[retry] Success after ${attempt} attempt(s) in ${duration}ms`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      if (opts.logMetrics) {
        console.log(`[retry] Attempt ${attempt} failed:`, {
          message: error.message,
          code: error.code,
          status: error.status,
        });
      }

      // Classify the error
      const errorType = classifyError(error);

      if (errorType === ErrorType.NON_RETRYABLE) {
        if (opts.logMetrics) {
          console.log('[retry] Error is non-retryable, failing fast');
        }
        throw error;
      }

      // If we've exhausted retries, throw the error
      if (attempt > opts.maxRetries) {
        if (opts.logMetrics) {
          const duration = Date.now() - startTime;
          console.log(
            `[retry] All ${opts.maxRetries} retries exhausted after ${duration}ms`
          );
        }
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = opts.baseDelayMs * Math.pow(2, attempt - 1);

      if (opts.logMetrics) {
        console.log(`[retry] Waiting ${delay}ms before retry...`);
      }

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Specialized retry wrapper for operations that have a direct fetch fallback
 *
 * This attempts the primary operation with retries, and if all retries fail,
 * it falls back to the provided fallback operation.
 *
 * @example
 * ```typescript
 * const { data, error } = await withRetryAndFallback(
 *   () => supabase.from('profiles').update(data).eq('id', userId),
 *   (token) => directUpdate('profiles', data, [{ column: 'id', operator: 'eq', value: userId }], token)
 * );
 * ```
 */
export async function withRetryAndFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: (token?: string) => Promise<T>,
  options?: Partial<RetryOptions>,
  authToken?: string
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };

  try {
    // Try primary operation with retries
    return await withRetry(primaryOperation, opts);
  } catch (primaryError: any) {
    // If direct fetch is enabled, try fallback
    if (opts.enableDirectFetch) {
      if (opts.logMetrics) {
        console.log('[retry] Primary operation failed, trying fallback...');
      }

      try {
        const result = await fallbackOperation(authToken);

        if (opts.logMetrics) {
          console.log('[retry] Fallback operation succeeded');
        }

        return result;
      } catch (fallbackError: any) {
        if (opts.logMetrics) {
          console.error('[retry] Fallback operation also failed:', fallbackError);
        }
        // Throw the fallback error as it's the most recent
        throw fallbackError;
      }
    }

    // No fallback enabled, throw primary error
    throw primaryError;
  }
}
