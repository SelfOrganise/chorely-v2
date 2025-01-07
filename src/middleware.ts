/* eslint-disable @typescript-eslint/no-explicit-any */

import { default as nextAuthMiddleware, NextAuthMiddlewareOptions } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export default function middleware(...args: any): unknown {
  if (Array.isArray(args)) {
    const request = args[0] as NextRequest | null;
    if (typeof request?.nextUrl?.pathname === 'string') {
      const publicPaths = [
        '/auth',
        '/secret/signup',
        '/api/alexa',
        '/api/auth',
        '/manifest.json',
        '/favicon',
        '/chores.png',
      ]; // trpc handles api/trpc

      if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
        return;
      }
    }
  }

  // eslint-disable-next-line prefer-spread
  return nextAuthMiddleware.apply(null, args as [NextAuthMiddlewareOptions]);
}
