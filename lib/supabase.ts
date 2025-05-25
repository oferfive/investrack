import { createClient } from '@supabase/supabase-js';

// Get the appropriate URL and key based on the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storageKey: 'sb-auth-token',
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key: string) => {
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

// Get last activity timestamp from localStorage
export const getLastActivity = (): number => {
  try {
    const lastActivity = localStorage.getItem('last_activity_timestamp');
    return lastActivity ? parseInt(lastActivity, 10) : Date.now();
  } catch (error) {
    return Date.now();
  }
};

// Set last activity timestamp in localStorage
export const updateLastActivity = (): void => {
  try {
    localStorage.setItem('last_activity_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error updating last activity timestamp:', error);
  }
};

// Check if session should be expired based on inactivity
export const checkSessionExpiry = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    
    const lastActivity = getLastActivity();
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    
    // 30 minutes of inactivity (in milliseconds)
    const MAX_INACTIVE_TIME = 30 * 60 * 1000;
    
    if (inactiveTime > MAX_INACTIVE_TIME) {
      console.log(`Session expired: Inactive for ${Math.round(inactiveTime/1000/60)} minutes`);
      await supabase.auth.signOut();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session expiry:', error);
    return false;
  }
}; 