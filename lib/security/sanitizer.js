// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  // Preserve arrays — don't collapse them into plain objects.
  if (Array.isArray(obj)) {
    return obj.map((value) =>
      typeof value === 'string' ? sanitizeInput(value)
      : typeof value === 'object' && value !== null ? sanitizeObject(value)
      : value
    );
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Validate an image URL. Blocks SVG data URIs (XSS vector) and
 * javascript: URLs. Returns the URL or null.
 */
export function sanitizeImageUrl(url) {
  if (typeof url !== 'string' || !url) return null;
  const trimmed = url.trim();
  if (/^data:image\/svg/i.test(trimmed)) return null;
  if (/^javascript:/i.test(trimmed)) return null;
  if (/^data:/i.test(trimmed) && !/^data:image\/(png|jpe?g|gif|webp)/i.test(trimmed)) return null;
  return trimmed.slice(0, 2048);
}

// Rate limiting per user
const userLimits = new Map();

export function checkUserRateLimit(userId, maxRequests = 50, windowMs = 60000) {
  const now = Date.now();
  const userLimit = userLimits.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    userLimits.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}