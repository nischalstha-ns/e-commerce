import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // API route protection
  if (pathname.startsWith('/api/')) {
    // Skip public APIs
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/products/search')) {
      return NextResponse.next();
    }

    // Check authentication for protected APIs
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
