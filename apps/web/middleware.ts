import { csrfMiddleware } from '@/middleware/csrf';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/swipe',
  '/matches',
  '/chat',
  '/profile',
  '/pets',
  '/my-pets',
  '/premium',
  '/moderation',
];

// Define public-only routes (redirect to dashboard if logged in)
const publicOnlyRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === CSRF Protection ===
  // Run CSRF middleware for all API routes
  if (pathname.startsWith('/api/')) {
    const csrfResponse = await csrfMiddleware(request);
    if (csrfResponse) {
      // CSRF validation failed, return error response
      return csrfResponse;
    }
  }

  // Block demo/test pages in production
  if (process.env.NODE_ENV === 'production') {
    if (
      pathname.startsWith('/dev/') ||
      pathname.startsWith('/demo-') ||
      pathname.startsWith('/test-')
    ) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  // Get the token from cookies (support multiple names)
  const token =
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('access_token')?.value ||
    request.cookies.get('pm_access')?.value ||
    null;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if the route is public-only
  const isPublicOnlyRoute = publicOnlyRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginPath = pathname.startsWith('/moderation') ? '/admin/login' : '/login';
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access public-only routes, redirect to dashboard
  if (isPublicOnlyRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * 
     * INCLUDES api routes for CSRF protection
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|mp4|webm)$).*)',
  ],
};
