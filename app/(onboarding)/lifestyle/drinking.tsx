/**
 * Drinking Question Screen
 * Question 1 of 6: How often do you drink?
 */

import React, { useState } from 'react';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const OPTIONS: Option[] = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', description: 'This will reduce the accuracy of our AI matchmaker' },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'never':
      return 'Healthy choice! 🌟';
    case 'rarely':
      return 'Balance is key! ✨';
    case 'socially':
      return 'Cheers to balance! 🥂';
    case 'regularly':
      return 'You do you! ✨';
    case 'prefer_not_to_say':
      return 'Privacy respected! 🔒';
    default:
      return 'Got it! ✨';
  }
};

export default function DrinkingQuestion() {
  const { drinking, setDrinking } = useLifestyleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setDrinking(value);

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
    router.push('/(onboarding)/lifestyle/smoking');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="🍷"
      title="How often do you drink?"
      description="This helps us match you with people who share similar social habits"
      progress={1 / 6}
      totalQuestions={6}
      currentQuestion={1}
      canContinue={!!drinking}
      onContinue={handleContinue}
      onBack={handleBack}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={drinking}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
