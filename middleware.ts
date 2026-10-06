import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'auth_token';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'progress_tracker_default_jwt_secret_dev_key_382910';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isAuthPage = pathname === '/' || pathname === '/register';
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');

  // If on login/register and already logged in, redirect to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If on protected page and not logged in, redirect to login
  if (isProtectedPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/register', '/dashboard/:path*', '/profile/:path*'],
};
