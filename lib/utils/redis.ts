// Redis client for rate limiting (optional - falls back to in-memory)
let redis: any = null;

async function getRedisClient() {
  if (redis) return redis;

  // Only initialize Redis if URL is provided
  if (process.env.REDIS_URL) {
    try {
      const { createClient } = await import('redis');
      redis = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
      });
      await redis.connect();
      return redis;
    } catch (error) {
      console.warn('Redis not available, using in-memory rate limiting');
      return null;
    }
  }
  return null;
}

// In-memory fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): Promise<boolean> {
  const client = await getRedisClient();

  if (client) {
    // Redis-based rate limiting
    try {
      const key = `ratelimit:${identifier}`;
      const current = await client.get(key);
      
      if (!current) {
        await client.set(key, '1', { PX: windowMs });
        return true;
      }

      const count = parseInt(current);
      if (count >= maxRequests) {
        return false;
      }

      await client.incr(key);
      return true;
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const now = Date.now();
  const limit = memoryStore.get(identifier);

  if (!limit || now > limit.resetTime) {
    memoryStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

export async function clearRateLimit(identifier: string): Promise<void> {
  const client = await getRedisClient();
  
  if (client) {
    try {
      await client.del(`ratelimit:${identifier}`);
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
  
  memoryStore.delete(identifier);
}
