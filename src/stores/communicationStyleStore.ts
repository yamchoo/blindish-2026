/**
 * Communication Style Store
 * Manages state for communication style questions during onboarding
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

interface CommunicationStyleState {
  conflict_resolution: string | null;
  affection_expression: string | null;
  communication_preference: string | null;

  setConflictResolution: (value: string) => void;
  setAffectionExpression: (value: string) => void;
  setCommunicationPreference: (value: string) => void;
  reset: () => void;

  // Save to database
  saveToDatabase: () => Promise<{ success: boolean; error?: Error }>;

  // Helper to get all responses as object for saving
  getCommunicationStyle: () => {
    conflict_resolution: string | null;
    affection_expression: string | null;
    communication_preference: string | null;
  };
}

export const useCommunicationStyleStore = create<CommunicationStyleState>((set, get) => ({
  conflict_resolution: null,
  affection_expression: null,
  communication_preference: null,

  setConflictResolution: (value) => set({ conflict_resolution: value }),
  setAffectionExpression: (value) => set({ affection_expression: value }),
  setCommunicationPreference: (value) => set({ communication_preference: value }),

  reset: () =>
    set({
      conflict_resolution: null,
      affection_expression: null,
      communication_preference: null,
    }),

  // Save communication style data to database (called from final question)
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
      // Prepare communication style data as JSONB
      const communicationStyleData = {
        conflict_resolution: state.conflict_resolution,
        affection_expression: state.affection_expression,
        communication_preference: state.communication_preference,
      };

      console.log('Saving communication style:', communicationStyleData);

      // Update profile with communication_style
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          communication_style: communicationStyleData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Failed to save communication style:', profileError);
        throw profileError;
      }

      console.log('Communication style saved successfully');

      // Refresh profile to get updated data
      await refreshProfile();

      // Clear operation in progress
      setOperationInProgress(false);

      return { success: true };
    } catch (error) {
      console.error('Error saving communication style:', error);
      setOperationInProgress(false);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  },

  getCommunicationStyle: () => ({
    conflict_resolution: get().conflict_resolution,
    affection_expression: get().affection_expression,
    communication_preference: get().communication_preference,
  }),
}));
