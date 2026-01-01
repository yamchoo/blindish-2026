/**
 * Cannabis Question Screen
 * Question 3 of 6: Do you use cannabis?
 */

import React, { useState } from 'react';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const OPTIONS: Option[] = [
  { value: 'no', label: 'Never' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'yes', label: 'Regularly' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', description: 'This will reduce the accuracy of our AI matchmaker' },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'no':
      return 'Clean living! ✨';
    case 'sometimes':
      return 'All good! 🌟';
    case 'yes':
      return 'Cool! 💚';
    case 'prefer_not_to_say':
      return 'Privacy respected! 🔒';
    default:
      return 'Got it! ✨';
  }
};

export default function CannabisQuestion() {
  const { marijuana, setMarijuana } = useLifestyleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setMarijuana(value);

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
    router.push('/(onboarding)/lifestyle/religion');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="🌿"
      title="Do you use cannabis?"
      description="Finding compatible matches means understanding lifestyle choices"
      progress={3 / 6}
      totalQuestions={6}
      currentQuestion={3}
      canContinue={!!marijuana}
      onContinue={handleContinue}
      onBack={handleBack}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={marijuana}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
