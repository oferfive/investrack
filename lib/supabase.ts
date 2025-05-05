import { createClient } from '@supabase/supabase-js';

// Get the appropriate URL and key based on the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create the Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use the appropriate site URL based on the environment
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storageKey: 'sb-auth-token',
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    }
  },
  global: {
    headers: {
      'x-application-name': 'investrack'
    }
  },
  db: {
    schema: 'public'
  }
}); 