import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/validation/rateLimit';

// Security middleware for API routes
export function withSecurity(handler: Function) {
  return async (request: NextRequest) => {
    try {
      // Get client IP — leftmost entry of x-forwarded-for is the client.
      const forwarded = request.headers.get('x-forwarded-for');
      const clientIP = (forwarded ? forwarded.split(',')[0].trim() : null) ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

      // Rate limiting
      if (!checkRateLimit(`api-${clientIP}`, 100, 60000)) { // 100 requests per minute
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }

      // CSRF protection for state-changing operations.
      // Exact origin match — substring matching lets
      // "https://evil-example.com" pass for host "example.com".
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');

        if (origin && host) {
          let originHost: string | null = null;
          try {
            originHost = new URL(origin).host;
          } catch {
            originHost = null;
          }
          if (!originHost || originHost !== host) {
            return NextResponse.json(
              { error: 'Invalid origin' },
              { status: 403 }
            );
          }
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

// Authentication middleware — verifies the Firebase ID token.
// Attach the verified uid to the request as `x-verified-uid` for handlers.
export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const { verifyRequestToken } = await import("@/lib/saas/firebase-admin");
    const uid = await verifyRequestToken(request);
    if (!uid) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const headers = new Headers(request.headers);
    headers.set("x-verified-uid", uid);
    const authed = new NextRequest(request, { headers });
    return await handler(authed);
  };
}