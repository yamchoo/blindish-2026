/**
 * Affection Expression Question Screen
 * Question 2 of 3: How do you feel most loved?
 */

import React, { useState } from 'react';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useCommunicationStyleStore } from '@/stores/communicationStyleStore';

const OPTIONS: Option[] = [
  {
    value: 'words',
    label: 'Words of affirmation',
    description: 'Compliments, "I love you," verbal appreciation',
  },
  {
    value: 'quality_time',
    label: 'Quality time',
    description: 'Undivided attention, meaningful conversations',
  },
  {
    value: 'gifts',
    label: 'Receiving gifts',
    description: 'Thoughtful presents that show you were thinking of them',
  },
  {
    value: 'acts_of_service',
    label: 'Acts of service',
    description: 'Helpful actions, doing things to ease their burden',
  },
  {
    value: 'physical_touch',
    label: 'Physical touch',
    description: 'Hugs, kisses, holding hands, closeness',
  },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'words':
      return 'You value verbal love! 💬';
    case 'quality_time':
      return 'Presence matters! ⏰';
    case 'gifts':
      return 'Thoughtful gestures! 🎁';
    case 'acts_of_service':
      return 'Actions speak louder! 🤝';
    case 'physical_touch':
      return 'Touch is your language! 🤗';
    default:
      return 'Got it! ✨';
  }
};

export default function AffectionExpressionQuestion() {
  const { affection_expression, setAffectionExpression } = useCommunicationStyleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setAffectionExpression(value);

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
    router.push('/(onboarding)/communication/communication-preference');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="💝"
      title="You feel most loved when your partner:"
      description="Understanding love languages helps create deeper connections"
      progress={2 / 3}
      totalQuestions={3}
      currentQuestion={2}
      canContinue={!!affection_expression}
      onContinue={handleContinue}
      onBack={handleBack}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={affection_expression}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
