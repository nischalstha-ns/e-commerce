// In-memory sliding-window rate limiter.
//
// NOTE: this is per-process state — on serverless/multi-instance deployments
// each instance tracks its own counters. For strict global limits use a
// shared store (Redis/Upstash). Expired entries are evicted on each call so
// the map can't grow forever.

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function evictExpired(now: number): void {
  if (rateLimitMap.size < 1000) return;
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(key);
  }
}

export const checkRateLimit = (
  identifier: string,
  maxRequests = 10,
  windowMs = 60000
): boolean => {
  try {
    const now = Date.now();
    evictExpired(now);
    const limit = rateLimitMap.get(identifier);

    if (!limit || now > limit.resetTime) {
      rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  } catch {
    return false;
  }
};

export const resetRateLimit = (identifier: string): void => {
  rateLimitMap.delete(identifier);
};
