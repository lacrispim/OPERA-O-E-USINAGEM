import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/shop-floor', '/registros-firebase'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // This token would typically be a secure, HTTP-only cookie set by Firebase Auth server-side.
  // For this client-side prototype, we check for a client-set flag in cookies.
  const isAuthenticated = request.cookies.get('firebaseAuth.authenticated')?.value === 'true';

  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/shop-floor', request.url));
  }

  if (!isAuthenticated && protectedRoutes.includes(pathname)) {
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
