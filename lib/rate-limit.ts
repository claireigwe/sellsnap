/**
 * Simple in-memory rate limiter.
 *
 * Apply to public endpoints: login, signup, order creation.
 *
 * ⚠️ Serverless limitation: This uses an in-memory Map which resets
 * on every cold start. On Vercel (serverless), each invocation is a
 * separate instance, so the limiter will NOT persist across requests.
 * For production with real traffic, replace with a Redis-backed
 * limiter (e.g. @upstash/ratelimit).
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

type RateLimitConfig = {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
};

/**
 * Creates a rate limiter with the given configuration.
 *
 * @example
 * const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });
 *
 * // In a route handler:
 * const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
 * const { allowed } = limiter.check(ip);
 * if (!allowed) {
 *   return NextResponse.json({ ok: false, error: { code: 'rate_limited', message: 'Too many requests.' } }, { status: 429 });
 * }
 */
export function createRateLimiter(config: RateLimitConfig) {
  return {
    check(key: string): { allowed: boolean; remaining: number } {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetTime) {
        store.set(key, { count: 1, resetTime: now + config.windowMs });
        return { allowed: true, remaining: config.maxRequests - 1 };
      }

      if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      entry.count += 1;
      return { allowed: true, remaining: config.maxRequests - entry.count };
    },
  };
}

// Pre-configured limiters for common use cases
export const authLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60_000, // 5 attempts per minute
});

export const orderLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000, // 10 order attempts per minute
});
