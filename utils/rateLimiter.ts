/**
 * Client-side rate limiter to prevent spam and abuse
 */
class RateLimiter {
  private attempts = new Map<string, number[]>();

  /**
   * Check if an action can be performed based on rate limits
   * @param userId - The user performing the action
   * @param action - The action being performed (e.g., 'comment', 'reaction')
   * @param maxAttempts - Maximum number of attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if action is allowed, false if rate limited
   */
  canPerformAction(userId: string, action: string, maxAttempts: number, windowMs: number): boolean {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove attempts outside the time window
    const validAttempts = userAttempts.filter((time) => now - time < windowMs);

    // Check if user has exceeded the limit
    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    // Add the current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);

    // Clean up old entries periodically
    this.cleanup();

    return true;
  }

  /**
   * Get remaining time until rate limit resets
   * @param userId - The user to check
   * @param action - The action to check
   * @param windowMs - Time window in milliseconds
   * @returns Time in milliseconds until the oldest attempt expires, or 0 if not rate limited
   */
  getTimeUntilReset(userId: string, action: string, windowMs: number): number {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    if (userAttempts.length === 0) return 0;

    const validAttempts = userAttempts.filter((time) => now - time < windowMs);
    if (validAttempts.length === 0) return 0;

    const oldestAttempt = Math.min(...validAttempts);
    return Math.max(0, oldestAttempt + windowMs - now);
  }

  /**
   * Clear rate limit for a specific user and action
   */
  clearLimit(userId: string, action: string): void {
    const key = `${userId}_${action}`;
    this.attempts.delete(key);
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup(): void {
    // Run cleanup every 100 checks
    if (Math.random() > 0.01) return;

    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter((time) => now - time < maxAge);
      if (validAttempts.length === 0) {
        this.attempts.delete(key);
      } else if (validAttempts.length !== attempts.length) {
        this.attempts.set(key, validAttempts);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
