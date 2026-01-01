/**
 * Politics Question Screen
 * Question 5 of 6: What are your political views?
 */

import React, { useState } from 'react';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const OPTIONS: Option[] = [
  { value: 'Liberal', label: 'Liberal' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Conservative', label: 'Conservative' },
  { value: 'Not Political', label: 'Not Political' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say', description: 'This will reduce the accuracy of our AI matchmaker' },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'Liberal':
      return 'Forward thinking! 💙';
    case 'Moderate':
      return 'Balanced perspective! 💜';
    case 'Conservative':
      return 'Values matter! ❤️';
    case 'Not Political':
      return "That's okay too! ✨";
    case 'Other':
      return 'Unique perspective! 🌟';
    case 'Prefer not to say':
      return 'Privacy respected! 🔒';
    default:
      return 'Got it! ✨';
  }
};

export default function PoliticsQuestion() {
  const { politics, setPolitics } = useLifestyleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setPolitics(value);

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
    router.push('/(onboarding)/lifestyle/kids');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="🗳️"
      title="What are your political views?"
      description="Optional - helps match you with like-minded individuals"
      progress={5 / 6}
      totalQuestions={6}
      currentQuestion={5}
      canContinue={!!politics}
      onContinue={handleContinue}
      onBack={handleBack}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={politics}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
