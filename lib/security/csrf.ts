import { randomBytes } from 'crypto';

class CSRFProtection {
  private static instance: CSRFProtection;
  private token: string | null = null;

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  generateToken(): string {
    this.token = randomBytes(32).toString('hex');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', this.token);
    }
    return this.token;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = sessionStorage.getItem('csrf_token');
    }
    return this.token;
  }

  validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && token === storedToken;
  }

  getHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'X-CSRF-Token': token } : {};
  }
}

export const csrfProtection = CSRFProtection.getInstance();

export const withCSRF = (headers: Record<string, string> = {}) => ({
  ...headers,
  ...csrfProtection.getHeaders(),
});