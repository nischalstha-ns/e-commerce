import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/utils/redis';

// Security middleware for API routes
export function withSecurity(handler: Function) {
  return async (request: NextRequest) => {
    try {
      // Get client IP
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

      // Rate limiting
      const allowed = await checkRateLimit(`api-${clientIP}`, 100, 60000);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }

      // CSRF protection for state-changing operations
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');
        
        // Check origin for CSRF protection
        if (origin && !origin.includes(host || '')) {
          return NextResponse.json(
            { error: 'Invalid origin' },
            { status: 403 }
          );
        }
      }

      // Content-Type validation for POST requests
      if (request.method === 'POST') {
        const contentType = request.headers.get('content-type');
        if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
          return NextResponse.json(
            { error: 'Invalid content type' },
            { status: 400 }
          );
        }
      }

      // Call the original handler
      return await handler(request);

    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Input validation middleware
export function validateInput(schema: any) {
  return function (handler: Function) {
    return async (request: NextRequest) => {
      try {
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
          const body = await request.json();
          
          // Basic validation
          if (!body || typeof body !== 'object') {
            return NextResponse.json(
              { error: 'Invalid request body' },
              { status: 400 }
            );
          }

          // Size limit check (1MB)
          const bodySize = JSON.stringify(body).length;
          if (bodySize > 1024 * 1024) {
            return NextResponse.json(
              { error: 'Request body too large' },
              { status: 413 }
            );
          }
        }

        return await handler(request);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON' },
          { status: 400 }
        );
      }
    };
  };
}

// Authentication middleware
export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user info to request context if needed
    return await handler(request);
  };
}