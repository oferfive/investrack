"use client"

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

// For testing: 20 seconds
// const IDLE_TIMEOUT = 20 * 1000;
// For production: 60 minutes
const IDLE_TIMEOUT = 30 * 60 * 1000;

export default function AutoLogout() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Helper function to log for debugging
  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => `${message}\n${prev}`.slice(0, 500)); // Keep log size reasonable
  };

  // The actual logout function - with multiple fallbacks
  const performLogout = async () => {
    // Prevent multiple logout attempts
    if (isLoggingOutRef.current) {
      logDebug("Already logging out - skipping duplicate request");
      return;
    }

    isLoggingOutRef.current = true;
    logDebug(`LOGOUT: Starting logout process at ${new Date().toLocaleTimeString()}`);
    
    try {
      // Try multiple logout methods to ensure it works
      try {
        // Method 1: Context signOut
        logDebug("LOGOUT: Trying context signOut");
        await signOut();
        logDebug("LOGOUT: Context signOut completed");
      } catch (err) {
        // Method 2: Direct Supabase logout
        logDebug(`LOGOUT: Context signOut failed, trying direct Supabase logout. Error: ${err}`);
        await supabase.auth.signOut();
        logDebug("LOGOUT: Direct Supabase signOut completed");
      }
      
      // Clear any auth tokens from localStorage for extra security
      logDebug("LOGOUT: Clearing any leftover auth tokens");
      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Force hard redirect to login page
      logDebug("LOGOUT: Redirecting to login page");
      window.location.href = '/login';
    } catch (error) {
      logDebug(`LOGOUT ERROR: ${error}`);
      // Final fallback - force navigation no matter what
      window.location.href = '/login?forcedLogout=true';
    }
  };

  useEffect(() => {
    if (!user) {
      logDebug('No user detected, auto-logout inactive');
      return;
    }

    logDebug(`Auto-logout initialized for user ${user.email} with ${IDLE_TIMEOUT/1000}s timeout`);
    
    // Reset the timer when user activity is detected
    const resetIdleTimer = () => {
      const now = Date.now();
      
      // Skip if we're in the process of logging out
      if (isLoggingOutRef.current) {
        return;
      }
      
      // Update last activity time
      lastActivityRef.current = now;
      
      // Clear existing timer if there is one
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set new timer
      timerRef.current = setTimeout(() => {
        const idleTime = Date.now() - lastActivityRef.current;
        logDebug(`Idle timeout reached. User idle for ${Math.round(idleTime/1000)}s`);
        performLogout();
      }, IDLE_TIMEOUT);
    };

    // Track tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, check if we should logout based on idle time
        const now = Date.now();
        const idleTime = now - lastActivityRef.current;
        
        logDebug(`Tab became visible. Idle time: ${Math.round(idleTime/1000)}s`);
        
        if (idleTime >= IDLE_TIMEOUT) {
          // If user has been idle longer than timeout while tab was hidden, logout
          logDebug('Idle timeout exceeded while tab was hidden, logging out');
          performLogout();
        } else {
          // Otherwise reset the timer
          resetIdleTimer();
        }
      }
    };

    // Handle user-initiated events that indicate activity
    const handleUserActivity = () => {
      // Skip if we're logging out
      if (isLoggingOutRef.current) return;
      
      resetIdleTimer();
    };
    
    // Only track explicit user interactions
    const userEvents = ['mousedown', 'keydown', 'touchstart'];
    userEvents.forEach(event => window.addEventListener(event, handleUserActivity));
    
    // Monitor tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start initial timer
    resetIdleTimer();
    
    // Cleanup
    return () => {
      logDebug('Cleaning up AutoLogout component');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      userEvents.forEach(event => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, signOut]);

  // For debugging - render an invisible element with debug info
  return (
    <div style={{ display: 'none' }} data-testid="auto-logout-debug">
      {debugInfo}
    </div>
  );
} 