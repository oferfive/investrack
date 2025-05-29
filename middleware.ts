import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Max age of session without any activity
const MAX_INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes
  const publicRoutes = ['/login', '/signup', '/reset-password', '/_next', '/api', '/assets', '/images', '/favicon'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

// Only run middleware on routes that need protection
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 