/**
 * useAuth Hook
 * Provides authentication state and actions
 */

import { useAuthStore } from '@/stores/authStore';
import {
  signInWithGoogle,
  signInWithApple,
  signOut as signOutService,
  createOrUpdateProfile,
} from '../services/authService';
import { useState } from 'react';

export const useAuth = () => {
  const {
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    signOut: signOutStore,
    refreshProfile,
  } = useAuthStore();

  const [error, setError] = useState<Error | null>(null);

  /**
   * Sign in with Google
   */
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const { data, error: authError } = await signInWithGoogle();

      if (authError) {
        setError(authError);
        return { success: false, error: authError };
      }

      if (data?.user) {
        // Note: We don't create the profile here anymore - it will be created
        // during onboarding when the user fills out the basic-info form.
        // This avoids JWT token propagation timing issues immediately after OAuth.

        // Refresh profile from database (will be null for new users)
        await refreshProfile();
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error };
    }
  };

  /**
   * Sign in with Apple
   */
  const handleAppleSignIn = async () => {
    try {
      setError(null);
      const { data, error: authError } = await signInWithApple();

      if (authError) {
        setError(authError);
        return { success: false, error: authError };
      }

      if (data?.user) {
        // Note: We don't create the profile here anymore - it will be created
        // during onboarding when the user fills out the basic-info form.
        // This avoids JWT token propagation timing issues immediately after OAuth.

        // Refresh profile from database (will be null for new users)
        await refreshProfile();
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error };
    }
  };

  /**
   * Sign out
   */
  const handleSignOut = async () => {
    try {
      setError(null);
      await signOutStore();
      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error };
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user && !!session;

  /**
   * Check if user has completed onboarding
   */
  const hasCompletedOnboarding = profile?.onboarding_completed || false;

  return {
    // State
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated,
    hasCompletedOnboarding,
    error,

    // Actions
    signInWithGoogle: handleGoogleSignIn,
    signInWithApple: handleAppleSignIn,
    signOut: handleSignOut,
    refreshProfile,
  };
};
