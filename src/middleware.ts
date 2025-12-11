import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All routes inside /app are protected by default
// You can add public routes to this array
const publicRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // This token would typically be a secure, HTTP-only cookie set by Firebase Auth server-side.
  // For this client-side prototype, we check for a client-set flag in cookies.
  const isAuthenticated = request.cookies.get('firebaseAuth.authenticated')?.value === 'true';

  const isPublicRoute = publicRoutes.includes(pathname);

  // If the user is authenticated and tries to access a public route, redirect them to the main app page.
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/shop-floor', request.url));
  }

  // If the user is not authenticated and is trying to access a protected route, redirect to login.
  if (!isAuthenticated && !isPublicRoute && pathname.startsWith('/')) {
    // allow root page to redirect to login
    if (pathname === '/') return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
