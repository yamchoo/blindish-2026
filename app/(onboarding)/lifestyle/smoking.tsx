/**
 * Smoking Question Screen
 * Question 2 of 6: Do you smoke?
 */

import React, { useState } from 'react';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const OPTIONS: Option[] = [
  { value: 'never', label: 'Never' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'regularly', label: 'Regularly' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', description: 'This will reduce the accuracy of our AI matchmaker' },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'never':
      return 'Fresh air lover! 🌬️';
    case 'sometimes':
      return 'Occasional is okay! ✨';
    case 'regularly':
      return 'Noted! 💭';
    case 'prefer_not_to_say':
      return 'Privacy respected! 🔒';
    default:
      return 'Got it! ✨';
  }
};

export default function SmokingQuestion() {
  const { smoking, setSmoking } = useLifestyleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setSmoking(value);

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
    router.push('/(onboarding)/lifestyle/cannabis');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="🚭"
      title="Do you smoke?"
      description="We'll prioritize matches who align with your preferences"
      progress={2 / 6}
      totalQuestions={6}
      currentQuestion={2}
      canContinue={!!smoking}
      onContinue={handleContinue}
      onBack={handleBack}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={smoking}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
