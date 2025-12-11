import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is now simplified to allow all requests through.
// Authentication has been removed at the user's request.
export function middleware(request: NextRequest) {
  // If the user navigates to the root, redirect them to the main shop-floor page.
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/shop-floor', request.url));
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
