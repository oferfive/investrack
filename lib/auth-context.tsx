'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global state to prevent multiple auth subscriptions
type AuthState = {
  user: User | null;
  listeners: Set<(user: User | null) => void>;
  subscription: { unsubscribe: () => void } | null;
  initialized: boolean;
};

const globalAuthState: AuthState = {
  user: null,
  listeners: new Set(),
  subscription: null,
  initialized: false
};

// Initialize the global auth state once
async function initializeAuthState() {
  if (globalAuthState.initialized) return;

  console.log('Initializing global auth state');
  
  try {
    // First check if we already have a session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('Found existing session on initialization:', { 
        id: session.user.id,
        email: session.user.email
      });
      globalAuthState.user = session.user;
      
      // Make sure profile exists for existing session
      await createProfileIfExists(session.user);
    } else {
      console.log('No existing session found on initialization');
    }
    
    // Set up the auth state change listener only once
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state change event:', event);
      const newUser = session?.user ?? null;
      
      if (newUser) {
        console.log('Auth state changed - user logged in:', { 
          id: newUser.id,
          email: newUser.email
        });
        
        // Wait for profile check to complete before updating global state
        await createProfileIfExists(newUser);
        globalAuthState.user = newUser;
      } else {
        console.log('Auth state changed - user logged out');
        globalAuthState.user = null;
      }
      
      // Notify all listeners after profile is confirmed
      globalAuthState.listeners.forEach(listener => listener(newUser));
    });
    
    globalAuthState.subscription = subscription;
    globalAuthState.initialized = true;
    console.log('Auth state initialization complete');
  } catch (error) {
    console.error('Error initializing auth state:', error);
  }
}

// Shared profile creation function
async function createProfileIfExists(user: User) {
  try {
    console.log('Checking profile for user:', {
      id: user?.id,
      email: user?.email,
    });

    if (!user?.id || !user?.email) {
      console.error('Missing user ID or email:', { user });
      return;
    }

    // Improved profile check
    try {
      console.log('Looking for existing profile with ID:', user.id);
      
      // Try to get the profile directly
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      console.log('Profile lookup result:', { 
        found: !!existingProfile, 
        error: selectError ? { code: selectError.code, message: selectError.message } : null 
      });

      if (existingProfile) {
        console.log('Found existing profile - updating last access time');
        
        // Update the profile's last access time
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('Error updating profile last access:', updateError);
        } else {
          console.log('Updated profile last access time successfully');
        }
        return;
      }
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking for existing profile:', selectError);
        throw selectError; // Let the error be caught by the outer catch
      }
      
      // If we get here, profile doesn't exist and needs to be created
      console.log('No existing profile found, creating new one for user:', user.id);
      
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.user_name || user.email?.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating profile with data:', profileData);

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details
        });
        
        // Add special handling for potential duplicate key issues
        if (insertError.code === '23505') { // PostgreSQL unique violation
          console.log('Profile may already exist but was not found in the first query. Trying to fetch again...');
          
          // Try to get the profile one more time
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (retryProfile) {
            console.log('Profile found on second attempt:', retryProfile);
            return;
          } else {
            console.error('Profile still not found on second attempt');
          }
        }
        
        throw insertError;
      } else {
        console.log('Successfully created new profile:', newProfile);
      }
      
    } catch (err) {
      console.error('Error in profile check/creation:', err);
      throw err; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Unexpected error in createProfileIfExists:', error);
    // Don't throw error up to caller - just log it
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(globalAuthState.user);
  const [loading, setLoading] = useState(true);
  const listenerRef = useRef<((user: User | null) => void) | null>(null);

  useEffect(() => {
    console.log('AuthProvider mounted');
    
    // Track initialization state
    let isMounted = true;
    
    async function initAuth() {
      try {
        // Log initial state
        console.log('Current auth state:', {
          user: globalAuthState.user,
          initialized: globalAuthState.initialized,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL
        });
    
        // Initialize global auth state if not already done
        await initializeAuthState();
        
        // Check if component is still mounted 
        if (!isMounted) return;
        
        // Create a listener function
        const listener = (newUser: User | null) => {
          console.log('AuthProvider received user update:', { 
            userId: newUser?.id,
            isAuthenticated: !!newUser
          });
          setUser(newUser);
          setLoading(false);
        };
        
        // Save reference for cleanup
        listenerRef.current = listener;
        
        // Add this component as a listener
        globalAuthState.listeners.add(listener);
        
        // If we already have a user, update state immediately
        if (globalAuthState.user) {
          console.log('Found existing user in AuthProvider:', { 
            id: globalAuthState.user.id,
            email: globalAuthState.user.email 
          });
          setUser(globalAuthState.user);
          setLoading(false);
        } else {
          // No user yet, but initialization is done
          console.log('No user found after initialization');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in AuthProvider initialization:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    initAuth();
    
    return () => {
      isMounted = false;
      // Remove this component as a listener on unmount
      if (listenerRef.current) {
        globalAuthState.listeners.delete(listenerRef.current);
      }
    };
  }, []);

  const signInWithGitHub = async () => {
    console.log('Initiating GitHub sign-in');
    console.log('Redirect URL:', `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          queryParams: {
            access_type: 'offline',
          },
          scopes: 'read:user user:email'
        }
      });

      if (error) {
        console.error('GitHub sign-in error:', error);
        throw error;
      }

      console.log('GitHub sign-in initiated successfully:', data);
    } catch (err) {
      console.error('Unexpected error during GitHub sign-in:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log('Initiating email sign-in');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Email sign-in error:', error);
        throw error;
      }

      console.log('Email sign-in successful:', data);
    } catch (err) {
      console.error('Unexpected error during email sign-in:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('Initiating email sign-up');
    
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!siteUrl) {
        console.error('NEXT_PUBLIC_SITE_URL is not set');
        throw new Error('Site URL is not configured');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/dashboard`,
        },
      });

      if (error) {
        console.error('Email sign-up error:', error);
        throw error;
      }

      console.log('Email sign-up successful:', data);
    } catch (err) {
      console.error('Unexpected error during email sign-up:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 