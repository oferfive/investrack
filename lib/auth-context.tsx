'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGitHub: () => Promise<void>;
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
function initializeAuthState() {
  if (globalAuthState.initialized) return;

  globalAuthState.initialized = true;
  
  // Set up the auth state change listener only once
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
    const newUser = session?.user ?? null;
    globalAuthState.user = newUser;
    
    // Notify all listeners
    globalAuthState.listeners.forEach(listener => listener(newUser));
    
    // Create profile if needed
    if (newUser) {
      await createProfileIfExists(newUser);
    }
  });
  
  globalAuthState.subscription = subscription;
}

// Shared profile creation function
async function createProfileIfExists(user: User) {
  try {
    console.log('Attempting to create profile for user:', {
      id: user?.id,
      email: user?.email,
      metadata: user?.user_metadata
    });

    if (!user?.id || !user?.email) {
      console.error('Missing user ID or email:', { user });
      return;
    }

    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', selectError);
      return;
    }

    if (!existingProfile) {
      console.log('No existing profile found, creating new one');
      
      // First try with avatar_url
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.log('First insert attempt failed, trying without avatar_url:', insertError);
        // If that fails, try without avatar_url
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (retryError) {
          console.error('Error creating profile (second attempt):', retryError);
          throw retryError;
        }

        console.log('Successfully created profile (second attempt):', retryProfile);
      } else {
        console.log('Successfully created profile:', newProfile);
      }
    } else {
      console.log('Profile already exists:', existingProfile);
    }
  } catch (error) {
    console.error('Unexpected error in createProfileIfExists:', error);
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(globalAuthState.user);
  const [loading, setLoading] = useState(true);
  const listenerRef = useRef<((user: User | null) => void) | null>(null);

  useEffect(() => {
    console.log('AuthProvider mounted');
    console.log('Current auth state:', {
      user: globalAuthState.user,
      initialized: globalAuthState.initialized,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    });

    // Initialize global auth state if not already done
    initializeAuthState();
    
    // Create a listener function
    const listener = (newUser: User | null) => {
      console.log('Auth state changed:', { newUser });
      setUser(newUser);
      setLoading(false);
    };
    
    // Save reference for cleanup
    listenerRef.current = listener;
    
    // Add this component as a listener
    globalAuthState.listeners.add(listener);
    
    // If we already have a user, update state immediately
    if (globalAuthState.user) {
      console.log('Found existing user:', globalAuthState.user);
      setUser(globalAuthState.user);
      setLoading(false);
    }
    
    return () => {
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
            prompt: 'consent',
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signInWithGitHub,
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