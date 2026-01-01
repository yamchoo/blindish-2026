/**
 * Conflict Resolution Question Screen
 * Question 1 of 3: How do you handle disagreements?
 */

import React, { useState } from 'react';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useCommunicationStyleStore } from '@/stores/communicationStyleStore';

const OPTIONS: Option[] = [
  {
    value: 'talk_immediately',
    label: 'Talk it out immediately',
    description: 'Address issues head-on as they arise',
  },
  {
    value: 'need_space',
    label: 'Need space to think first',
    description: 'Process emotions before discussing',
  },
  {
    value: 'avoid_conflict',
    label: 'Avoid confrontation',
    description: 'Prefer to let things settle naturally',
  },
  {
    value: 'seek_compromise',
    label: 'Seek compromise quickly',
    description: 'Focus on finding middle ground fast',
  },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'talk_immediately':
      return 'Direct communication! 💬';
    case 'need_space':
      return 'Thoughtful approach! 🧘';
    case 'avoid_conflict':
      return 'Peaceful vibes! ✨';
    case 'seek_compromise':
      return 'Win-win mindset! 🤝';
    default:
      return 'Got it! ✨';
  }
};

export default function ConflictResolutionQuestion() {
  const { conflict_resolution, setConflictResolution } = useCommunicationStyleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setConflictResolution(value);

    // Show celebration
    const message = getCelebrationMessage(value);
    setCelebrationMessage(message);
    setShowCelebration(true);

    // Hide celebration after 1.5s
    setTimeout(() => {
      setShowCelebration(false);
    }, 1500);
  };

  const handleContinue = () => {
    router.push('/(onboarding)/communication/affection-expression');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="💭"
      title="When you disagree with a partner, you typically:"
      description="Understanding conflict styles helps find compatible communication matches"
      progress={1 / 3}
      totalQuestions={3}
      currentQuestion={1}
      canContinue={!!conflict_resolution}
      onContinue={handleContinue}
      onBack={handleBack}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={conflict_resolution}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
