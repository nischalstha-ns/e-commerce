/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Product validation with comprehensive error handling
 */
export const validateProduct = (data: any): ValidationResult => {
  try {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid product data'] };
    }
    
    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Valid price is required');
    }
    if (!data.categoryId?.trim()) errors.push('Category is required');
    if (typeof data.stock !== 'number' || data.stock < 0) {
      errors.push('Stock cannot be negative');
    }
    if (data.salePrice && (typeof data.salePrice !== 'number' || data.salePrice >= data.price)) {
      errors.push('Sale price must be less than regular price');
    }
    
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    return { isValid: false, errors: ['Validation error occurred'] };
  }
};

/**
 * Email validation with error handling
 */
export const validateEmail = (email: string): boolean => {
  try {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  } catch {
    return false;
  }
};

/**
 * Input sanitization with comprehensive cleaning
 */
export const sanitizeInput = (input: string): string => {
  try {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .slice(0, 1000); // Limit length
  } catch {
    return '';
  }
};