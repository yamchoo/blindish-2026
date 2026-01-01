/**
 * Lifestyle Store
 * State management for lifestyle questions during onboarding
 */

import { create } from 'zustand';
import { supabase, withRetryAndFallback, directUpdate } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { useAuthStore } from './authStore';

/**
 * Map onboarding kids values to database values
 * Onboarding uses granular values, database uses simplified yes/no/maybe
 */
function mapKidsValue(onboardingValue: string): string {
  const mapping: Record<string, string> = {
    'want': 'yes',
    'dont_want': 'no',
    'maybe': 'maybe',
    'have_want_more': 'yes',
    'have_open_to_more': 'maybe',
    'have_dont_want_more': 'no',
    'prefer_not_to_say': 'maybe', // Treat as neutral for matching
  };
  return mapping[onboardingValue] || onboardingValue;
}

/**
 * Map onboarding marijuana values to database values
 * Onboarding: "no", "sometimes", "yes", "prefer_not_to_say"
 * Database: "never", "rarely", "socially", "regularly"
 */
function mapMarijuanaValue(onboardingValue: string): string {
  const mapping: Record<string, string> = {
    'no': 'never',
    'sometimes': 'socially',
    'yes': 'regularly',
    'prefer_not_to_say': 'rarely', // Treat as neutral
  };
  return mapping[onboardingValue] || onboardingValue;
}

/**
 * Map onboarding politics values to database values
 * Onboarding: "Liberal", "Moderate", "Conservative", "Not Political", "Other", "Prefer not to say"
 * Database: "liberal", "moderate", "conservative", "apolitical"
 */
function mapPoliticsValue(onboardingValue: string): string {
  const mapping: Record<string, string> = {
    'Liberal': 'liberal',
    'Moderate': 'moderate',
    'Conservative': 'conservative',
    'Not Political': 'apolitical',
    'Other': 'moderate', // Treat as neutral
    'Prefer not to say': 'moderate', // Treat as neutral
  };
  return mapping[onboardingValue] || onboardingValue.toLowerCase();
}

interface LifestyleState {
  // Questions
  wantsKids: string;
  drinking: string;
  smoking: string;
  marijuana: string;
  religion: string[];
  politics: string;

  // Actions
  setWantsKids: (value: string) => void;
  setDrinking: (value: string) => void;
  setSmoking: (value: string) => void;
  setMarijuana: (value: string) => void;
  setReligion: (values: string[]) => void;
  setPolitics: (value: string) => void;

  // Save to database
  saveToDatabase: () => Promise<{ success: boolean; error?: Error }>;

  // Reset
  reset: () => void;
}

export const useLifestyleStore = create<LifestyleState>((set, get) => ({
  // Initial state
  wantsKids: '',
  drinking: '',
  smoking: '',
  marijuana: '',
  religion: [],
  politics: '',

  // Setters
  setWantsKids: (value) => set({ wantsKids: value }),
  setDrinking: (value) => set({ drinking: value }),
  setSmoking: (value) => set({ smoking: value }),
  setMarijuana: (value) => set({ marijuana: value }),
  setReligion: (values) => set({ religion: values }),
  setPolitics: (value) => set({ politics: value }),

  // Save to database (called from final question)
  saveToDatabase: async () => {
    const state = get();
    const { user, refreshProfile, setOperationInProgress } = useAuthStore.getState();

    if (!user) {
      return {
        success: false,
        error: new Error('User not found. Please sign in again.'),
      };
    }

    // Set operation in progress to prevent navigation redirects
    setOperationInProgress(true);

    try {
      // Prepare lifestyle data for profiles table
      const lifestyleData: any = {
        onboarding_step: 2,
        updated_at: new Date().toISOString(),
      };

      if (state.wantsKids) {
        lifestyleData.wants_kids = mapKidsValue(state.wantsKids);
      }

      if (state.drinking) {
        lifestyleData.drinking = state.drinking;
      }

      if (state.smoking) {
        lifestyleData.smoking = state.smoking;
      }

      if (state.marijuana) {
        lifestyleData.marijuana_use = mapMarijuanaValue(state.marijuana);
      }

      if (state.religion.length > 0) {
        lifestyleData.religion = state.religion;
      }

      if (state.politics) {
        lifestyleData.politics = mapPoliticsValue(state.politics);
      }

      console.log('Saving lifestyle preferences:', lifestyleData);

      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      // Use retry/fallback pattern to update profile
      const { error: profileError } = await withRetryAndFallback(
        // Primary operation: Use Supabase client
        () => supabase.from('profiles').update(lifestyleData).eq('id', user.id),
        // Fallback operation: Use direct REST API
        (token) =>
          directUpdate('profiles', lifestyleData, [
            { column: 'id', operator: 'eq', value: user.id },
          ], token),
        undefined,
        authToken
      );

      if (profileError) {
        console.error('Error updating profile with lifestyle data:', profileError);
        setOperationInProgress(false);
        return {
          success: false,
          error: new Error(`Failed to save preferences: ${profileError.message}`),
        };
      }

      // Refresh profile
      console.log('Refreshing profile...');
      await refreshProfile();

      console.log('Lifestyle preferences saved successfully');

      setOperationInProgress(false);
      return { success: true };
    } catch (error) {
      console.error('Error in saveToDatabase:', error);
      setOperationInProgress(false);
      return {
        success: false,
        error: error as Error,
      };
    }
  },

  // Reset
  reset: () =>
    set({
      wantsKids: '',
      drinking: '',
      smoking: '',
      marijuana: '',
      religion: [],
      politics: '',
    }),
}));
