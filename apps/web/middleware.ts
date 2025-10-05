import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n';

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

// Define protected routes (without locale prefix)
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
  
  // First, handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware returns a response (redirect), use it
  if (intlResponse) {
    return intlResponse;
  }
  
  // Extract locale from pathname for auth checks
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  // If no locale in pathname, let intl middleware handle it
  if (pathnameIsMissingLocale) {
    return intlMiddleware(request);
  }
  
  // Get the path without locale prefix for auth checks
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
  
  // Get the token from cookies (we'll set this when user logs in)
  const token = request.cookies.get('accessToken')?.value || request.cookies.get('auth-token')?.value;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));
  
  // Check if the route is public-only
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => pathWithoutLocale.startsWith(route));
  
  // Get current locale from pathname
  const locale = pathname.split('/')[1];
  
  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('from', pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }
  
  // If logged in and trying to access public-only routes, redirect to dashboard
  if (isPublicOnlyRoute && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Security Headers for Production
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Remove deprecated interest-cohort directive
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  // Content Security Policy (CSP)
  const isDev = process.env.NODE_ENV !== 'production';
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://cdn.socket.io;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.pawfectmatch.com wss://*.pawfectmatch.com http://localhost:* ws://localhost:*;
    media-src 'self' blob:;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  return response;
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
