/**
 * Retry strategy utilities for real-time operations
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
};

/**
 * Calculate delay for exponential backoff
 */
export function calculateBackoffDelay(
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attemptNumber - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Add jitter to prevent thundering herd
 */
export function addJitter(delay: number, jitterFactor = 0.1): number {
  const jitter = delay * jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, delay + jitter);
}

/**
 * Execute a function with retry logic
 * @param fn Function to execute
 * @param options Retry options
 * @returns Result of the function or throws after max retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === config.maxAttempts) {
        throw error;
      }

      const delay = calculateBackoffDelay(attempt, config);
      const delayWithJitter = addJitter(delay);

      console.log(
        `[RetryStrategy] Attempt ${attempt} failed, retrying in ${delayWithJitter}ms`,
        error
      );

      await new Promise((resolve) => setTimeout(resolve, delayWithJitter));
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const err = error as { code?: string; status?: number; message?: string };

  // Network errors
  if (err?.code === 'NETWORK_ERROR' || err?.code === 'ECONNREFUSED') {
    return true;
  }

  // Timeout errors
  if (err?.code === 'ETIMEDOUT' || err?.code === 'ECONNABORTED') {
    return true;
  }

  // HTTP status codes that are retryable
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (err?.status && retryableStatusCodes.includes(err.status)) {
    return true;
  }

  // Supabase specific errors
  if (
    err?.message?.includes('Failed to fetch') ||
    err?.message?.includes('Network request failed')
  ) {
    return true;
  }

  return false;
}

/**
 * Create a retry wrapper for a specific operation
 */
export function createRetryableOperation<T extends (...args: unknown[]) => Promise<unknown>>(
  operation: T,
  config?: Partial<RetryConfig>
): T {
  return (async (...args: Parameters<T>) => {
    return withRetry(() => operation(...args), config);
  }) as T;
}

/**
 * Create a debounced version of a function
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
