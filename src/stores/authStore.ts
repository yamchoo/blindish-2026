/**
 * Authentication State Management
 * Uses Zustand for lightweight, reactive state management
 */

import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase, withRetryAndFallback, directSelect } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  operationInProgress: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setOperationInProgress: (inProgress: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  operationInProgress: false,

  // Set user
  setUser: (user) => set({ user }),

  // Set session
  setSession: (session) => set({ session }),

  // Set profile
  setProfile: (profile) => set({ profile }),

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set operation in progress state
  setOperationInProgress: (operationInProgress) => set({ operationInProgress }),

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        set({ isLoading: false, isInitialized: true });
        return;
      }

      if (!session) {
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true
        });
        return;
      }

      // Set session and user
      set({ session, user: session.user });

      // Get auth token to pass to fallback operations
      const authToken = session.access_token;

      // Fetch user profile (might not exist on first sign-in)
      const { data: profile, error: profileError } = await withRetryAndFallback(
        () => supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        (token) =>
          directSelect('profiles', {
            select: '*',
            filters: [{ column: 'id', operator: 'eq', value: session.user.id }],
            single: true,
          }, token),
        undefined,
        authToken
      );

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 means no rows found - this is okay on first sign-in
        console.error('Error fetching profile:', profileError);
      } else if (profile) {
        set({ profile });
      }
      // If no profile exists, it will be created by the sign-in handler

      set({ isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }

      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Refresh profile data
  refreshProfile: async () => {
    const { user, session } = get();

    if (!user) {
      return;
    }

    try {
      // Get auth token from current state (already in memory, no network call)
      const authToken = session?.access_token;

      const { data: profile, error } = await withRetryAndFallback(
        () => supabase.from('profiles').select('*').eq('id', user.id).single(),
        (token) =>
          directSelect('profiles', {
            select: '*',
            filters: [{ column: 'id', operator: 'eq', value: user.id }],
            single: true,
          }, token),
        undefined,
        authToken
      );

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found - this is okay for new users
        console.error('Error refreshing profile:', error);
        // Don't throw - just log and continue
        return;
      }

      if (profile) {
        set({ profile });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Don't throw - just log and continue
    }
  },
}));

/**
 * Initialize auth state listener
 * Call this once at app startup to listen for auth state changes
 *
 * Implements debouncing for SIGNED_OUT events to prevent false logouts
 * due to temporary network issues or token refresh failures.
 */
let signOutDebounceTimer: NodeJS.Timeout | null = null;
let lastSignedInAt: number = Date.now();

export const initializeAuthListener = () => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);

    const store = useAuthStore.getState();

    if (event === 'SIGNED_IN' && session) {
      // Clear any pending sign-out when we successfully sign in
      if (signOutDebounceTimer) {
        console.log('[auth] Canceling pending sign-out - user signed back in');
        clearTimeout(signOutDebounceTimer);
        signOutDebounceTimer = null;
      }

      lastSignedInAt = Date.now();
      store.setSession(session);
      store.setUser(session.user);
      await store.refreshProfile();

    } else if (event === 'SIGNED_OUT') {
      // Don't immediately clear session - debounce it to handle network glitches
      const currentUser = store.user;
      const timeSinceSignIn = Date.now() - lastSignedInAt;

      // If there's no current user, this is just noise - ignore it
      if (!currentUser) {
        console.log('[auth] Ignoring SIGNED_OUT - no active user session');
        return;
      }

      // If signed out within 10 seconds of sign-in, it's likely a glitch
      if (timeSinceSignIn < 10000) {
        console.warn('[auth] Ignoring rapid SIGNED_OUT - likely a network glitch');
        return;
      }

      // Debounce sign-out by 5 seconds - if we sign back in, it will be canceled
      // 5 seconds gives OAuth flows time to complete
      if (signOutDebounceTimer) clearTimeout(signOutDebounceTimer);

      console.log('[auth] SIGNED_OUT detected - waiting 5s before clearing session');
      signOutDebounceTimer = setTimeout(() => {
        console.log('[auth] Confirmed SIGNED_OUT - clearing session');
        store.setSession(null);
        store.setUser(null);
        store.setProfile(null);
        signOutDebounceTimer = null;
      }, 5000);

    } else if (event === 'TOKEN_REFRESHED' && session) {
      store.setSession(session);
      store.setUser(session.user);
    } else if (event === 'USER_UPDATED' && session) {
      store.setUser(session.user);
      await store.refreshProfile();
    }
  });
};
