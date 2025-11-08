/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Comprehensive product validation with security checks
 */
export const validateProduct = (data: any): ValidationResult => {
  try {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid product data'] };
    }
    
    // Sanitize and validate name
    const sanitizedName = sanitizeInput(data.name || '');
    if (!sanitizedName || sanitizedName.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    if (sanitizedName.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
    
    // Validate price
    const price = parseFloat(data.price);
    if (!price || price <= 0 || price > 1000000) {
      errors.push('Price must be between $0.01 and $1,000,000');
    }
    
    // Validate category
    if (!data.categoryId?.trim() || data.categoryId.length > 50) {
      errors.push('Valid category is required');
    }
    
    // Validate stock
    const stock = parseInt(data.stock);
    if (isNaN(stock) || stock < 0 || stock > 100000) {
      errors.push('Stock must be between 0 and 100,000');
    }
    
    // Validate sale price
    if (data.salePrice) {
      const salePrice = parseFloat(data.salePrice);
      if (isNaN(salePrice) || salePrice <= 0 || salePrice >= price) {
        errors.push('Sale price must be less than regular price');
      }
    }
    
    // Validate description
    if (data.description) {
      const sanitizedDesc = sanitizeInput(data.description);
      if (sanitizedDesc.length > 2000) {
        errors.push('Description cannot exceed 2000 characters');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    return { isValid: false, errors: ['Validation error occurred'] };
  }
};

/**
 * Enhanced email validation with security checks
 */
export const validateEmail = (email: string): boolean => {
  try {
    if (!email || typeof email !== 'string') return false;
    
    const sanitizedEmail = email.trim().toLowerCase();
    
    // Check length limits
    if (sanitizedEmail.length < 5 || sanitizedEmail.length > 254) return false;
    
    // Enhanced email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(sanitizedEmail);
  } catch {
    return false;
  }
};

/**
 * Rate limiting validation
 */
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

/**
 * Security validation for file uploads
 */
export const validateFileUpload = (file: File): ValidationResult => {
  try {
    const errors: string[] = [];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('File size cannot exceed 5MB');
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
    
    // Check filename
    const sanitizedName = sanitizeInput(file.name);
    if (!sanitizedName || sanitizedName.length > 255) {
      errors.push('Invalid filename');
    }
    
    return { isValid: errors.length === 0, errors };
  } catch {
    return { isValid: false, errors: ['File validation error'] };
  }
};

/**
 * Comprehensive input sanitization with advanced XSS protection
 */
export const sanitizeInput = (input: string): string => {
  try {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      // Remove all script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove data: URIs that could contain scripts
      .replace(/data:(?!image\/(png|jpe?g|gif|webp|svg\+xml))[^;]*;/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove style attributes that could contain CSS injection
      .replace(/style\s*=\s*["'][^"']*["']/gi, '')
      // Remove potentially dangerous HTML tags
      .replace(/<(iframe|object|embed|form|input|textarea|select|button|link|meta|base)[^>]*>/gi, '')
      // Remove HTML comments that could hide malicious code
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove encoded scripts
      .replace(/%3Cscript/gi, '')
      .replace(/&lt;script/gi, '')
      // Limit length
      .slice(0, 1000);
  } catch {
    return '';
  }
};

/**
 * Validate and sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeInput(key);
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value);
    } else {
      sanitized[sanitizedKey] = value;
    }
  }
  return sanitized;
};