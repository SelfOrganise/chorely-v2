import { default as nextAuthMiddleware, WithAuthArgs } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export default function middleware(...args: any): unknown {
  if (typeof args[0]?.nextUrl?.pathname === 'string') {
    const request: NextRequest = args[0];

    const publicPaths = [
      '/auth',
      '/secret/signup',
      '/api/trpc',
      '/api/auth',
      '/manifest.json',
      '/favicon',
      '/chores.png',
    ]; // trpc handles api/trpc

    if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return;
    }
  }

  return nextAuthMiddleware(...args);
}
