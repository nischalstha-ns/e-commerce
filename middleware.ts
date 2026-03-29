import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/orders", "/profile", "/checkout", "/cart"];
const ADMIN_ROUTES = ["/admin", "/super-admin"];
const AUTH_ROUTES = ["/login", "/sign-up", "/forgot-password"];

function getTokenFromCookies(request: NextRequest): string | null {
  return (
    request.cookies.get("firebase-auth-token")?.value ||
    request.cookies.get("__session")?.value ||
    null
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const token = getTokenFromCookies(request);

  // Redirect unauthenticated users away from protected routes
  if ((isProtectedRoute || isAdminRoute) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Security headers on all responses
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|api/webhook|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
