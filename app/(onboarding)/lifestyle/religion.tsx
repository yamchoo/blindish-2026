/**
 * Religion Question Screen
 * Question 4 of 6: What is your religion?
 */

import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { QuestionScreen, MultipleSelect, type Option } from '@/components/onboarding';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const OPTIONS: Option[] = [
  { value: 'Agnostic', label: 'Agnostic' },
  { value: 'Atheist', label: 'Atheist' },
  { value: 'Buddhist', label: 'Buddhist' },
  { value: 'Catholic', label: 'Catholic' },
  { value: 'Christian', label: 'Christian' },
  { value: 'Hindu', label: 'Hindu' },
  { value: 'Jewish', label: 'Jewish' },
  { value: 'Muslim', label: 'Muslim' },
  { value: 'Sikh', label: 'Sikh' },
  { value: 'Spiritual', label: 'Spiritual' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say', description: 'This will reduce the accuracy of our AI matchmaker' },
];

const getCelebrationMessage = (selections: string[]): string => {
  if (selections.includes('Prefer not to say')) {
    return 'Privacy respected! 🔒';
  }
  if (selections.length > 1) {
    return 'Spiritual diversity! 🙏';
  }
  if (selections.length === 1) {
    return 'Beautiful faith! 💫';
  }
  return 'That works too! ✨';
};

export default function ReligionQuestion() {
  const { religion, setReligion } = useLifestyleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Show celebration when selections change
  useEffect(() => {
    if (religion.length > 0) {
      const message = getCelebrationMessage(religion);
      setCelebrationMessage(message);
      setShowCelebration(true);

      // Hide celebration after 1.5s
      const timeout = setTimeout(() => {
        setShowCelebration(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [religion]);

  const handleContinue = () => {
    router.push('/(onboarding)/lifestyle/politics');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="✨"
      title="What is your religion?"
      description="You can select multiple that resonate with you"
      progress={4 / 6}
      totalQuestions={6}
      currentQuestion={4}
      canContinue={religion.length > 0}
      onContinue={handleContinue}
      onBack={handleBack}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleSelect
        options={OPTIONS}
        selected={religion}
        onSelect={setReligion}
      />
    </QuestionScreen>
  );
}
