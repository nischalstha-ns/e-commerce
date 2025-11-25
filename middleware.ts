import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  
  // Skip for localhost and main domain
  if (hostname.includes('localhost') || subdomain === 'www' || !subdomain) {
    return NextResponse.next();
  }
  
  // Add tenant context to headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-subdomain', subdomain);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhook).*)',
  ],
};
