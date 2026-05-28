import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                           req.nextUrl.pathname.startsWith('/products') || 
                           req.nextUrl.pathname.startsWith('/orders');

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn && isDashboardRoute) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return Response.redirect(
      new URL(`/auth?callbackUrl=${encodeURIComponent(from)}`, req.nextUrl)
    );
  }
  
  return;
});

export const config = {
  matcher: ['/((?!api|p/|_next/static|_next/image|favicon.ico|logo.svg).*)'],
};
