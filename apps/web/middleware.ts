import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/swipe',
  '/matches',
  '/chat',
  '/profile',
  '/pets',
  '/my-pets',
  '/premium'
];

// Define public-only routes (redirect to dashboard if logged in)
const publicOnlyRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies (we'll set this when user logs in)
  const token = request.cookies.get('auth-token')?.value;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if the route is public-only
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => pathname.startsWith(route));
  
  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*$).*)',
  ],
};
