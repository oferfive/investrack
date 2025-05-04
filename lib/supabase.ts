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
    debug: process.env.NODE_ENV === 'development'
  }
}); 