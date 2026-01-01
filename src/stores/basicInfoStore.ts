/**
 * Basic Info Store
 * Manages state for the 5-screen basic info onboarding flow
 */

import { create } from 'zustand';
import { supabase, withRetryAndFallback, directUpsert } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { useAuthStore } from './authStore';

export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type LookingFor = 'male' | 'female' | 'non-binary' | 'everyone';

interface BasicInfoState {
  // Form data
  name: string;
  dateOfBirth: Date | null;
  gender: Gender | '';
  lookingFor: LookingFor[];
  occupation: string;
  height: number | null; // Height in centimeters

  // Actions
  setName: (name: string) => void;
  setDateOfBirth: (date: Date | null) => void;
  setGender: (gender: Gender | '') => void;
  setLookingFor: (lookingFor: LookingFor[]) => void;
  setOccupation: (occupation: string) => void;
  setHeight: (height: number | null) => void;

  // Validation
  validateName: () => string | null;
  validateAge: () => string | null;

  // Database operations
  saveToDatabase: () => Promise<{ success: boolean; error?: Error }>;

  // Reset
  reset: () => void;
}

// Helper: Calculate age from date of birth
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const useBasicInfoStore = create<BasicInfoState>((set, get) => ({
  // Initial state
  name: '',
  dateOfBirth: null,
  gender: '',
  lookingFor: [],
  occupation: '',
  height: null,

  // Setters
  setName: (name) => set({ name }),
  setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
  setGender: (gender) => set({ gender }),
  setLookingFor: (lookingFor) => set({ lookingFor }),
  setOccupation: (occupation) => set({ occupation }),
  setHeight: (height) => set({ height }),

  // Validation
  validateName: () => {
    const { name } = get();
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    return null;
  },

  validateAge: () => {
    const { dateOfBirth } = get();
    if (!dateOfBirth) {
      return 'Please select your birthday';
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      return 'You must be at least 18 years old';
    }
    if (age > 100) {
      return 'Please enter a valid birthday';
    }

    return null;
  },

  // Database save operation
  saveToDatabase: async () => {
    const state = get();
    const authState = useAuthStore.getState();
    const user = authState.user;

    if (!user) {
      return {
        success: false,
        error: new Error('User not found. Please sign in again.'),
      };
    }

    // Validate before saving
    const nameError = state.validateName();
    const ageError = state.validateAge();
    if (nameError || ageError) {
      return {
        success: false,
        error: new Error(nameError || ageError || 'Validation failed'),
      };
    }

    if (!state.gender) {
      return {
        success: false,
        error: new Error('Please select your gender'),
      };
    }

    if (state.lookingFor.length === 0) {
      return {
        success: false,
        error: new Error('Please select who you\'re looking for'),
      };
    }

    // Set operation in progress to prevent navigation redirects
    authState.setOperationInProgress(true);

    try {
      // Convert lookingFor to gender array (map "everyone" to all genders)
      let lookingForArray: string[] = [];
      if (state.lookingFor.includes('everyone')) {
        lookingForArray = ['male', 'female', 'non-binary', 'other'];
      } else {
        lookingForArray = state.lookingFor;
      }

      const calculatedAge = state.dateOfBirth ? calculateAge(state.dateOfBirth) : 0;

      const profileData = {
        id: user.id,
        email: user.email || '',
        name: state.name.trim(),
        age: calculatedAge,
        date_of_birth: state.dateOfBirth?.toISOString().split('T')[0],
        gender: state.gender,
        looking_for: lookingForArray,
        occupation: state.occupation.trim() || null,
        height_cm: state.height || null,
        onboarding_step: 1,
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      };

      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      // Use retry/fallback pattern: try Supabase client first, fall back to direct API if needed
      const { error } = await withRetryAndFallback(
        // Primary operation: Use Supabase client
        () =>
          supabase.from('profiles').upsert(profileData, {
            onConflict: 'id',
          }),
        // Fallback operation: Use direct REST API
        (token) =>
          directUpsert(
            'profiles',
            profileData,
            {
              onConflict: 'id',
            },
            token
          ),
        undefined,
        authToken
      );

      if (error) {
        authState.setOperationInProgress(false);
        return {
          success: false,
          error: new Error(`Failed to save your information: ${error.message}`),
        };
      }

      // Refresh profile (non-blocking - continue even if it fails)
      authState.refreshProfile().catch((refreshError) => {
        console.warn('Profile refresh failed, but continuing:', refreshError);
      });

      authState.setOperationInProgress(false);

      return { success: true };
    } catch (error) {
      authState.setOperationInProgress(false);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Something went wrong'),
      };
    }
  },

  // Reset all fields
  reset: () =>
    set({
      name: '',
      dateOfBirth: null,
      gender: '',
      lookingFor: [],
      occupation: '',
      height: null,
    }),
}));
