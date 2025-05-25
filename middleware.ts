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
  
  try {
    // Check for last activity timestamp
    const lastActivity = request.cookies.get('last_activity');
    const now = Date.now();
    
    // If no activity recorded or too old, redirect to login
    if (!lastActivity) {
      // Set a new activity timestamp and let them through this time
      const response = NextResponse.next();
      response.cookies.set('last_activity', now.toString(), { 
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
      return response;
    }
    
    const lastActivityTime = parseInt(lastActivity.value, 10);
    const inactiveTime = now - lastActivityTime;
    
    if (inactiveTime > MAX_INACTIVITY_TIME) {
      // Session expired due to inactivity
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('expired', 'true');
      return NextResponse.redirect(url);
    }
    
    // Update the last activity timestamp
    const response = NextResponse.next();
    response.cookies.set('last_activity', now.toString(), { 
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, let the request through
    return NextResponse.next();
  }
}

// Only run middleware on routes that need protection
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 