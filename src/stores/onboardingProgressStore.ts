/**
 * Onboarding Progress Store
 * Tracks global progress across all onboarding screens
 */

import { create } from 'zustand';

// Section definitions with step counts
export const ONBOARDING_SECTIONS = {
  welcome: { steps: 1, startStep: 0 },
  basicInfo: { steps: 5, startStep: 1 },
  lifestyleIntro: { steps: 1, startStep: 6 },
  lifestyle: { steps: 6, startStep: 7 },
  integration: { steps: 1, startStep: 13 },
  analysis: { steps: 1, startStep: 14 },
  personalityResults: { steps: 1, startStep: 15 },
  photos: { steps: 1, startStep: 16 },
  consent: { steps: 1, startStep: 17 },
  completion: { steps: 1, startStep: 18 },
} as const;

export type OnboardingSection = keyof typeof ONBOARDING_SECTIONS;

// Total steps calculation
export const TOTAL_ONBOARDING_STEPS = Object.values(ONBOARDING_SECTIONS).reduce(
  (sum, section) => sum + section.steps,
  0
);

// Milestone thresholds for celebrations
export const MILESTONES = [25, 50, 75, 100] as const;
export type Milestone = typeof MILESTONES[number];

interface OnboardingProgressState {
  currentStep: number;
  currentSection: OnboardingSection | null;
  completedMilestones: Milestone[];

  // Actions
  setStep: (step: number) => void;
  incrementStep: () => void;
  setSection: (section: OnboardingSection) => void;
  markMilestoneComplete: (milestone: Milestone) => void;

  // Computed values
  getPercentComplete: () => number;
  getSectionProgress: (section: OnboardingSection) => {
    current: number;
    total: number;
    sectionStep: number;
  };
  getCurrentSectionProgress: () => {
    current: number;
    total: number;
    sectionStep: number;
  } | null;
  shouldShowMilestone: () => Milestone | null;

  // Reset
  reset: () => void;
}

export const useOnboardingProgressStore = create<OnboardingProgressState>((set, get) => ({
  currentStep: 0,
  currentSection: null,
  completedMilestones: [],

  setStep: (step: number) => {
    const clampedStep = Math.max(0, Math.min(step, TOTAL_ONBOARDING_STEPS));
    set({ currentStep: clampedStep });
  },

  incrementStep: () => {
    const { currentStep } = get();
    get().setStep(currentStep + 1);
  },

  setSection: (section: OnboardingSection) => {
    const sectionConfig = ONBOARDING_SECTIONS[section];
    set({
      currentSection: section,
      currentStep: sectionConfig.startStep,
    });
  },

  markMilestoneComplete: (milestone: Milestone) => {
    set((state) => ({
      completedMilestones: [...state.completedMilestones, milestone],
    }));
  },

  getPercentComplete: () => {
    const { currentStep } = get();
    return Math.round((currentStep / TOTAL_ONBOARDING_STEPS) * 100);
  },

  getSectionProgress: (section: OnboardingSection) => {
    const { currentStep } = get();
    const sectionConfig = ONBOARDING_SECTIONS[section];
    const sectionStart = sectionConfig.startStep;
    const sectionEnd = sectionStart + sectionConfig.steps;

    // Calculate current position within section (1-indexed for display)
    const sectionStep = Math.max(
      1,
      Math.min(
        currentStep - sectionStart + 1,
        sectionConfig.steps
      )
    );

    return {
      current: currentStep,
      total: TOTAL_ONBOARDING_STEPS,
      sectionStep,
    };
  },

  getCurrentSectionProgress: () => {
    const { currentSection } = get();
    if (!currentSection) return null;
    return get().getSectionProgress(currentSection);
  },

  shouldShowMilestone: () => {
    const { completedMilestones } = get();
    const percentComplete = get().getPercentComplete();

    // Check if we've hit a milestone that hasn't been shown yet
    for (const milestone of MILESTONES) {
      if (
        percentComplete >= milestone &&
        !completedMilestones.includes(milestone)
      ) {
        return milestone;
      }
    }

    return null;
  },

  reset: () => {
    set({
      currentStep: 0,
      currentSection: null,
      completedMilestones: [],
    });
  },
}));

/**
 * Helper hook to get section-specific progress for QuestionScreen
 */
export function useSectionProgress(section: OnboardingSection) {
  const progress = useOnboardingProgressStore((state) =>
    state.getSectionProgress(section)
  );
  const sectionConfig = ONBOARDING_SECTIONS[section];

  return {
    currentStep: progress.sectionStep,
    totalSteps: sectionConfig.steps,
    globalProgress: (progress.current / TOTAL_ONBOARDING_STEPS) * 100,
  };
}

/**
 * Helper to get milestone celebration message
 */
export function getMilestoneMessage(milestone: Milestone): string {
  switch (milestone) {
    case 25:
      return "Quarter way there! 🎉";
    case 50:
      return "Halfway done! You're doing great! 🌟";
    case 75:
      return "Almost there! 💪";
    case 100:
      return "You did it! 🎊";
    default:
      return "Great progress! ✨";
  }
}
