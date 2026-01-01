/**
 * Authentication Service
 * Handles Google and Apple Sign In via Supabase Auth
 */

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase, withRetryAndFallback, directUpdate, directInsert, directSelect } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import type { Provider } from '@supabase/supabase-js';

// Required for auth to work properly
WebBrowser.maybeCompleteAuthSession();

/**
 * Get redirect URL for OAuth
 * For mobile, this should be the custom scheme that Supabase will redirect back to
 */
const getRedirectUrl = () => {
  if (Platform.OS === 'web') {
    return window.location.origin;
  }
  // For mobile, use the custom scheme
  // Supabase will handle the OAuth callback and redirect here
  return 'blindish://auth/callback';
};

/**
 * Sign in with OAuth provider (Google or Apple)
 */
export const signInWithOAuth = async (provider: 'google' | 'apple') => {
  try {
    const redirectUrl = getRedirectUrl();

    console.log('OAuth redirect URL:', redirectUrl);

    // Start OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    });

    if (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }

    // For mobile, open the auth URL in a browser
    if (Platform.OS !== 'web' && data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success') {
        // Extract the URL from the result
        const url = result.url;

        // Parse the URL to get the session
        const urlParams = new URLSearchParams(url.split('#')[1] || '');
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session in Supabase
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            throw sessionError;
          }

          return { data: sessionData, error: null };
        }
      } else if (result.type === 'cancel') {
        return { data: null, error: new Error('User cancelled authentication') };
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error in OAuth flow for ${provider}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  return signInWithOAuth('google');
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async () => {
  return signInWithOAuth('apple');
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error in sign out:', error);
    return { error: error as Error };
  }
};

/**
 * Create or update user profile after authentication
 */
export const createOrUpdateProfile = async (userId: string, data: {
  email: string;
  name?: string;
}) => {
  try {
    // Get auth token for fallback operations (from in-memory auth store, no network call)
    const authToken = getAuthToken();

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await withRetryAndFallback(
      () => supabase.from('profiles').select('id').eq('id', userId).single(),
      (token) =>
        directSelect('profiles', {
          select: 'id',
          filters: [{ column: 'id', operator: 'eq', value: userId }],
          single: true,
        }, token),
      undefined,
      authToken
    );

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking existing profile:', fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      // Profile exists, update it with retry/fallback pattern
      const updateData = {
        email: data.email,
        name: data.name || '',
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await withRetryAndFallback(
        () => supabase.from('profiles').update(updateData).eq('id', userId),
        (token) => directUpdate('profiles', updateData, [{ column: 'id', operator: 'eq', value: userId }], token),
        undefined,
        authToken
      );

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }
    } else {
      // Profile doesn't exist, create it with retry/fallback pattern
      const insertData = {
        id: userId,
        email: data.email,
        name: data.name || '',
        age: 18, // Will be updated during onboarding
        gender: 'other' as const, // Will be updated during onboarding
        looking_for: [] as string[], // Will be updated during onboarding
      };

      const { error: insertError } = await withRetryAndFallback(
        () => supabase.from('profiles').insert(insertData),
        (token) => directInsert('profiles', insertData, undefined, token),
        undefined,
        authToken
      );

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Error in createOrUpdateProfile:', error);
    return { error: error as Error };
  }
};
