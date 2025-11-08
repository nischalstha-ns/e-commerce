const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests = 10, windowMs = 60000): boolean => {
  try {
    const now = Date.now();
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