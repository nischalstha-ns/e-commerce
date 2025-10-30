import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Advanced rate limiting with different tiers
const rateLimit = new Map();
const suspiciousIPs = new Set();

function isRateLimited(ip: string, path: string): boolean {
  try {
    if (!ip || !path) return false;
    
    const now = Date.now();
    const windowMs = 60000;
    
    const limits: Record<string, number> = {
      '/api/': 30,
      '/admin': 20,
      default: 100
    };
  
    let maxRequests = limits.default;
    for (const [key, value] of Object.entries(limits)) {
      if (key !== 'default' && path.startsWith(key)) {
        maxRequests = value;
        break;
      }
    }
  
    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs, violations: 0 });
      return false;
    }
  
    const limit = rateLimit.get(ip);
  
    try {
      if (now > limit.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + windowMs, violations: limit.violations });
        return false;
      }
    
      if (limit.count >= maxRequests) {
        limit.violations++;
        if (limit.violations > 3) {
          suspiciousIPs.add(ip);
        }
        return true;
      }
    } catch (error) {
      return false;
    }
  
    limit.count++;
    return false;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const path = request.nextUrl.pathname;
    
    if (suspiciousIPs.has(ip)) {
      return new NextResponse('Blocked', { status: 403 });
    }
    
    if (isRateLimited(ip, path)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  
    const response = NextResponse.next();
  
    const securityHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://apis.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' blob: https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss: https://www.google-analytics.com https://analytics.google.com; frame-src 'self' https://accounts.google.com https://safeframe.googlesyndication.com https://*.firebaseapp.com; frame-ancestors 'none';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
    };
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Proxy error:', error);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};